import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { PartnerGroup } from './PartnerGroup';


@Entity('partner')
export class Partner {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'partner_id'
  })
  public partnerId: number;



  @ManyToOne(() => PartnerGroup)
  @JoinColumn({ name: 'partner_group_id' })
  public partnerGroup: Promise<PartnerGroup | null | number>;

  @RelationId((partner: Partner) => partner.partnerGroup)
  public partnerGroupId: number | null;

  @Column('text', {
    nullable: true,
    name: 'partner_name'
  })
  public partnerName: string | null;


  @Column('text', {
    nullable: true,
    name: 'partner_url'
  })
  public partnerUrl: string | null;


  @Column('numeric', {
    nullable: true,
    name: 'partner_priority'
  })
  public partnerPriority: number | null;

  @Column('numeric', {
    nullable: true,
    name: 'partner_status'
  })
  public partnerStatus: number | null;


}
