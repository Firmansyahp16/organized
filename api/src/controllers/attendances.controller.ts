import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Attendances} from '../models';
import {AttendancesRepository} from '../repositories';
import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {AuthorizationService} from '../services/authorization.service';

export class AttendancesController {
  constructor(
    @repository(AttendancesRepository)
    public attendancesRepository: AttendancesRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: UserProfile,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {}

  @authenticate('jwt')
  @post('/Attendances')
  @response(200, {
    description: 'Attendances model instance',
    content: {'application/json': {schema: getModelSchemaRef(Attendances)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Attendances, {
            title: 'NewAttendances',
            exclude: ['id'],
          }),
        },
      },
    })
    attendances: Omit<Attendances, 'id'>,
  ): Promise<Attendances> {
    return this.attendancesRepository.create(attendances);
  }

  @authenticate('jwt')
  @get('/Attendances/count')
  @response(200, {
    description: 'Attendances model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Attendances) where?: Where<Attendances>,
  ): Promise<Count> {
    return this.attendancesRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Attendances')
  @response(200, {
    description: 'Array of Attendances model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Attendances, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Attendances) filter?: Filter<Attendances>,
  ): Promise<Attendances[]> {
    return this.attendancesRepository.find(filter);
  }

  // @authenticate('jwt')
  // @patch('/Attendances')
  // @response(200, {
  //   description: 'Attendances PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Attendances, {partial: true}),
  //       },
  //     },
  //   })
  //   attendances: Attendances,
  //   @param.where(Attendances) where?: Where<Attendances>,
  // ): Promise<Count> {
  //   return this.attendancesRepository.updateAll(attendances, where);
  // }

  @authenticate('jwt')
  @get('/Attendances/{id}')
  @response(200, {
    description: 'Attendances model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Attendances, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Attendances, {exclude: 'where'})
    filter?: FilterExcludingWhere<Attendances>,
  ): Promise<Attendances> {
    return this.attendancesRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Attendances/{id}')
  @response(204, {
    description: 'Attendances PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Attendances, {partial: true}),
        },
      },
    })
    attendances: Attendances,
  ): Promise<void> {
    await this.attendancesRepository.updateById(id, attendances);
  }

  @authenticate('jwt')
  @put('/Attendances/{id}')
  @response(204, {
    description: 'Attendances PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() attendances: Attendances,
  ): Promise<void> {
    await this.attendancesRepository.replaceById(id, attendances);
  }

  @authenticate('jwt')
  @del('/Attendances/{id}')
  @response(204, {
    description: 'Attendances DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.attendancesRepository.deleteById(id);
  }
}
