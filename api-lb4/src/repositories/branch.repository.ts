import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {customAlphabet} from 'nanoid';
import {MongoDataSource} from '../datasources';
import {Branch, BranchRelations, Examinations, Schedules} from '../models';
import {ExaminationsRepository} from './examinations.repository';
import {SchedulesRepository} from './schedules.repository';
import {UsersRepository} from './users.repository';

export class BranchRepository extends DefaultCrudRepository<
  Branch,
  typeof Branch.prototype.id,
  BranchRelations
> {
  public readonly schedules: HasManyRepositoryFactory<
    Schedules,
    typeof Branch.prototype.id
  >;

  public readonly examinations: HasManyRepositoryFactory<
    Examinations,
    typeof Branch.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>,
    @repository.getter('SchedulesRepository')
    protected schedulesRepositoryGetter: Getter<SchedulesRepository>,
    @repository.getter('ExaminationsRepository')
    protected examinationsRepositoryGetter: Getter<ExaminationsRepository>,
  ) {
    super(Branch, dataSource);
    this.examinations = this.createHasManyRepositoryFactoryFor(
      'examinations',
      examinationsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'examinations',
      this.examinations.inclusionResolver,
    );
    this.schedules = this.createHasManyRepositoryFactoryFor(
      'schedules',
      schedulesRepositoryGetter,
    );
    this.registerInclusionResolver(
      'schedules',
      this.schedules.inclusionResolver,
    );
  }

  definePersistedModel(entityClass: typeof Branch) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance) {
        if (!ctx.instance.id) {
          ctx.instance.id = `BRN-${customAlphabet('0123456789', 3)()}-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)()}`;
          ctx.instance.createdAt = new Date();
          console.log(
            'New Branch: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.log(
          'Updated Branch: ',
          ctx.where.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }
  async findMembers(id: string) {
    const branch = await this.findById(id);
    const members = (await (await this.usersRepositoryGetter()).find()).filter(
      u =>
        u.branchRoles?.some(
          br => br.branchId === branch.id && br.roles?.includes('member'),
        ),
    );
    return members;
  }
}
