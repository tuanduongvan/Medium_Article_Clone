import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createArticle(
    @Request() request: any,
    @Body() createArticle: CreateArticleDto,
  ): Promise<{ article: ArticleResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    const article = await this.articlesService.createArticle(
      createArticle,
      currentUserId,
    );
    return article;
  }

  @Get(':slug')
  async getArticleBySlug(
    @Param('slug') slug: string,
  ): Promise<{ article: ArticleResponseDto }> {
    const article = await this.articlesService.findBySlug(slug);
    return article;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug')
  async toUpdateArticle(
    @Param('slug') slug: string,
    @Request() request: any,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<{ article: ArticleResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    const article = await this.articlesService.updateArticle(
      slug,
      updateArticleDto,
      currentUserId,
    );
    return article;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug')
  async toDeleteArticle(
    @Param('slug') slug: string,
    @Request() request: any,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    await this.articlesService.deleteArticle(slug, currentUserId);
  }

  @Get()
  async toGetAllArticles(
    @Query('tag') tag?: string,
    @Query('author') author?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ articles: ArticleResponseDto[]; articlesCount: number }> {
    const articles = await this.articlesService.findAllArticles({
      tag,
      author,
      limit,
      offset,
    });

    return articles;
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/comments')
  async addComment(
    @Param('slug') slug: string,
    @Request() request: any,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<{ comment: CommentResponseDto }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    return await this.articlesService.createComment(
      slug,
      createCommentDto,
      currentUserId,
    );
  }

  @Get(':slug/comments')
  async getComments(
    @Param('slug') slug: string,
  ): Promise<{ comments: CommentResponseDto[] }> {
    return await this.articlesService.findCommentsByArticleSlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':slug/comments/:id')
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') id: number,
    @Request() request: any,
  ): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const currentUserId = request.user.userId as number;
    return await this.articlesService.deleteComment(slug, id, currentUserId);
  }
}
