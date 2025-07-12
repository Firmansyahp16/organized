import {authenticate} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecurityBindings} from '@loopback/security';
import {Schedules} from '../models';
import {SchedulesRepository} from '../repositories';
import {AuthorizationService} from '../services/authorization.service';
import {MyUserProfile} from '../services/user.service';

export class SchedulesController {
  constructor(
    @repository(SchedulesRepository)
    public schedulesRepository: SchedulesRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {}

  @authenticate('jwt')
  @post('/Schedules')
  @response(200, {
    description: 'Schedules model instance',
    content: {'application/json': {schema: getModelSchemaRef(Schedules)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Schedules, {
            title: 'NewSchedules',
            exclude: ['id'],
          }),
        },
      },
    })
    schedules: Omit<Schedules, 'id'>,
  ): Promise<Schedules> {
    return this.schedulesRepository.create(schedules);
  }

  @authenticate('jwt')
  @get('/Schedules/count')
  @response(200, {
    description: 'Schedules model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Schedules) where?: Where<Schedules>,
  ): Promise<Count> {
    return this.schedulesRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Schedules')
  @response(200, {
    description: 'Array of Schedules model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Schedules, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Schedules) filter?: Filter<Schedules>,
  ): Promise<Schedules[]> {
    return this.schedulesRepository.find(filter);
  }

  // @authenticate('jwt')
  // @patch('/Schedules')
  // @response(200, {
  //   description: 'Schedules PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Schedules, {partial: true}),
  //       },
  //     },
  //   })
  //   schedules: Schedules,
  //   @param.where(Schedules) where?: Where<Schedules>,
  // ): Promise<Count> {
  //   return this.schedulesRepository.updateAll(schedules, where);
  // }

  @authenticate('jwt')
  @get('/Schedules/{id}')
  @response(200, {
    description: 'Schedules model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Schedules, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Schedules, {exclude: 'where'})
    filter?: FilterExcludingWhere<Schedules>,
  ): Promise<Schedules> {
    return this.schedulesRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Schedules/{id}')
  @response(204, {
    description: 'Schedules PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Schedules, {partial: true}),
        },
      },
    })
    schedules: Schedules,
  ): Promise<void> {
    await this.schedulesRepository.updateById(id, schedules);
  }

  @authenticate('jwt')
  @put('/Schedules/{id}')
  @response(204, {
    description: 'Schedules PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() schedules: Schedules,
  ): Promise<void> {
    await this.schedulesRepository.replaceById(id, schedules);
  }

  @authenticate('jwt')
  @del('/Schedules/{id}')
  @response(204, {
    description: 'Schedules DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.schedulesRepository.deleteById(id);
  }

  @authenticate('jwt')
  @post('/Schedules/{id}/setAttendance')
  @response(200)
  async setAttendance(
    @param.path.string('id') id: string,
    @requestBody() requestBody: {id: string; status: string}[],
  ): Promise<boolean> {
    const schedule = await this.schedulesRepository.findById(id);
    if (
      !this.authorizationService.isCoachOfBranch(
        this.user,
        String(schedule.branchId),
      )
    ) {
      throw new HttpErrors.Forbidden("You cannot set schedule's attendance");
    }
    if (!schedule) {
      throw new HttpErrors.NotFound('Schedule not found');
    }
    try {
      const attendanceData = requestBody;
      const attendance = await this.schedulesRepository.attendances(id).create({
        details: attendanceData,
        schedulesId: id,
      });
      if (!attendance) {
        throw new HttpErrors.BadRequest('Attendance not created');
      }
      return true;
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }

  @authenticate('jwt')
  @post('/Schedules/{id}/setMaterial')
  @response(200, {
    description: 'Schedules model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Schedules, {includeRelations: true}),
      },
    },
  })
  async setMaterial(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      material: string;
    },
  ) {
    const schedule = await this.schedulesRepository.findById(id);
    if (
      !this.authorizationService.isCoachOfBranch(
        this.user,
        String(schedule.branchId),
      )
    ) {
      throw new HttpErrors.Forbidden("You cannot set schedule's material");
    }
    if (!schedule) {
      throw new HttpErrors.NotFound('Schedule not found');
    }
    if (!requestBody.material.trim().startsWith('#')) {
      throw new HttpErrors.BadRequest('Material must be in Markdown format');
    }
    await this.schedulesRepository.updateById(id, {
      material: requestBody.material,
    });
  }
}
