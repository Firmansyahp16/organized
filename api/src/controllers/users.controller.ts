import {authenticate, TokenService} from '@loopback/authentication';
import {
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
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
import {SecurityBindings, UserProfile} from '@loopback/security';
import {Users} from '../models';
import {
  AttendancesRepository,
  BranchRepository,
  EventsRepository,
  ExaminationsRepository,
  SchedulesRepository,
  UsersRepository,
} from '../repositories';
import {MyUserProfile, MyUserService} from '../services/user.service';
import {hashPassword} from '../utils/hash';
import {AuthorizationService} from '../services/authorization.service';

export class UsersController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
    public jwtExpiresIn: string,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(SecurityBindings.USER, {optional: true})
    public user: MyUserProfile,
    @inject('services.AuthorizationService')
    private authorizationService: AuthorizationService,
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
    @repository(BranchRepository)
    public branchRepository: BranchRepository,
    @repository(SchedulesRepository)
    public schedulesRepository: SchedulesRepository,
    @repository(AttendancesRepository)
    public attendancesRepository: AttendancesRepository,
    @repository(ExaminationsRepository)
    public examinationsRepository: ExaminationsRepository,
    @repository(EventsRepository)
    public eventsRepository: EventsRepository,
  ) {}

  @authenticate('jwt')
  @post('/Users')
  @response(200, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {
            title: 'NewUsers',
            exclude: ['id'],
          }),
        },
      },
    })
    users: Omit<Users, 'id'>,
  ): Promise<Users> {
    return this.usersRepository.create(users);
  }

  @authenticate('jwt')
  @get('/Users/count')
  @response(200, {
    description: 'Users model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Users) where?: Where<Users>): Promise<Count> {
    return this.usersRepository.count(where);
  }

  @authenticate('jwt')
  @get('/Users')
  @response(200, {
    description: 'Array of Users model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Users, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Users) filter?: Filter<Users>): Promise<Users[]> {
    return this.usersRepository.find(filter);
  }

  // @patch('/Users')
  // @response(200, {
  //   description: 'Users PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Users, {partial: true}),
  //       },
  //     },
  //   })
  //   users: Users,
  //   @param.where(Users) where?: Where<Users>,
  // ): Promise<Count> {
  //   return this.usersRepository.updateAll(users, where);
  // }

  @authenticate('jwt')
  @get('/Users/{id}')
  @response(200, {
    description: 'Users model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Users, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Users, {exclude: 'where'})
    filter?: FilterExcludingWhere<Users>,
  ): Promise<Users> {
    return this.usersRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/Users/{id}')
  @response(204, {
    description: 'Users PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Users, {partial: true}),
        },
      },
    })
    users: Users,
  ): Promise<void> {
    await this.usersRepository.updateById(id, users);
  }

  @authenticate('jwt')
  @put('/Users/{id}')
  @response(204, {
    description: 'Users PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() users: Users,
  ): Promise<void> {
    await this.usersRepository.replaceById(id, users);
  }

  @authenticate('jwt')
  @del('/Users/{id}')
  @response(204, {
    description: 'Users DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }

  // User register & login

  @authenticate.skip()
  @post('/Users/register')
  @response(200, {
    description: 'Users model instance',
  })
  async register(
    @requestBody()
    requestBody: {
      fullName: string;
      email: string;
      password: string;
      rank: string;
      role?: string[];
    },
  ): Promise<{token: string; userId: string; ttl: number}> {
    const existingUser = await this.usersRepository.find({
      where: {
        email: requestBody.email,
      },
    });
    if (existingUser.length > 0) {
      throw new HttpErrors.Conflict('User already exists');
    }
    const regex = new RegExp(/^[A-Za-z0-9]+$/);
    if (!regex.test(requestBody.password)) {
      throw new HttpErrors.BadRequest(
        'Password must have at least one capital letter, one small letter and one number',
      );
    }
    const hashed = await hashPassword(requestBody.password, 10);
    const user = await this.usersRepository.create({
      fullName: requestBody.fullName,
      email: requestBody.email,
      hashedPassword: hashed,
      rank: requestBody.rank,
      globalRoles: requestBody.role ? requestBody.role : ['notAssociated'],
    });
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return {
      token: token,
      userId: userProfile.id!,
      ttl: this.parseTimeToSeconds(this.jwtExpiresIn),
    };
  }

  @authenticate.skip()
  @post('/Users/login')
  @response(200, {
    description: 'Users model instance',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async login(
    @requestBody()
    credentials: {
      email: string;
      password: string;
    },
  ): Promise<{token: string; userId: string; ttl: number}> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return {
      token: token,
      userId: userProfile.id!,
      ttl: this.parseTimeToSeconds(this.jwtExpiresIn),
    };
  }

  parseTimeToSeconds(input: string): number {
    const regex = /^(\d+)([smhd])$/i;
    const match = input.match(regex);

    if (!match) {
      throw new Error(`Invalid time format: ${input}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }

  @authenticate.skip()
  @post('/Users/refresh')
  @response(200, {
    description: 'Refresh token',
  })
  async refresh(
    @requestBody() requestBody: {refreshToken: string},
  ): Promise<{token: string; userId: string; ttl: number}> {
    try {
      const decoded = await this.jwtService.verifyToken(
        requestBody.refreshToken,
      );
      const userId = decoded.userId || decoded.sub;
      if (!userId) {
        throw new HttpErrors.Unauthorized('Invalid refresh token');
      }
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new HttpErrors.Unauthorized('User not found');
      }
      const userProfile = this.userService.convertToUserProfile(user);
      const token = await this.jwtService.generateToken(userProfile);
      return {
        token,
        userId: String(userProfile.id),
        ttl: this.parseTimeToSeconds(this.jwtExpiresIn),
      };
    } catch (error) {
      throw new HttpErrors.Unauthorized('Invalid refresh token');
    }
  }

  @authenticate('jwt')
  @post('/Users/{id}/setBranch')
  @response(200, {
    description: 'Set branch of user',
    content: {'application/json': {schema: getModelSchemaRef(Users)}},
  })
  async setBranch(
    @param.path.string('id') id: string,
    @requestBody()
    requestBody: {
      branchId: string;
      roles?: string[];
    },
  ): Promise<void> {
    if (
      !this.authorizationService.isCurrentUser(this.user, id) ||
      !this.authorizationService.hasGlobalRole(this.user, 'admin')
    ) {
      throw new HttpErrors.Forbidden('You cannot set branch for this user');
    }
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }
    await this.usersRepository.updateById(id, {
      branchRoles: [
        ...(user.branchRoles ?? []),
        {
          branchId: requestBody.branchId,
          roles: requestBody.roles,
        },
      ],
    });
  }

  @authenticate('jwt')
  @get('/Dashboard')
  @response(200, {
    description: 'Dashboard',
  })
  async dashboard(): Promise<Record<string, any> | undefined> {
    const dashboardData: {
      totalMembers?: number;
      totalBranches?: number;
      totalCoaches?: number;
      todaySchedules?: {
        branchId?: string;
        branchName?: string;
        title?: string;
        date?: Date;
        coaches?: {
          id?: string;
          name?: string;
          rank?: string;
        }[];
      }[];
      nextExaminations?: {
        branchId?: string;
        branchName?: string;
        title?: string;
        date?: Date;
        totalParticipants?: number;
        examiners?: {
          id?: string;
          name?: string;
          rank?: string;
        }[];
      }[];
      nextEvents?: {
        branches?: {
          id?: string;
          name?: string;
        }[];
        title?: string;
        date?: Date;
        type?: string;
        totalParticipants?: number;
      }[];
    } = {};

    const allUsers = await this.usersRepository.find();
    const allBranches = await this.branchRepository.find();
    const allSchedules = await this.schedulesRepository.find();
    const allExaminations = await this.examinationsRepository.find();
    const allEvents = await this.eventsRepository.find();

    if (this.authorizationService.hasGlobalRole(this.user, 'admin')) {
      dashboardData.totalMembers = allUsers.filter(u =>
        u.branchRoles?.some(br => br.branchId && br.roles?.includes('member')),
      ).length;
      dashboardData.totalBranches = allBranches.length;
      dashboardData.totalCoaches = allUsers.filter(u =>
        u.branchRoles?.some(br => br.branchId && br.roles?.includes('coach')),
      ).length;
      dashboardData.todaySchedules = allSchedules.filter(
        s => s.date?.toLocaleDateString() === new Date().toLocaleDateString(),
      );
      dashboardData.nextExaminations = allExaminations
        .filter(
          e => e.date?.toLocaleDateString() === new Date().toLocaleDateString(),
        )
        .map(event => {
          const examiners = allUsers.filter(u =>
            u.branchRoles?.some(br => br.branchId === event.branchId),
          );
          return {
            branchId: event.branchId,
            branchName: allBranches.find(b => b.id === event.branchId)?.name,
            title: event.title,
            date: event.date,
            examiners: examiners.map(u => ({
              id: u.id,
              name: u.fullName,
              rank: u.rank,
            })),
            totalParticipants: event.participants?.length,
          };
        });
      dashboardData.nextEvents = allEvents
        .filter(
          e => e.date?.toLocaleDateString() === new Date().toLocaleDateString(),
        )
        .map(event => ({
          branches: allBranches
            .filter(b => event.branchIds?.includes(String(b?.id)))
            .map(b => ({id: b.id, name: b.name})),
          title: event.title,
          date: event.date,
          type: event.type,
          totalParticipants: event.participants?.length,
        }));
    }
    return dashboardData;
  }

  // @authenticate('jwt')
}
