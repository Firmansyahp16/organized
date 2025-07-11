import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Attendances,
  Events,
} from '../models';
import {AttendancesRepository} from '../repositories';

export class AttendancesEventsController {
  constructor(
    @repository(AttendancesRepository)
    public attendancesRepository: AttendancesRepository,
  ) { }

  @get('/attendances/{id}/events', {
    responses: {
      '200': {
        description: 'Events belonging to Attendances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Events),
          },
        },
      },
    },
  })
  async getEvents(
    @param.path.string('id') id: typeof Attendances.prototype.id,
  ): Promise<Events> {
    return this.attendancesRepository.events(id);
  }
}
