import { Entity, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { BaseEntity } from './base.enity';
import { User } from './user.entity';
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

  @Column({ type: 'json', nullable: true })
  tagList: string[];

  @Column({ unique: true })
  slug: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
}
