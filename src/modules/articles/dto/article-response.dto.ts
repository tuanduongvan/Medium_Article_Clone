import { AuthorResponseDto } from './author-response.dto';

export class ArticleResponseDto {
  slug: string;
  title: string;
  description?: string;
  content: string;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited?: boolean;
  favoritesCount?: number;
  author: AuthorResponseDto;
}
