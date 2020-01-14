import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { SiteSection } from './SiteSection';


@Entity('individual_offer', { schema: 'brc_ekoset' })
export class IndividualOffer {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'ind_offer_id'
  })
  public indOfferId: number;

  @Column('integer', {
    nullable: true,
    name: 'cl_client_id'
  })
  public clClientId: number | null;

  @Column('integer', {
    nullable: true,
    name: 'cl_activity_id'
  })
  public clActivityId: number | null;


  @ManyToOne(() => SiteSection)
  @JoinColumn({ name: 'site_section_id' })
  public siteSection: Promise<SiteSection | null | number>;

  @Column({ name: 'site_section_id' })
  @RelationId((individual_offer: IndividualOffer) => individual_offer.siteSection)
  public siteSectionId: number | null;

  @Column('text', {
    nullable: false,
    name: 'ind_offer_name'
  })
  public indOfferName: string;

  @Column('text', {
    nullable: true,
    name: 'ind_offer_h1'
  })
  public indOfferH1: string | null;


  @Column('text', {
    nullable: true,
    name: 'ind_offer_slug'
  })
  public indOfferSlug: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'ind_offer_priority'
  })
  public indOfferPriority: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'ind_offer_status'
  })
  public indOfferStatus: number | null;


  @Column('text', {
    nullable: true,
    name: 'ind_offer_free_text1'
  })
  public indOfferFreeText1: string | null;

  @Column('text', {
    nullable: true,
    name: 'ind_offer_free_text2'
  })
  public indOfferFreeText2: string | null;


  @Column('text', {
    nullable: true,
    name: 'ind_offer_footer_content_right'
  })
  public indOfferFooterContentRight: string | null;

  @Column('text', {
    nullable: true,
    name: 'ind_offer_footer_content_left'
  })
  public indOfferFooterContentLeft: string | null;


}
