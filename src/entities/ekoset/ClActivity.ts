import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { IndividualOffer } from './IndividualOffer';
import { BusinessService } from './BusinessService';


@Entity('cl_activity')
export class ClActivity {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_activity_id'
  })
  public clActivityId: number;


  @Column('text', {
    nullable: true,
    name: 'cl_activity_name'
  })
  public clActivityName: string | null;


  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_activity_img_big'
  // })
  // public clActivityImgBig: string | null;


  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_activity_img_small'
  // })
  // public clActivityImgSmall: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'cl_activity_status'
  })
  public clActivityStatus: number | null;


  @Column('numeric', {
    nullable: true,
    name: 'cl_activity_priority'
  })
  public clActivityPriority: number | null;

}
