import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Schedules} from './schedules.model';
import {Events} from './events.model';

@model()
export class Attendances extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'object',
  })
  details?: {id: string; status: string}[];

  @property({
    type: 'date',
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  updatedAt?: Date;

  @belongsTo(() => Schedules)
  schedulesId?: string;

  @belongsTo(() => Events)
  eventsId?: string;

  constructor(data?: Partial<Attendances>) {
    super(data);
  }
}

export interface AttendancesRelations {
  // describe navigational properties here
}

export type AttendancesWithRelations = Attendances & AttendancesRelations;
