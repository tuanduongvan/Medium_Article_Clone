import { Article } from 'src/entities/article.entity';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { AuthorResponseDto } from '../dto/author-response.dto';

export function toArticleResponse(article: Article): ArticleResponseDto {
  const author: AuthorResponseDto = {
    name: article.author.name,
    bio: article.author.bio,
    image: article.author.image,
  };

  return {
    slug: article.slug,
    title: article.title,
    content: article.content,
    tagList: article.tagList,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    author,
  };
}
