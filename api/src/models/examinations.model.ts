import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Users} from './users.model';
import {Branch} from './branch.model';

@model()
export class Examinations extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'date',
  })
  date: Date;

  @property.array(Object, {
    type: 'object',
  })
  participants?: {
    id: string;
    rank: string;
  }[];

  @property({
    type: 'object',
  })
  results?: {
    [userId: string]: {
      kihon: string;
      kata: string;
      kumite: string;
      result?: 'pass' | 'fail' | 'special';
    };
  };

  @property({
    type: 'string',
  })
  examiners?: string[];

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => Users)
  createdById?: string;

  @belongsTo(() => Branch)
  branchId: string;

  constructor(data?: Partial<Examinations>) {
    super(data);
  }
}

export interface ExaminationsRelations {
  // describe navigational properties here
}

export type ExaminationsWithRelations = Examinations & ExaminationsRelations;
