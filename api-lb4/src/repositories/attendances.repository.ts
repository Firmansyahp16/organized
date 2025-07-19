import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Attendances, AttendancesRelations, Events, Schedules} from '../models';
import {EventsRepository} from './events.repository';
import {SchedulesRepository} from './schedules.repository';

export class AttendancesRepository extends DefaultCrudRepository<
  Attendances,
  typeof Attendances.prototype.id,
  AttendancesRelations
> {
  public readonly schedules: BelongsToAccessor<
    Schedules,
    typeof Attendances.prototype.id
  >;

  public readonly events: BelongsToAccessor<
    Events,
    typeof Attendances.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('SchedulesRepository')
    protected schedulesRepositoryGetter: Getter<SchedulesRepository>,
    @repository.getter('EventsRepository')
    protected eventsRepositoryGetter: Getter<EventsRepository>,
  ) {
    super(Attendances, dataSource);
    this.events = this.createBelongsToAccessorFor(
      'events',
      eventsRepositoryGetter,
    );
    this.registerInclusionResolver('events', this.events.inclusionResolver);
    this.schedules = this.createBelongsToAccessorFor(
      'schedules',
      schedulesRepositoryGetter,
    );
    this.registerInclusionResolver(
      'schedules',
      this.schedules.inclusionResolver,
    );
  }
  definePersistedModel(entityClass: typeof Attendances) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance instanceof Attendances) {
        if (!ctx.instance.id) {
          ctx.instance.id = `ATT-${ctx.instance.schedulesId}`;
          ctx.instance.createdAt = new Date();
          console.info(
            'New Attendance: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.info(
          'Updated Attendance: ',
          ctx.where.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }
}
