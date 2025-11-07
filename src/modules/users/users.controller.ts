import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-reponse.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

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
    const user = await this.userService.findUser(userId as number);
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

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  async followUser(
    @Param('username') username: string,
    @Request() request: any,
  ): Promise<{ profile: ProfileResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    return await this.userService.followUser(username, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  async ununfollowUser(
    @Param('username') username: string,
    @Request() request: any,
  ): Promise<{ profile: ProfileResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    return await this.userService.unfollowUser(username, currentUserId);
  }
}
