import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Branch} from './branch.model';

@model({settings: {hiddenProperties: ['hashedPassword']}})
export class Users extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  fullName: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  hashedPassword: string;

  @property({
    type: 'string',
  })
  rank?: string;

  @property.array(String, {
    type: 'array',
  })
  globalRoles?: string[];

  @property({
    type: 'object',
  })
  branchRoles?: {
    branchId?: string;
    roles?: string[];
  }[];

  @property({
    type: 'date',
    required: true,
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  constructor(data?: Partial<Users>) {
    super(data);
  }
}

export interface UsersRelations {
  // describe navigational properties here
}

export type UsersWithRelations = Users & UsersRelations;
