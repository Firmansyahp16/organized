import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import {Events} from '../models';
import {
  BranchRepository,
  EventsRepository,
  ExaminationsRepository,
  SchedulesRepository,
} from '../repositories';
import {MyUserProfile} from '../services/user.service';

export class EventsController {
  constructor(
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
    @repository(ExaminationsRepository)
    public examinationsRepository: ExaminationsRepository,
    @repository(SchedulesRepository)
    public schedulesRepository: SchedulesRepository,
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
  ) {}

  @authenticate('jwt')
  @post('/Events')
  @response(200, {
    description: 'Events model instance',
    content: {'application/json': {schema: getModelSchemaRef(Events)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {
            title: 'NewEvents',
            exclude: ['id'],
          }),
        },
      },
    })
    events: Omit<Events, 'id'>,
  ): Promise<Events> {
    return this.eventsRepository.create(events);
  }

  @authenticate('jwt')
  @get('/Events/count')
  @response(200, {
    description: 'Events model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Events) where?: Where<Events>): Promise<Count> {
    return this.eventsRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Events')
  @response(200, {
    description: 'Array of Events model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Events, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Events) filter?: Filter<Events>): Promise<Events[]> {
    return this.eventsRepository.find(filter);
  }

  @authenticate('jwt')
  @patch('/Events')
  @response(200, {
    description: 'Events PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {partial: true}),
        },
      },
    })
    events: Events,
    @param.where(Events) where?: Where<Events>,
  ): Promise<Count> {
    return this.eventsRepository.updateAll(events, where);
  }

  @authenticate('jwt')
  @get('/Events/{id}')
  @response(200, {
    description: 'Events model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Events, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Events, {exclude: 'where'})
    filter?: FilterExcludingWhere<Events>,
  ): Promise<Events> {
    return this.eventsRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Events/{id}')
  @response(204, {
    description: 'Events PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Events, {partial: true}),
        },
      },
    })
    events: Events,
  ): Promise<void> {
    await this.eventsRepository.updateById(id, events);
  }

  @authenticate('jwt')
  @del('/Events/{id}')
  @response(204, {
    description: 'Events DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.eventsRepository.deleteById(id);
  }

  @authenticate('jwt')
  @get('/Events/{id}/branchParticipated')
  @response(200, {
    description: 'Events model instance',
  })
  async branchParticipated(@param.path.string('id') id: string) {
    const result: {
      [branchId: string]: {
        id: string;
        name: string;
        rank: string;
      }[];
    } = {};
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new HttpErrors.NotFound('Event not found');
    }
    for (const branchId of event?.branchIds || []) {
      const branch = await this.branchRepository.findById(branchId);
      if (!branch) {
        throw new HttpErrors.NotFound('Branch not found');
      }
      const member = await this.branchRepository.findMembers(branchId);
      if (!member) {
        throw new HttpErrors.NotFound('Member not found');
      }
      result[branchId] = member.map(m => ({
        id: String(m.id),
        name: String(m.fullName),
        rank: String(m.rank),
      }));
    }
    return result;
  }

  @authenticate('jwt')
  @post('/Events/{id}/setParticipants')
  @response(204, {
    description: 'Events model instance',
  })
  async setParticipants(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      participants: {
        id: string;
        rank: string;
      }[];
    },
  ): Promise<Boolean> {
    const {participants} = requestBody;
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new HttpErrors.NotFound('Event not found');
    }
    await this.eventsRepository.updateById(id, {
      participants: participants,
    });
    return true;
  }

  @authenticate('jwt')
  @post('/Events/{id}/setExaminers')
  @response(204, {
    description: 'Events model instance',
  })
  async setExaminers(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      examiners: string[];
    },
  ): Promise<Boolean> {
    const {examiners} = requestBody;
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new HttpErrors.NotFound('Event not found');
    }
    await this.eventsRepository.updateById(id, {
      examiners: examiners,
    });
    return true;
  }

  @authenticate('jwt')
  @post('/Events/{id}/setResults')
  @response(204, {
    description: 'Events model instance',
  })
  async setResults(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      [userId: string]: {
        kihon: string;
        kata: string;
        kumite: string;
      };
    },
  ): Promise<Boolean> {
    const event = await this.eventsRepository.findById(id);

    if (!event) {
      throw new HttpErrors.NotFound('Event not found');
    }

    if (event.type !== 'examinations') {
      throw new HttpErrors.BadRequest('Event type must be "exam"');
    }

    const participants: string[] = (event.participants ?? []).map(p => p.id);
    const results = event.results ?? {};

    for (const [userId, categories] of Object.entries(requestBody)) {
      const {kihon, kata, kumite} = categories;
      const result = this.examinationsRepository.calculateResult(
        kihon,
        kata,
        kumite,
      );
      results[userId] = {kihon, kata, kumite, result};
    }

    await this.eventsRepository.updateById(id, {
      results: results,
    });

    const allHaveResult = participants.every(pid => results[pid]);

    if (allHaveResult) {
      for (const pid of participants) {
        await this.examinationsRepository.updateRank(
          pid,
          String(results[pid]?.result),
        );
      }
    }

    return true;
  }

  @authenticate('jwt')
  @post('/Events/{id}/setAttendance')
  @response(200)
  async setAttendance(
    @param.path.string('id') id: string,
    @requestBody() requestBody: {id: string; status: string}[],
  ): Promise<Boolean> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new HttpErrors.NotFound('Event not found');
    }
    if (event.type !== 'schedules') {
      throw new HttpErrors.BadRequest('Event type must be "schedules"');
    }
    try {
      const attendanceData = requestBody;
      const attendance = await this.eventsRepository.attendances(id).create({
        details: attendanceData,
        eventsId: id,
      });
      if (!attendance) {
        throw new HttpErrors.BadRequest('Attendance not created');
      }
      return true;
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }
}
