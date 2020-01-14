import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from 'typeorm';


@Entity('cl_site_setting')
export class ClSiteSetting {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_site_setting_id'
  })
  public clSiteSettingId: number;


  @Column('text', {
    nullable: true,
    name: 'cl_site_setting_name'
  })
  public clSiteSettingName: string | null;


  @Column('text', {
    nullable: true,
    name: 'cl_site_setting_val'
  })
  public clSiteSettingVal: string | null;


  @Column('text', {
    nullable: true,
    name: 'cl_site_setting_display_name'
  })
  public clSiteSettingDisplayName: string | null;

}
