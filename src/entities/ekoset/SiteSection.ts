import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('site_section')
export class SiteSection {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'site_section_id'
  })
  public siteSectionId: number;


  @Column('text', {
    nullable: false,
    name: 'site_section_name'
  })
  public siteSectionName: string;


  @Column('text', {
    nullable: true,
    name: 'site_section_slug'
  })
  public siteSectionSlug: string | null;

  @Column('text', {
    nullable: true,
    name: 'site_section_h1'
  })
  public siteSectionH1: string | null;

  @Column('numeric', {
    nullable: true,
    name: 'site_section_priority'
  })
  public siteSectionPriority: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'site_section_status'
  })
  public siteSectionStatus: number | null;

  @Column('text', {
    nullable: true,
    name: 'site_section_free_text1'
  })
  public siteSectionFreeText1: string;

  @Column('text', {
    nullable: true,
    name: 'site_section_free_text2'
  })
  public siteSectionFreeText2: string;

  @Column('text', {
    nullable: true,
    name: 'site_section_footer_content_left'
  })
  public siteSectionFooterContentLeft: string;

  @Column('text', {
    nullable: true,
    name: 'site_section_footer_content_right'
  })
  public siteSectionFooterContentRight: string;



}
