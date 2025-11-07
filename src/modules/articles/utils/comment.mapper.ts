import { AuthorResponseDto } from '../dto/author-response.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { Comment } from 'src/entities/comment.entity';

export function toCommnetResponse(comment: Comment): CommentResponseDto {
  const author: AuthorResponseDto = {
    name: comment.author.name,
    bio: comment.author.bio,
    image: comment.author.image,
  };

  return {
    id: comment.id,
    createdAt: comment.createdAt,
    body: comment.body,
    author,
  };
}
