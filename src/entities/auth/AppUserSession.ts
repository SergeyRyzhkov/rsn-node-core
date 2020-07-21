import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';


@Entity('app_user_session')
export class AppUserSession {

  @PrimaryGeneratedColumn({
    name: 'user_session_id'
  })
  public userSessionId: number;

  @Column({ name: 'app_user_id' })
  public appUserId: number;

  @Column({
    name: 'user_session_created_at'
  })
  public userSessionCreatedAt: string;


  @Column({
    name: 'user_session_updated_at'
  })
  public userSessionUpdatedAt: string;


  @Column({
    name: 'user_session_expired_at'
  })
  public userSessionExpiredAt: string;


  @Column('text', {
    name: 'user_session_token'
  })
  public userSessionToken: string;

  @Column('numeric', {
    name: 'user_session_block_ind'
  })
  public userSessionBlockInd: number;


  public appUserRegVerifiedInd: number;

  public appUserRegDate: string;
}

