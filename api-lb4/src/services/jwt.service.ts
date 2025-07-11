import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {promisify} from 'util';
import {MyUserProfile} from './user.service';
const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

export class JWTService {
  // @inject('authentication.jwt.secret')
  @inject(TokenServiceBindings.TOKEN_SECRET)
  public readonly jwtSecret: string;

  @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
  public readonly expiresSecret: number;

  async generateToken(userProfile: MyUserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized(
        'Error while generating token :userProfile is null',
      );
    }
    const payload = {
      sub: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      globalRoles: userProfile.globalRoles,
      branchRoles: userProfile.branchRoles,
      source: 'LB4',
    };
    return signAsync(payload, this.jwtSecret, {
      expiresIn: this.expiresSecret,
    });
  }

  async verifyToken(token: string): Promise<MyUserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token:'token' is null`,
      );
    }

    let userProfile: MyUserProfile;
    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret);
      userProfile = {
        ...decryptedToken,
        source: 'LB4',
        [securityId]: decryptedToken.id,
      } as MyUserProfile;
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token:${err.message}`);
    }
    return userProfile;
  }

  async verifyRefreshToken(token: string): Promise<MyUserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized(
        `Error verifying token:'token' is null`,
      );
    }
    let userProfile: MyUserProfile;
    try {
      const decryptedToken = await verifyAsync(token, this.jwtSecret, {
        ignoreExpiration: true,
        maxAge: '7d',
      });
      userProfile = {
        [securityId]: decryptedToken.sub,
        sub: decryptedToken.sub,
        name: decryptedToken.name,
        globalRoles: Array.isArray(decryptedToken.globalRoles)
          ? decryptedToken.globalRoles
          : [],
        branchRoles: decryptedToken.branchRoles
          ? decryptedToken.branchRoles
          : [],
        source: 'LB4',
      };
    } catch (err) {
      throw new HttpErrors.Unauthorized(`Error verifying token:${err.message}`);
    }
    return userProfile;
  }
}
