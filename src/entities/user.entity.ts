import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base.enity';
import { Article } from './article.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  username: string;

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

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ManyToMany(() => Article, (article) => article.favoritedBy)
  favoritedArticles: Article[];

  @ManyToMany(() => User, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'followerId' },
    inverseJoinColumn: { name: 'followingId' },
  })
  following: User[];

  @ManyToMany(() => User, (user) => user.following)
  followers: User[];
}
