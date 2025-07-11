import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {Users} from '../models';
import {Credentials} from '../repositories';
import {UsersRepository} from '../repositories/users.repository';
import {comparePassword} from '../utils/hash';

export interface MyUserProfile extends UserProfile {
  name?: string;
  id?: string;
  email?: string;
  globalRoles: string[];
  branchRoles: {branchId?: string; roles?: string[]}[];
}
export class MyUserService implements UserService<Users, Credentials> {
  constructor(
    @repository(UsersRepository)
    public usersRepository: UsersRepository,
  ) {}
  async verifyCredentials(credentials: Credentials): Promise<Users> {
    const foundUser = await this.usersRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await comparePassword(
      credentials.password,
      foundUser.hashedPassword,
    );
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }
  convertToUserProfile(user: Users): MyUserProfile {
    return {
      [securityId]: String(user.id),
      name: user.fullName,
      id: user.id,
      email: user.email,
      globalRoles: user.globalRoles ?? [],
      branchRoles: user.branchRoles ?? [],
    };
    // throw new Error('Method not implemented.');
  }
}
