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
import {Branch} from '../models';
import {
  BranchRepository,
  ExaminationsRepository,
  SchedulesRepository,
  UsersRepository,
} from '../repositories';
import {AuthorizationService} from '../services/authorization.service';
import {MyUserProfile} from '../services/user.service';

export class BranchController {
  constructor(
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
    @repository(SchedulesRepository)
    public schedulesRepository: SchedulesRepository,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @repository(ExaminationsRepository)
    public examinationsRepository: ExaminationsRepository,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
  ) {}

  @authenticate('jwt')
  @post('/Branch')
  @response(200, {
    description: 'Branch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Branch)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Branch, {
            title: 'NewBranch',
            exclude: ['id'],
          }),
        },
      },
    })
    branch: Omit<Branch, 'id'>,
  ): Promise<Branch> {
    return this.branchRepository.create(branch);
  }

  @authenticate('jwt')
  @get('/Branch/count')
  @response(200, {
    description: 'Branch model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Branch) where?: Where<Branch>): Promise<Count> {
    return this.branchRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Branch')
  @response(200, {
    description: 'Array of Branch model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Branch, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Branch) filter?: Filter<Branch>): Promise<Branch[]> {
    return this.branchRepository.find(filter);
  }

  // @patch('/Branch')
  // @response(200, {
  //   description: 'Branch PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Branch, {partial: true}),
  //       },
  //     },
  //   })
  //   branch: Branch,
  //   @param.where(Branch) where?: Where<Branch>,
  // ): Promise<Count> {
  //   return this.branchRepository.updateAll(branch, where);
  // }

  @authenticate('jwt')
  @get('/Branch/{id}')
  @response(200, {
    description: 'Branch model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Branch, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Branch, {exclude: 'where'})
    filter?: FilterExcludingWhere<Branch>,
  ): Promise<Branch> {
    return this.branchRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Branch/{id}')
  @response(204, {
    description: 'Branch PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Branch, {partial: true}),
        },
      },
    })
    branch: Branch,
  ): Promise<void> {
    await this.branchRepository.updateById(id, branch);
  }

  @authenticate('jwt')
  @put('/Branch/{id}')
  @response(204, {
    description: 'Branch PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() branch: Branch,
  ): Promise<void> {
    await this.branchRepository.replaceById(id, branch);
  }

  @authenticate('jwt')
  @del('/Branch/{id}')
  @response(204, {
    description: 'Branch DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.branchRepository.deleteById(id);
  }

  @authenticate('jwt')
  @get('/Branch/{id}/members')
  @response(200, {
    description: 'Array of Branch model instances',
  })
  async findMembers(@param.path.string('id') id: string): Promise<any> {
    return (await this.usersRepository.find()).filter(u =>
      u.branchRoles?.some(
        br => br.branchId === id && br.roles?.includes('member'),
      ),
    );
  }

  @authenticate('jwt')
  @get('/Branch/{id}/coaches')
  @response(200, {
    description: 'Array of Branch model instances',
  })
  async findCoaches(@param.path.string('id') id: string): Promise<any> {
    return (await this.usersRepository.find()).filter(u =>
      u.branchRoles?.some(
        br => br.branchId === id && br.roles?.includes('coach'),
      ),
    );
  }

  @authenticate('jwt')
  @post('/Branch/{id}/setCoach')
  @response(200, {
    description: 'Branch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Branch)}},
  })
  async setCoach(
    @param.path.string('id') id: string,
    @requestBody() requestBody: {coachIds: string[]},
  ): Promise<boolean> {
    if (!this.authorizationService.isCoachManager(this.user)) {
      throw new HttpErrors.Forbidden("You cannot set branch's coach");
    }
    const {coachIds} = requestBody;
    try {
      const branch = await this.branchRepository.findById(id);
      const oldCoachIds = branch.coachIds ?? [];

      for (const oldId of oldCoachIds) {
        if (!coachIds.includes(oldId)) {
          const coach = await this.usersRepository.findById(oldId);
          const branchRoles = coach.branchRoles ?? [];
          const updatedBranchRoles = branchRoles
            .map(br => {
              if (br.branchId === id) {
                return {
                  branchId: br.branchId,
                  roles: (br.roles ?? []).filter(role => role !== 'coach'),
                };
              }
              return br;
            })
            .filter(br => (br.roles?.length ?? 0) > 0);
          const globalRoles = coach.globalRoles ?? [];
          if (!globalRoles.includes('unassignedCoach')) {
            globalRoles.push('unassignedCoach');
          }
          await this.usersRepository.updateById(oldId, {
            branchRoles: updatedBranchRoles,
            globalRoles,
          });
        }
      }

      for (const coachId of coachIds) {
        const coach = await this.usersRepository.findById(coachId);
        const branchRoles = coach.branchRoles ?? [];
        const branchEntry = branchRoles.find(br => br.branchId === id);
        if (branchEntry) {
          branchEntry.roles = Array.from(
            new Set([...(branchEntry.roles ?? []), 'coach']),
          );
        } else {
          branchRoles.push({branchId: id, roles: ['coach']});
        }
        await this.usersRepository.updateById(coachId, {
          branchRoles,
          globalRoles: coach.globalRoles?.filter(
            role => role !== 'unassignedCoach',
          ),
        });
      }

      await this.branchRepository.updateById(id, {
        coachIds,
      });
      return true;
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }

  @authenticate('jwt')
  @post('/Branch/{id}/setSchedule')
  @response(200, {
    description: 'Branch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Branch)}},
  })
  async setSchedule(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      count: number;
      startDate: string;
      resetSchedule: boolean;
    },
  ): Promise<boolean> {
    if (!this.authorizationService.isCoachOfBranch(this.user, id)) {
      throw new HttpErrors.Forbidden(
        "You are not allowed to modify this branch's schedules",
      );
    }
    try {
      await this.branchRepository.findById(id);
      const {count, startDate, resetSchedule} = requestBody;
      const parsedStartDate = new Date(startDate);
      let startIndex = 1;
      const existingSchedules = await this.schedulesRepository.find({
        where: {
          branchId: id,
        },
      });
      if (!resetSchedule && existingSchedules.length > 0) {
        let maxIndex = 0;
        for (const sched of existingSchedules) {
          const match = sched.id?.match(/-(\d{2})$/);
          const number = match ? parseInt(match[1], 10) : NaN;
          if (!isNaN(number) && number > maxIndex) {
            maxIndex = number;
          }
        }
        startIndex = maxIndex + 1;
      } else if (resetSchedule && existingSchedules.length > 0) {
        await this.schedulesRepository.deleteAll({
          branchId: id,
        });
      }
      for (let i = 0; i < count; i++) {
        const index = startIndex + i;
        const paddedIndex = index.toString().padStart(2, '0');
        const date = new Date(parsedStartDate.getTime());
        date.setDate(parsedStartDate.getDate() + i * 7);
        await this.schedulesRepository.create({
          id: `${id}-${paddedIndex}`,
          title: `Schedule ${index}`,
          date,
          branchId: id,
          createdById: this.user.id,
        });
      }
      return true;
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }

  @authenticate('jwt')
  @post('/Branch/{id}/setExam')
  @response(200, {
    description: 'Branch model instance',
    content: {'application/json': {schema: getModelSchemaRef(Branch)}},
  })
  async setExam(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      title: string;
      date: string;
      examiners: string[];
    },
  ): Promise<boolean> {
    if (!this.authorizationService.isCoachOfBranch(this.user, id)) {
      throw new HttpErrors.Forbidden(
        "You are not allowed to modify this branch's schedules",
      );
    }
    try {
      await this.branchRepository.findById(id);
      const {title, date, examiners} = requestBody;
      const parsedDate = new Date(date);
      await this.examinationsRepository.create({
        title: title,
        date: parsedDate,
        branchId: id,
        examiners: examiners,
        createdById: String(this.user?.id),
      });
      return true;
    } catch (error) {
      throw new HttpErrors.InternalServerError(error.message);
    }
  }
}
