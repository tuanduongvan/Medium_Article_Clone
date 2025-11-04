import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-reponse.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(createUserDto);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(
    @Request() request: any,
  ): Promise<{ user: UserResponseDto | null }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = request.headers.authorization?.split(' ')[1];
    const user = await this.userService.findById(userId as number);
    return this.userService.buildUserResponse(user as User, token as string);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async updateProfile(
    @Body() dataUser: UpdateUserDto,
    @Request() request: any,
  ): Promise<{ user: UserResponseDto | null }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = request.user.userId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const token = request.headers.authorization?.split(' ')[1];
    const user = await this.userService.updateProfile(
      userId as number,
      dataUser,
    );
    return this.userService.buildUserResponse(user as User, token as string);
  }
}
