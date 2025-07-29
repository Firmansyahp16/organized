import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { generateID } from "../libs/generateID";
import { hashPassword } from "../libs/hash";
import { PrismaService } from "../prisma/prisma.service";
import { AuthService } from "./auth.service";

@Controller("Auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private prismaService: PrismaService
  ) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.verifyCredentials(body);
    const profile = this.authService.convertToProfile(user);
    const token = await this.authService.generateToken(profile);
    return {
      token: token,
      userId: profile.sub,
      ttl: this.authService.parseTimeToSeconds("1h"),
    };
  }

  @Post("register")
  async register(
    @Body()
    body: {
      fullName: string;
      email: string;
      password: string;
      rank: string;
    }
  ) {
    const existingUser = await this.prismaService.users.findUnique({
      where: {
        email: body.email,
      },
    });
    if (existingUser) {
      throw new ConflictException("User already exists");
    }
    const regex = new RegExp(/^[A-Za-z0-9]+$/);
    if (!regex.test(body.password)) {
      throw new BadRequestException(
        "Password must have at least one capital letter, one small letter and one number"
      );
    }
    const hashed = await hashPassword(body.password, 10);
    const user = await this.prismaService.users.create({
      data: {
        id: generateID("USR"),
        fullName: body.fullName,
        email: body.email,
        hashedPassword: hashed,
        rank: body.rank,
        globalRoles: ["unAssociated"],
      },
    });
    const profile = this.authService.convertToProfile(user);
    const token = await this.authService.generateToken(profile);
    return {
      token: token,
      userId: profile.sub,
      ttl: this.authService.parseTimeToSeconds("1h"),
    };
  }

  @Post("refresh")
  async refresh(@Body() body: { token: string }) {
    const decoded = await this.authService.verifyToken(body.token);
    const userId = decoded.sub;
    if (!userId) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.prismaService.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const profile = this.authService.convertToProfile(user);
    const token = await this.authService.generateToken(profile);
    return {
      token: token,
      userId: profile.sub,
      ttl: this.authService.parseTimeToSeconds("1h"),
    };
  }
}
