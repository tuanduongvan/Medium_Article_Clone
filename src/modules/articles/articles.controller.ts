import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

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
}
