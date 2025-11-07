import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from './dto/user-reponse.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  buildUserResponse(user: User, token: string): { user: UserResponseDto } {
    return {
      user: {
        email: user.email,
        token,
        name: user.name,
        bio: user.bio ?? null,
        image: user.image ?? null,
      },
    };
  }

  buildProfileResponse(
    user: User,
    following: boolean,
  ): { profile: ProfileResponseDto } {
    return {
      profile: {
        name: user.name,
        bio: user.bio ?? null,
        image: user.image ?? null,
        following,
      },
    };
  }

  async createUser(dataUser: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(dataUser);
    if (newUser.password) {
      const hashedPassword = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPassword;
    }
    return this.userRepository.save(newUser);
  }

  async findUser(userId: number): Promise<Partial<User> | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'bio', 'image', 'createdAt'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  async updateProfile(
    userId: number,
    dataUser: Partial<User>,
  ): Promise<Partial<User> | null> {
    await this.userRepository.update(userId, dataUser);
    return this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'bio', 'image', 'createdAt'],
    });
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }
    }
    return null;
  }

  async saveRefreshToken(userId: number, refreshToken: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Uset not found');
    }
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.refresh_token = hashedRefreshToken;
    await this.userRepository.save(user);
  }

  async followUser(
    username: string,
    currentUserId: number,
  ): Promise<{ profile: ProfileResponseDto }> {
    const userToFollow = await this.userRepository.findOne({
      where: { username: username },
    });

    if (!userToFollow) {
      throw new NotFoundException('User not found');
    }

    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['following'],
    });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    const isalreadyFollowing = currentUser.following.some(
      (user) => user.id === userToFollow.id,
    );
    if (!isalreadyFollowing) {
      currentUser.following.push(userToFollow);
      await this.userRepository.save(currentUser);
    }

    return this.buildProfileResponse(userToFollow, true);
  }

  async unfollowUser(
    username: string,
    currentUserId: number,
  ): Promise<{ profile: ProfileResponseDto }> {
    const userToUnFollow = await this.userRepository.findOne({
      where: { username: username },
    });
    if (!userToUnFollow) {
      throw new NotFoundException('User not found');
    }
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['following'],
    });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }
    currentUser.following = currentUser.following.filter(
      (user) => user.id !== userToUnFollow.id,
    );
    await this.userRepository.save(currentUser);
    return this.buildProfileResponse(userToUnFollow, false);
  }
}
