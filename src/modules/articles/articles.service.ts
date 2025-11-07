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
import { Comment } from 'src/entities/comment.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { toCommnetResponse } from './utils/comment.mapper';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
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

  async createComment(
    slug: string,
    dataCmt: Partial<Comment>,
    userId: number,
  ): Promise<{ comment: CommentResponseDto }> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const newComment = this.commentRepository.create({
      ...dataCmt,
      author: { id: userId },
      article: { id: article.id },
    });
    const savedComment = await this.commentRepository.save(newComment);
    const comment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return { comment: toCommnetResponse(comment) };
  }

  async findCommentsByArticleSlug(
    slug: string,
  ): Promise<{ comments: CommentResponseDto[] }> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    const comments = await this.commentRepository.find({
      where: { article: { id: article.id } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    return {
      comments: comments.map((cmt) => toCommnetResponse(cmt)),
    };
  }

  async deleteComment(
    slug: string,
    cmtId: number,
    userId: number,
  ): Promise<string> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { id: cmtId, article: { id: article.id }, author: { id: userId } },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found or unauthorized');
    }

    await this.commentRepository.remove(comment);
    return 'Comment deleted successfully';
  }
}
