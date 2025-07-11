import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Events,
  Attendances,
} from '../models';
import {EventsRepository} from '../repositories';

export class EventsAttendancesController {
  constructor(
    @repository(EventsRepository) protected eventsRepository: EventsRepository,
  ) { }

  @get('/events/{id}/attendances', {
    responses: {
      '200': {
        description: 'Events has one Attendances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Attendances),
          },
        },
      },
    },
  })
  async get(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Attendances>,
  ): Promise<Attendances> {
    return this.eventsRepository.attendances(id).get(filter);
  }

  @post('/events/{id}/attendances', {
    responses: {
      '200': {
        description: 'Events model instance',
        content: {'application/json': {schema: getModelSchemaRef(Attendances)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Events.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Attendances, {
            title: 'NewAttendancesInEvents',
            exclude: ['id'],
            optional: ['eventsId']
          }),
        },
      },
    }) attendances: Omit<Attendances, 'id'>,
  ): Promise<Attendances> {
    return this.eventsRepository.attendances(id).create(attendances);
  }

  @patch('/events/{id}/attendances', {
    responses: {
      '200': {
        description: 'Events.Attendances PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Attendances, {partial: true}),
        },
      },
    })
    attendances: Partial<Attendances>,
    @param.query.object('where', getWhereSchemaFor(Attendances)) where?: Where<Attendances>,
  ): Promise<Count> {
    return this.eventsRepository.attendances(id).patch(attendances, where);
  }

  @del('/events/{id}/attendances', {
    responses: {
      '200': {
        description: 'Events.Attendances DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Attendances)) where?: Where<Attendances>,
  ): Promise<Count> {
    return this.eventsRepository.attendances(id).delete(where);
  }
}
