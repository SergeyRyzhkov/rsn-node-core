import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity('app_user_social_net_profile')
export class AppUserSocialNetProfile {

  @PrimaryGeneratedColumn({
    name: 'user_sn_profile_id'
  })
  public userSnProfileId: number;


  @Column({ name: 'app_user_id' })
  public appUserId: number;

  @Column('numeric', {
    nullable: false,
    name: 'user_sn_profile_code'
  })
  public userSnProfileCode: number;


  @Column('text', {
    nullable: false,
    name: 'user_sn_profile_type'
  })
  public userSnProfileType: string;

  public appUserEmail: string;

  @Column('text', {
    nullable: true,
    name: 'user_sn_profile_nick'
  })
  public userSnProfileNick: string;


  @Column('text', {
    nullable: true,
    name: 'user_sn_profile_email'
  })
  public userSnProfileEmail: string;


  @Column('text', {
    nullable: true,
    name: 'user_sn_profile_link'
  })
  public userSnProfileLink: string;


  @Column('text', {
    nullable: true,
    name: 'user_sn_profile_avatar'
  })
  public userSnProfileAvatar: string;
}
