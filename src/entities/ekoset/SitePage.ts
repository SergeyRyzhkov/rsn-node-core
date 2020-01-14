import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('site_page')
export default class SitePage {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'site_page_id'
  })
  public sitePageId: number

  @Column('text', {
    nullable: true,
    name: 'site_page_name'
  })
  public sitePageName: string

  @Column('text', {
    nullable: true,
    name: 'site_page_h1'
  })
  public sitePageH1: string

  @Column('text', {
    nullable: true,
    name: 'site_page_menu_name'
  })
  public sitePageMenuName: string

  @Column('text', {
    nullable: true,
    name: 'site_page_banner'
  })
  public sitePageBanner: string

  @Column('text', {
    nullable: true,
    name: 'site_page_route_name'
  })
  public sitePageRouteName: string

  @Column('numeric', {
    nullable: true,
    name: 'site_page_menu_position'
  })
  public sitePageMenuPosition: number

  @Column('numeric', {
    nullable: true,
    name: 'site_page_status'
  })
  public sitePageStatus: number


  @Column('numeric', {
    nullable: true,
    name: 'site_section_id'
  })
  public siteSectionId: number
}

export enum SitePageType {
  UFO,
  MAIN,
  ABOUT,
  CLIENTS,
  PRICES,
  NEWS,
  CONTACTS
}
