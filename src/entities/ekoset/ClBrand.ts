import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('cl_brand')
export class ClBrand {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_brand_id'
  })
  public clBrandId: number;

  @Column('text', {
    nullable: true,
    name: 'cl_brand_name'
  })
  public clBrandName: string | null;


  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_brand_img_small'
  // })
  // public clBrandImgSmall: string | null;


  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_brand_img_big'
  // })
  // public clBrandImgBig: string | null;


  @Column('text', {
    nullable: true,
    name: 'cl_brand_url'
  })
  public clBrandUrl: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'cl_brand_priority'
  })
  public clBrandPriority: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'cl_brand_main_page_visible'
  })
  public clBrandMainPageVisible: number | null;

  @Column('numeric', {
    nullable: true,
    name: 'cl_brand_status'
  })
  public clBrandStatus: number | null;

}
