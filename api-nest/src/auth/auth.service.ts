import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateID } from 'src/utils/generateID';
import { comparePassword, hashPassword } from 'src/utils/hash';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const passwordMatched = await comparePassword(
      password,
      String(user.hashedPassword),
    );
    if (!passwordMatched) {
      throw new UnauthorizedException('Password not matched');
    }
    return {
      token: this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          source: 'NEST',
        },
        { expiresIn: process.env.JWT_EXPIRES_IN },
      ),
    };
  }

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    rank: string;
    role?: string[];
  }) {
    const id = generateID('USR');
    const user = await this.prisma.users.create({
      data: {
        id: id,
        fullName: data.fullName,
        email: data.email,
        hashedPassword: await hashPassword(data.password, 10),
        rank: data.rank,
        globalRoles: data.role ? data.role : ['notAssociated'],
      },
    });
    return {
      token: this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          source: 'NEST',
        },
        { expiresIn: process.env.JWT_EXPIRES_IN },
      ),
    };
  }
}
