import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Article } from './Article';


@Entity('cl_article_tag')
export class ClArticleTag {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_article_id'
  })
  public clArticleId: number;


  @Column('text', {
    nullable: true,
    name: 'cl_article_name'
  })
  public clArticleName: string | null;
}
