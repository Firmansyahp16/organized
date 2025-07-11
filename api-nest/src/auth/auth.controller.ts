import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'src/interfaces/response';
import { Public } from 'src/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() data: { email: string; password: string },
  ): Promise<Response> {
    try {
      const login = await this.authService.login(data);
      return Response(200, 'Login successfully', login);
    } catch (error) {
      return Response(500, error.message);
    }
  }

  @Public()
  @Post('register')
  async register(
    @Body()
    data: {
      fullName: string;
      email: string;
      password: string;
      rank: string;
      role?: string[];
    },
  ): Promise<Response> {
    try {
      const register = await this.authService.register(data);
      return Response(200, 'Register Successfully', register);
    } catch (error) {
      return Response(500, error.message);
    }
  }
}
