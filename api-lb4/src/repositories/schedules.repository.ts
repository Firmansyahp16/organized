import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {
  Attendances,
  Branch,
  Schedules,
  SchedulesRelations,
  Users,
} from '../models';
import {AttendancesRepository} from './attendances.repository';
import {BranchRepository} from './branch.repository';
import {UsersRepository} from './users.repository';

export class SchedulesRepository extends DefaultCrudRepository<
  Schedules,
  typeof Schedules.prototype.id,
  SchedulesRelations
> {
  public readonly branch: BelongsToAccessor<
    Branch,
    typeof Schedules.prototype.id
  >;

  public readonly createdBy: BelongsToAccessor<
    Users,
    typeof Schedules.prototype.id
  >;

  public readonly attendances: HasOneRepositoryFactory<
    Attendances,
    typeof Schedules.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>,
    @repository.getter('AttendancesRepository')
    protected attendancesRepositoryGetter: Getter<AttendancesRepository>,
  ) {
    super(Schedules, dataSource);
    this.attendances = this.createHasOneRepositoryFactoryFor(
      'attendances',
      attendancesRepositoryGetter,
    );
    this.registerInclusionResolver(
      'attendances',
      this.attendances.inclusionResolver,
    );
    this.createdBy = this.createBelongsToAccessorFor(
      'createdBy',
      usersRepositoryGetter,
    );
    this.registerInclusionResolver(
      'createdBy',
      this.createdBy.inclusionResolver,
    );
    this.branch = this.createBelongsToAccessorFor(
      'branch',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
  }

  definePersistedModel(entityClass: typeof Schedules) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance) {
        if (!ctx.instance.createdAt) {
          ctx.instance.createdAt = new Date();
          console.log(
            'New Schedule: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.log(
          'Updated Schedule: ',
          ctx.where.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }
}
