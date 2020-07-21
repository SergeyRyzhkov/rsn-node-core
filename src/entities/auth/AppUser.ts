import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('app_user')
export class AppUser {

  @PrimaryGeneratedColumn({
    name: 'app_user_id'
  })
  public appUserId: number;


  @Column('text', {
    nullable: true,
    name: 'app_user_full_name'
  })
  public appUserFullName: string;


  @Column('text', {
    nullable: true,
    name: 'app_user_email'
  })
  public appUserEmail: string;


  @Column('text', {
    nullable: true,
    name: 'app_user_pwd_hash'
  })
  public appUserPwdHash: string;


  @Column({
    name: 'app_user_reg_date'
  })
  public appUserRegDate: string;


  @Column('numeric', {
    nullable: true,
    name: 'app_user_blocked_ind'
  })
  public appUserBlockedInd: number;


  @Column({
    name: 'app_user_blocked_date'
  })
  public appUserBlockedDate: string;

  @Column('numeric', {
    name: 'app_user_reg_verified_ind'
  })
  public appUserRegVerifiedInd: number;

  @Column({
    name: 'app_user_reg_token'
  })
  public appUserRegToken: string;

  @Column('text', {
    nullable: true,
    name: 'app_user_reset_pwd'
  })
  public appUserResetPwd: string;


  @Column({
    name: 'app_user_reset_exp_date'
  })
  public appUserResetExpDate: string;


  @Column({
    name: 'app_user_reset_pwd_date'
  })
  public appUserResetPwdDate: string;
}
