import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('cl_meta_tag')
export class ClMetaTag {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_meta_tag_id'
  })
  public clMetaTagId: number;


  @Column('text', {
    nullable: true,
    name: 'cl_meta_tag_name'
  })
  public clMetaTagName: string | null;


  @Column('text', {
    nullable: true,
    name: 'cl_meta_tag_hid'
  })
  public clMetaTagHid: string | null;


  @Column('text', {
    nullable: true,
    name: 'cl_meta_tag_property'
  })
  public clMetaTagProperty: string | null;

}
