import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.enity';
import { User } from './user.entity';
import { Article } from './article.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  author: User;

  @ManyToOne(() => Article, (article) => article.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  article: Article;
}
