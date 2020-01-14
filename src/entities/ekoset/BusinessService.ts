import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { SiteSection } from './SiteSection';


@Entity('business_service')
export class BusinessService {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'business_service_id'
  })
  public businessServiceId: number;



  @ManyToOne(() => SiteSection)
  @JoinColumn({ name: 'site_section_id' })
  public siteSection: Promise<SiteSection | null | number>;

  @Column({ name: 'site_section_id' })
  @RelationId((business_service: BusinessService) => business_service.siteSection)
  public siteSectionId: number | null;

  @Column('text', {
    nullable: false,
    name: 'business_service_name'
  })
  public businessServiceName: string;


  @Column('text', {
    nullable: false,
    name: 'business_service_h1'
  })
  public businessServiceH1: string;


  @Column('text', {
    nullable: true,
    name: 'business_service_slug'
  })
  public businessServiceSlug: string | null;


  @Column('text', {
    nullable: true,
    name: 'business_service_unit'
  })
  public businessServiceUnit: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'business_service_price'
  })
  public businessServicePrice: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'business_service_status'
  })
  public businessServiceStatus: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'business_service_priority'
  })
  public businessServicePriority: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'business_service_parent_id'
  })
  public businessServiceParentId: number | null;

  @Column('text', {
    nullable: true,
    name: 'business_service_free_text1'
  })
  public businessServiceFreeText1: string | null;

  @Column('text', {
    nullable: true,
    name: 'business_service_free_text2'
  })
  public businessServiceFreeText2: string | null;


  @Column('text', {
    nullable: true,
    name: 'business_service_footer_content_left'
  })
  public businessServiceFooterContentLeft: string | null;

  @Column('text', {
    nullable: true,
    name: 'business_service_footer_content_right'
  })
  public businessServiceFooterContentRight: string | null;
}
