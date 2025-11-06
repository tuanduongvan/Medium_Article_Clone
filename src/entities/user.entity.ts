import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.enity';
import { Article } from './article.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  refresh_token: string;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
