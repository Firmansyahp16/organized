import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
  Model, HasOneRepositoryFactory} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Events, EventsRelations, Users, Attendances} from '../models';
import {UsersRepository} from './users.repository';
import {PersistedModel} from 'loopback-datasource-juggler';
import {customAlphabet} from 'nanoid';
import {AttendancesRepository} from './attendances.repository';

export class EventsRepository extends DefaultCrudRepository<
  Events,
  typeof Events.prototype.id,
  EventsRelations
> {
  public readonly createdBy: BelongsToAccessor<
    Users,
    typeof Events.prototype.id
  >;

  public readonly attendances: HasOneRepositoryFactory<Attendances, typeof Events.prototype.id>;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>, @repository.getter('AttendancesRepository') protected attendancesRepositoryGetter: Getter<AttendancesRepository>,
  ) {
    super(Events, dataSource);
    this.attendances = this.createHasOneRepositoryFactoryFor('attendances', attendancesRepositoryGetter);
    this.registerInclusionResolver('attendances', this.attendances.inclusionResolver);
    this.createdBy = this.createBelongsToAccessorFor(
      'createdBy',
      usersRepositoryGetter,
    );
    this.registerInclusionResolver(
      'createdBy',
      this.createdBy.inclusionResolver,
    );
  }

  definePersistedModel(entityClass: typeof Events) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance) {
        if (!ctx.instance.id) {
          ctx.instance.id = `EVT-${customAlphabet('0123456789', 3)()}-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)()}`;
          ctx.instance.createdAt = new Date();
          console.log(
            'New Event: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.log(
          'Updated Event: ',
          ctx.data.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }
}
