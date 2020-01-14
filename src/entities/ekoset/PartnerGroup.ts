import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('partner_group')
export class PartnerGroup {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'partner_group_id'
  })
  public partnerGroupId: number;


  @Column('text', {
    nullable: true,
    name: 'partner_group_name'
  })
  public partnerGroupName: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'partner_group_priority'
  })
  public partnerGroupPriority: string | null;

}
