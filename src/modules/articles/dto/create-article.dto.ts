import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @IsArray()
  @IsOptional()
  tagList?: string[];
}
