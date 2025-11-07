/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsEmail()
  @Length(5, 100)
  email: string;

  @IsNotEmpty()
  @Length(3, 255)
  password: string;

  @IsNotEmpty()
  @Length(3, 100)
  username: string;
}
