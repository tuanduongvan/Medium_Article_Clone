import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Article } from 'src/entities/article.entity';
import { Repository } from 'typeorm';
import { ArticleResponseDto } from './dto/article-response.dto';
import { toArticleResponse } from './utils/article.mapper';
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async createArticle(
    dataArticle: Partial<Article>,
    userId: number,
  ): Promise<{ article: ArticleResponseDto }> {
    const newArticle = this.articleRepository.create({
      ...dataArticle,
      author: { id: userId },
    });
    const savedArticle = await this.articleRepository.save(newArticle);
    const article = await this.articleRepository.findOne({
      where: { id: savedArticle.id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return { article: toArticleResponse(article) };
  }

  async findBySlug(slug: string): Promise<{ article: ArticleResponseDto }> {
    const article = await this.articleRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return { article: toArticleResponse(article) };
  }

  async updateArticle(
    slug: string,
    dataArticle: Partial<Article>,
    userId: number,
  ): Promise<{ article: ArticleResponseDto }> {
    const article = await this.articleRepository.findOne({
      where: { slug, author: { id: userId } },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundException('Article not found or unauthorized');
    }

    if (dataArticle.title && dataArticle.title !== article.title) {
      const newSlug = slugify(dataArticle.title, { lower: true, strict: true });
      const exists = await this.articleRepository.exists({
        where: { slug: newSlug },
      });
      if (exists) {
        throw new ConflictException('Slug already exists');
      }
      article.slug = newSlug;
    }

    Object.assign(article, dataArticle);

    const updated = await this.articleRepository.save(article);
    return { article: toArticleResponse(updated) };
  }

  async deleteArticle(slug: string, userId: number): Promise<void> {
    const article = await this.articleRepository.findOne({
      where: { slug, author: { id: userId } },
    });
    if (!article) {
      throw new NotFoundException('Article not found or unauthorized');
    }
    await this.articleRepository.remove(article);
  }

  async findAllArticles(query: {
    tag?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ articles: ArticleResponseDto[]; articlesCount: number }> {
    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');

    if (query.tag) {
      qb.andWhere('JSON_CONTAINS(article.tagList, :tag)', {
        tag: JSON.stringify(query.tag),
      });
    }

    if (query.author) {
      qb.andWhere('author.name = :author', { author: query.author });
    }

    qb.take(query.limit ?? 5);
    qb.skip(query.offset ?? 0);
    qb.orderBy('article.createdAt', 'DESC');

    const [articles, articlesCount] = await qb.getManyAndCount();
    return {
      articles: articles.map((a) => toArticleResponse(a)),
      articlesCount,
    };
  }
}
