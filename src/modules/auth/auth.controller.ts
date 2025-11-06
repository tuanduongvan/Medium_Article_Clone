import { Controller, UseGuards, Request, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  loginUser(@Request() request: any): any {
    return this.authService.loginUser(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.user as { email: string; id: number },
    );
  }
}
