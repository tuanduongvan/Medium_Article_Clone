import { Article } from 'src/entities/article.entity';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { AuthorResponseDto } from '../dto/author-response.dto';

export function toArticleResponse(
  article: Article,
  currentUserId?: number,
): ArticleResponseDto {
  const author: AuthorResponseDto = {
    name: article.author.name,
    bio: article.author.bio,
    image: article.author.image,
  };

  const favorited = article.favoritedBy
    ? article.favoritedBy.some((user) => user.id === currentUserId)
    : false;

  return {
    slug: article.slug,
    title: article.title,
    content: article.content,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    favorited,
    favoritesCount: article.favoritesCount,
    author,
  };
}
