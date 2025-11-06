import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.enity';
import { User } from './user.entity';

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
}
