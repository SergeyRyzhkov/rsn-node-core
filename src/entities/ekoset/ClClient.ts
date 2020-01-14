import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

@Entity('cl_Client')
export class ClClient {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'cl_client_id'
  })
  public clClientId: number;


  @Column('text', {
    nullable: true,
    name: 'cl_client_name'
  })
  public clClientName: string | null;

  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_client_img_small'
  // })
  // public clClientImgSmall: string | null;


  // @Column('text', {
  //   nullable: true,
  //   name: 'cl_client_img_big'
  // })
  // public clClientImgBig: string | null;
}
