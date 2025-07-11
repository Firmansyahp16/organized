import {Entity, hasMany, model, property} from '@loopback/repository';
import {Schedules} from './schedules.model';
import {Users} from './users.model';
import {Examinations} from './examinations.model';

@model()
export class Branch extends Entity {
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
  name: string;

  @property({
    type: 'string',
  })
  coachIds?: string[];

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @hasMany(() => Schedules)
  schedules?: Schedules[];

  @hasMany(() => Examinations)
  examinations?: Examinations[];

  constructor(data?: Partial<Branch>) {
    super(data);
  }
}

export interface BranchRelations {
  // describe navigational properties here
}

export type BranchWithRelations = Branch & BranchRelations;
