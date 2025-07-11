import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Branch} from './branch.model';
import {Users} from './users.model';
import {Attendances} from './attendances.model';

@model()
export class Schedules extends Entity {
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
  title: string;

  @property({
    type: 'date',
    required: true,
  })
  date: Date;

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => Branch)
  branchId: string;

  @belongsTo(() => Users)
  createdById: string;

  @hasOne(() => Attendances)
  attendances: Attendances;

  constructor(data?: Partial<Schedules>) {
    super(data);
  }
}

export interface SchedulesRelations {
  // describe navigational properties here
}

export type SchedulesWithRelations = Schedules & SchedulesRelations;
