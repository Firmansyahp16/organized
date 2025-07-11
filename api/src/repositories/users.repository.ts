import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DataObject,
  DefaultCrudRepository,
  Model,
  Options,
  repository,
} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Branch, Users, UsersRelations} from '../models';
import {BranchRepository} from './branch.repository';
import {customAlphabet, nanoid} from 'nanoid';

export type Credentials = {
  email: string;
  password: string;
};

export class UsersRepository extends DefaultCrudRepository<
  Users,
  typeof Users.prototype.id,
  UsersRelations
> {
  constructor(@inject('datasources.mongo') dataSource: MongoDataSource) {
    super(Users, dataSource);
  }
  definePersistedModel(entityClass: typeof Users) {
    const modelClass = super.definePersistedModel(entityClass);
    modelClass.observe('before save', async ctx => {
      if (ctx.instance) {
        if (!ctx.instance.id) {
          ctx.instance.id = `USR-${customAlphabet('0123456789', 3)()}-${customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ', 3)()}`;
          ctx.instance.createdAt = new Date();
          console.log(
            'New User: ',
            ctx.instance.id,
            'Created At: ',
            ctx.instance.createdAt,
          );
        }
      } else if (ctx.data) {
        ctx.data.updatedAt = new Date();
        console.log(
          'Updated User: ',
          ctx.data.id,
          'Updated At: ',
          ctx.data.updatedAt,
        );
      }
    });
    return modelClass;
  }
}
