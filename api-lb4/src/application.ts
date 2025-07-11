import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {UserServiceBindings} from './keys';
import {BranchRepository, UsersRepository} from './repositories';
import {MySequence} from './sequence';
import {MyUserService} from './services/user.service';
import {JWTStrategy} from './strategies/jwt.strategy';
import {hashPassword} from './utils/hash';
import {faker} from '@faker-js/faker';
import {AuthorizationService} from './services/authorization.service';
import {JWTService} from './services/jwt.service';
import path = require('path');

export {ApplicationConfig};

export class ApiApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Mount authentication system
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    // Bind datasource
    // this.dataSource(MongoDataSource, UserServiceBindings.DATASOURCE_NAME);
    registerAuthenticationStrategy(this, JWTStrategy);
    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.service(AuthorizationService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('1h');
    this.bind(TokenServiceBindings.TOKEN_SECRET).to('secret');

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
  // @ts-ignore
  async start() {
    // @ts-ignore
    await super.start();
    const usersRepository = await this.getRepository(UsersRepository);
    const branchRepository = await this.getRepository(BranchRepository);
    const users = await usersRepository.find();
    const unassignedCoach = users.filter(user =>
      user.globalRoles?.includes('unassignedCoach'),
    );
    const admin = users.filter(user => user.globalRoles?.includes('admin'))[0];
    if (!admin) {
      const hashedPassword = await hashPassword('Admin123', 10);
      await usersRepository.create({
        email: 'admin@mail.com',
        fullName: 'admin',
        hashedPassword: hashedPassword,
        globalRoles: ['admin'],
        rank: 'd5',
      });
    } else {
      console.log('admin already exists');
    }
    const branches = await branchRepository.find();
    if (branches.length === 0) {
      const branch = await branchRepository.create({
        name: 'Main Branch',
        coachIds: [],
      });
      const coach = await usersRepository.create({
        email: 'coach@mail.com',
        fullName: 'coach',
        hashedPassword: await hashPassword('Coach123', 10),
        globalRoles: ['examiners'],
        branchRoles: [{branchId: branch.id, roles: ['coach']}],
        rank: 'dan5',
      });
      await branchRepository.updateById(branch.id, {
        coachIds: [coach.id],
      });
      for (let i = 0; i < 10; i++) {
        const hashedPassword = await hashPassword(
          faker.internet.password({
            length: 6,
            pattern: /^[A-Za-z0-9]+$/,
          }),
          10,
        );
        await usersRepository.create({
          email: faker.internet.email(),
          fullName: faker.person.fullName(),
          hashedPassword: hashedPassword,
          branchRoles: [{branchId: branch.id, roles: ['member']}],
          rank: 'kyu8',
        });
      }
    } else {
      console.log('branch already exists');
    }
    if (unassignedCoach.length === 0) {
      for (let i = 0; i < 5; i++) {
        const hashedPassword = await hashPassword('User123', 10);
        await usersRepository.create({
          email: `coach${i}@mail.com`,
          fullName: `coach${i}`,
          hashedPassword: hashedPassword,
          globalRoles: ['unassignedCoach'],
          rank: 'dan3',
        });
      }
    }
  }
}
