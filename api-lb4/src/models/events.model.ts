import {belongsTo, Entity, hasOne, model, property} from '@loopback/repository';
import {Attendances} from './attendances.model';
import {Users} from './users.model';

@model()
export class Events extends Entity {
  @property({name: 'id', type: 'string', id: true, generated: false})
  id?: string;

  @property({
    type: 'string',
  })
  title: string;

  @property({
    type: 'string',
  })
  description: string;

  @property({
    type: 'date',
  })
  date: Date;

  @property({
    type: 'string',
  })
  type: string;

  @property.array('string')
  branchIds?: string[];

  @property.array(Object, {
    type: 'object',
  })
  participants?: {
    id: string;
    rank: string;
  }[];

  @property.array('string')
  examiners?: string[];

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

  @belongsTo(() => Users)
  createdById?: string;

  @hasOne(() => Attendances)
  attendances: Attendances;

  constructor(data?: Partial<Events>) {
    super(data);
  }
}

export interface EventsRelations {
  // describe navigational properties here
}

export type EventsWithRelations = Events & EventsRelations;
