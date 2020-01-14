import { BaseEntity, Column, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { ClMetaTag } from './ClMetaTag';


@Entity('meta_tag_content')
export class MetaTagContent {

  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'meta_tag_content_id'
  })
  public metaTagContentId: number;


  @ManyToOne((type) => ClMetaTag)
  @JoinColumn({ name: 'cl_meta_tag_id' })
  public clMetaTag: Promise<ClMetaTag | null | number>;

  @RelationId((meta_tag_content: MetaTagContent) => meta_tag_content.clMetaTag)
  public clMetaTagId: number | null;

  @Column('text', {
    nullable: true,
    name: 'meta_tag_content_val'
  })
  public metaTagContentVal: string | null;

}
