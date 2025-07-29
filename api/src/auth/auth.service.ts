import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { GlobalRoles, Roles, Users } from "@prisma/client";
import { comparePassword } from "../libs/hash";
import { PrismaService } from "../prisma/prisma.service";

export interface MyUserProfile {
  sub?: string;
  name?: string;
  email?: string;
  globalRoles: GlobalRoles[];
  branchRoles: Roles[];
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService
  ) {}

  async generateToken(userProfile: MyUserProfile) {
    if (!userProfile) {
      throw new UnauthorizedException("UserProfile is null");
    }
    const payload = {
      sub: userProfile.sub,
      name: userProfile.name,
      email: userProfile.email,
      globalRoles: userProfile.globalRoles,
      branchRoles: userProfile.branchRoles,
      source: "NEST",
    };
    // return signAsync
    return this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string) {
    if (!token) {
      throw new UnauthorizedException("Token is null");
    }
    let profile: MyUserProfile;
    const decryptedToken = await this.jwtService.verifyAsync(token, {
      secret: "secret",
    });
    profile = {
      ...decryptedToken,
      source: "NEST",
    };
    return profile;
  }

  async verifyCredentials(credential: { email: string; password: string }) {
    const foundUser = await this.prismaService.users.findUnique({
      where: {
        email: credential.email,
      },
    });
    if (!foundUser) {
      throw new NotFoundException("User not found");
    }
    const matched = await comparePassword(
      credential.password,
      String(foundUser.hashedPassword)
    );
    if (!matched) {
      throw new UnauthorizedException("Password is not matched");
    }
    return foundUser;
  }

  convertToProfile(user: Users) {
    return {
      sub: String(user.id),
      name: String(user.fullName),
      email: String(user.email),
      globalRoles: user.globalRoles,
      branchRoles: user.branchRoles,
      source: "NEST",
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
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}
