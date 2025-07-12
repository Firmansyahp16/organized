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
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import {Examinations} from '../models';
import {
  BranchRepository,
  ExaminationsRepository,
  SchedulesRepository,
  UsersRepository,
} from '../repositories';
import {AuthorizationService} from '../services/authorization.service';
import {MyUserProfile} from '../services/user.service';

export class ExaminationsController {
  constructor(
    @repository(ExaminationsRepository)
    public examinationsRepository: ExaminationsRepository,
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
    @repository(SchedulesRepository)
    public schedulesRepository: SchedulesRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {}

  @authenticate('jwt')
  @post('/Examinations')
  @response(200, {
    description: 'Examinations model instance',
    content: {'application/json': {schema: getModelSchemaRef(Examinations)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Examinations, {
            title: 'NewExaminations',
            exclude: ['id'],
          }),
        },
      },
    })
    examinations: Omit<Examinations, 'id'>,
  ): Promise<Examinations> {
    return this.examinationsRepository.create(examinations);
  }

  @authenticate('jwt')
  @get('/Examinations/count')
  @response(200, {
    description: 'Examinations model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Examinations) where?: Where<Examinations>,
  ): Promise<Count> {
    return this.examinationsRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Examinations')
  @response(200, {
    description: 'Array of Examinations model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Examinations, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Examinations) filter?: Filter<Examinations>,
  ): Promise<Examinations[]> {
    return this.examinationsRepository.find(filter);
  }

  // @authenticate('jwt')
  // @patch('/Examinations')
  // @response(200, {
  //   description: 'Examinations PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Examinations, {partial: true}),
  //       },
  //     },
  //   })
  //   examinations: Examinations,
  //   @param.where(Examinations) where?: Where<Examinations>,
  // ): Promise<Count> {
  //   return this.examinationsRepository.updateAll(examinations, where);
  // }

  @authenticate('jwt')
  @get('/Examinations/{id}')
  @response(200, {
    description: 'Examinations model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Examinations, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Examinations, {exclude: 'where'})
    filter?: FilterExcludingWhere<Examinations>,
  ): Promise<Examinations> {
    return this.examinationsRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Examinations/{id}')
  @response(204, {
    description: 'Examinations PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Examinations, {partial: true}),
        },
      },
    })
    examinations: Examinations,
  ): Promise<void> {
    await this.examinationsRepository.updateById(id, examinations);
  }

  @authenticate('jwt')
  @put('/Examinations/{id}')
  @response(204, {
    description: 'Examinations PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() examinations: Examinations,
  ): Promise<void> {
    await this.examinationsRepository.replaceById(id, examinations);
  }

  @authenticate('jwt')
  @del('/Examinations/{id}')
  @response(204, {
    description: 'Examinations DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.examinationsRepository.deleteById(id);
  }

  @authenticate('jwt')
  @get('/Examinations/{id}/participants')
  @response(200, {
    description: 'Array of Examinations model instances',
  })
  async findExaminationsByBranchId(
    @param.path.string('id') id: string,
  ): Promise<Record<string, any>[]> {
    const examination = await this.examinationsRepository.findById(id);
    const participants = examination.participants || [];
    const result: Record<string, any>[] = [];
    for (const participant of participants) {
      const user = await this.usersRepository.findById(participant.id);
      result.push({
        id: participant.id,
        rank: participant.rank,
        fullName: user.fullName,
      });
    }
    return result;
  }

  @authenticate('jwt')
  @post('/Examinations/{id}/setParticipants')
  @response(200, {
    description: 'Set Participants for Examination',
  })
  async setParticipants(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      auto: boolean;
      participants?: string[];
    },
  ): Promise<boolean> {
    const {auto, participants} = requestBody;

    const examination = await this.examinationsRepository.findById(id);
    const examDate = new Date(examination.createdAt ?? new Date());
    const branchId = examination.branchId;

    if (!branchId) {
      throw new HttpErrors.BadRequest('Examination must have a branchId.');
    }

    if (!this.authorizationService.isCoachOfBranch(this.user, branchId)) {
      throw new HttpErrors.Forbidden(
        "You cannot set examination's participants",
      );
    }

    const allUsers = await this.usersRepository.find();

    const allExams = await this.examinationsRepository.find({
      where: {createdAt: {lt: examDate}},
      order: ['createdAt DESC'],
    });

    const lastExamMap: {[userId: string]: Date} = {};
    for (const exam of allExams) {
      const examParticipants = (exam.participants ?? []) as {id: string}[];
      for (const p of examParticipants) {
        if (!lastExamMap[p.id]) {
          lastExamMap[p.id] = new Date(exam.createdAt ?? new Date(0));
        }
      }
    }

    const branch = await this.branchRepository.findById(branchId);
    if (!branch) throw new HttpErrors.NotFound('Branch not found');

    const branchMembers = allUsers.filter(user =>
      user.branchRoles?.some(
        br => br.branchId === branchId && br.roles?.includes('member'),
      ),
    );

    const branchCoaches = allUsers
      .filter(user =>
        user.branchRoles?.some(
          br => br.branchId === branchId && br.roles?.includes('coach'),
        ),
      )
      .map(user => user.id);

    const allSchedules = await this.schedulesRepository.find({
      where: {branchId},
      include: ['attendances'],
    });

    const attendanceMap: {[userId: string]: number} = {};
    for (const schedule of allSchedules) {
      const scheduleDate = new Date(schedule.date ?? new Date());
      if (scheduleDate > examDate) continue;

      const details = schedule.attendances?.details ?? [];

      for (const detail of details) {
        const lastExamDate = lastExamMap[detail.id] ?? new Date(0);
        if (
          detail.status === 'present' &&
          !branchCoaches.includes(detail.id) &&
          scheduleDate >= lastExamDate &&
          scheduleDate <= examDate
        ) {
          attendanceMap[detail.id] = (attendanceMap[detail.id] ?? 0) + 1;
        }
      }
    }

    const schedulesInRange = allSchedules.filter(s => {
      const date = new Date(s.date ?? new Date());
      return date <= examDate;
    });

    const totalSchedules = schedulesInRange.length;

    let finalParticipants: {id: string; rank: string}[] = [];

    if (auto) {
      const qualified = branchMembers.filter(member => {
        const present = attendanceMap[String(member.id)] ?? 0;
        const ratio = (present + 4) / (totalSchedules + 4);
        return ratio >= 0.8;
      });

      finalParticipants = qualified.map(q => ({
        id: String(q.id),
        rank: String(q.rank),
      }));
    } else if (participants) {
      const selected = allUsers.filter(u =>
        participants.includes(String(u.id)),
      );
      finalParticipants = selected.map(m => ({
        id: String(m.id),
        rank: String(m.rank),
      }));
    }

    await this.examinationsRepository.updateById(id, {
      participants: finalParticipants,
    });

    return true;
  }

  @authenticate('jwt')
  @post('/Examinations/{id}/setResults')
  @response(200, {
    description: 'Set examination results',
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
  ): Promise<boolean> {
    const examination = await this.examinationsRepository.findById(id);

    const participants: string[] = (examination.participants ?? []).map(
      p => p.id,
    );

    if (!this.authorizationService.isExaminer(this.user, examination)) {
      throw new HttpErrors.Forbidden("You cannot set examination's result");
    }

    const results = examination.results ?? {};

    for (const [userId, categories] of Object.entries(requestBody)) {
      const {kihon, kata, kumite} = categories;
      const result = this.examinationsRepository.calculateResult(
        kihon,
        kata,
        kumite,
      );
      results[userId] = {kihon, kata, kumite, result};
    }

    await this.examinationsRepository.updateById(id, {results});

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
}
