import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('proxy_list')
export class ProxyItem {

  @PrimaryGeneratedColumn({
    name: 'proxy_list_id'
  })
  public proxyListId: number;


  @Column('text', {
    nullable: true,
    name: 'proxy_list_source'
  })
  public proxyListSource: string;



  @Column('integer', {
    nullable: true,
    name: 'proxy_list_port'
  })
  public proxyListPort: number;

  @Column('text', {
    nullable: true,
    name: 'proxy_list_country'
  })
  public proxyListCountry: string;



  @Column('text', {
    nullable: true,
    name: 'proxy_list_ip_address'
  })
  public proxyListIpAddress: string;



  @Column('text', {
    nullable: true,
    name: 'proxy_list_protocol'
  })
  public proxyListProtocol: string;


  @Column('text', {
    nullable: true,
    name: 'proxy_list_anonymitylevel'
  })
  public proxyListAnonymitylevel: string;
}
