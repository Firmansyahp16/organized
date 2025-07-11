import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const verified = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET ?? 'secret',
      });
      req.user = {
        source: 'NEST',
        userId: verified.sub,
        name: verified.name,
        email: verified.email,
        globalRoles: verified.globalRoles,
        branchRoles: verified.branchRoles,
      };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Missing or invalid token');
    }
  }
}
