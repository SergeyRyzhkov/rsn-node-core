import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { SiteSection } from './SiteSection';
import { BusinessService } from './BusinessService';


@Entity('article')
export class Article {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'article_id'
  })
  public articleId: number;



  @ManyToOne(() => SiteSection)
  @JoinColumn({ name: 'site_section_id' })
  public siteSection: Promise<SiteSection | null | number>;

  @RelationId((article: Article) => article.siteSection)
  public siteSectionId: null | number;

  @Column('text', {
    nullable: false,
    name: 'article_publish_date'
  })
  public articlePublishDate: string;


  @Column('text', {
    nullable: true,
    name: 'article_author'
  })
  public articleAuthor: string | null;


  @Column('text', {
    nullable: false,
    name: 'article_title'
  })
  public articleTitle: string;

  @Column('text', {
    nullable: false,
    name: 'article_h1'
  })
  public articleH1: string;


  @Column('text', {
    nullable: true,
    name: 'article_slug'
  })
  public articleSlug: string | null;


  @Column('text', {
    nullable: false,
    name: 'article_description'
  })
  public articleDescription: string;


  @Column('text', {
    nullable: true,
    name: 'article_body'
  })
  public articleBody: string | null;

  @Column('text', {
    nullable: true,
    name: 'article_source'
  })
  public articleSource: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'article_views_number'
  })
  public articleViewsNumber: number | null;


  @Column('numeric', {
    nullable: false,
    name: 'article_status'
  })
  public articleStatus: number;

}
