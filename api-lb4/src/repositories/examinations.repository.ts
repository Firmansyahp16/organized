import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {customAlphabet} from 'nanoid';
import {MongoDataSource} from '../datasources';
import {Branch, Examinations, ExaminationsRelations, Users} from '../models';
import {BranchRepository} from './branch.repository';
import {UsersRepository} from './users.repository';

export class ExaminationsRepository extends DefaultCrudRepository<
  Examinations,
  typeof Examinations.prototype.id,
  ExaminationsRelations
> {
  public readonly createdBy: BelongsToAccessor<
    Users,
    typeof Examinations.prototype.id
  >;

  public readonly branch: BelongsToAccessor<
    Branch,
    typeof Examinations.prototype.id
  >;

  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @repository.getter('UsersRepository')
    protected usersRepositoryGetter: Getter<UsersRepository>,
    @repository.getter('BranchRepository')
    protected branchRepositoryGetter: Getter<BranchRepository>,
  ) {
    super(Examinations, dataSource);
    this.branch = this.createBelongsToAccessorFor(
      'branch',
      branchRepositoryGetter,
    );
    this.registerInclusionResolver('branch', this.branch.inclusionResolver);
    this.createdBy = this.createBelongsToAccessorFor(
      'createdBy',
      usersRepositoryGetter,
    );
    this.registerInclusionResolver(
      'createdBy',
      this.createdBy.inclusionResolver,
    );
  }

  definePersistedModel(entityClass: typeof Examinations) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance) {
        if (!ctx.instance.id) {
          ctx.instance.id = `EXM-${customAlphabet('0123456789', 3)()}-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)()}`;
          ctx.instance.createdAt = new Date();
          console.log(
            'New Examination: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.log(
          'Updated Examination: ',
          ctx.where.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }

  calculateResult(
    kihon: string,
    kata: string,
    kumite: string,
  ): 'fail' | 'pass' | 'special' {
    if (kihon === 'a' && kata === 'a' && kumite === 'a') {
      return 'special';
    }
    const failSet = new Set([
      'a,c,c',
      'b,c,c',
      'c,a,a',
      'c,a,b',
      'c,a,c',
      'c,b,a',
      'c,b,b',
      'c,b,c',
      'c,c,a',
      'c,c,b',
      'c,c,c',
    ]);
    const key = [kihon, kata, kumite].join(',');
    return failSet.has(key) ? 'fail' : 'pass';
  }

  async updateRank(ownerId: string, result: string) {
    const user = await (await this.usersRepositoryGetter()).findById(ownerId);
    if (!user) {
      throw new Error('User not found');
    }
    const userRank = String(user.rank);
    const current = parseInt(userRank.replace('kyu', ''), 10);
    let newRank = current;
    if (result === 'pass' && current > 2) {
      newRank = current - 1;
    } else if (result === 'special') {
      if (current > 3) {
        newRank = current - 2;
      } else if (current === 2) {
        newRank = current - 1;
      }
    }
    if (newRank !== current) {
      await (
        await this.usersRepositoryGetter()
      ).updateById(ownerId, {
        rank: `kyu${newRank}`,
      });
    }
  }
}
