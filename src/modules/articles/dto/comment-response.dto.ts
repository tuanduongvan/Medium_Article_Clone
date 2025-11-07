import { AuthorResponseDto } from './author-response.dto';

export class CommentResponseDto {
  id: number;
  createdAt: Date;
  body: string;
  author: AuthorResponseDto;
}
