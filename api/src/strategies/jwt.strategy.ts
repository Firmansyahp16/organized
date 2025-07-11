import {AuthenticationStrategy} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {HttpErrors, RedirectRoute, Request} from '@loopback/rest';
import {JWTService} from '../services/jwt.service';
import {MyUserProfile} from '../services/user.service';

export class JWTStrategy implements AuthenticationStrategy {
  name: string = 'jwt';

  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) {}

  async authenticate(
    request: Request,
  ): Promise<MyUserProfile | RedirectRoute | undefined> {
    const token: string = this.extractCred(request);
    const userProfile = await this.jwtService.verifyToken(token);
    return Promise.resolve(userProfile);
  }

  extractCred(request: Request): string {
    let authToken = '';
    if (request.headers.authorization) {
      authToken = request.headers.authorization;
      const parts = authToken.split(' ');
      if (parts.length > 1 && parts[0].toLowerCase() === 'bearer') {
        authToken = parts[1];
      } else {
        authToken = request.headers.authorization;
      }
      if (request.query.access_token) {
        authToken = request.query.access_token as string;
      }
      if (!authToken) {
        throw new HttpErrors.Unauthorized('Authorization is missing');
      }
    }
    return authToken;
  }
}
