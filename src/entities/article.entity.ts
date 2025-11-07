import {
  Entity,
  Column,
  ManyToOne,
  BeforeInsert,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { BaseEntity } from './base.enity';
import { User } from './user.entity';
import { Comment } from './comment.entity';
import slugify from 'slugify';

@Entity('articles')
export class Article extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.articles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.article)
  comments: Comment[];

  @Column({ type: 'json', nullable: true })
  tagList: string[];

  @Column({ unique: true })
  slug: string;

  @Column({ default: 0 })
  favoritesCount: number;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  @ManyToMany(() => User, (user) => user.favoritedArticles)
  @JoinTable({ name: 'article_favortites' })
  favoritedBy: User[];
}
