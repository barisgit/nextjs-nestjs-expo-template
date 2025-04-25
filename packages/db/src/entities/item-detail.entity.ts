import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum DetailLevel {
  BASIC = "basic",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

@Entity("item_details")
export class ItemDetail {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text")
  description: string;

  @Column("simple-array", { nullable: true })
  tags: string[];

  @Column({ name: "detail_value", type: "int", nullable: true })
  detailValue: number;

  @Column({
    type: "enum",
    enum: DetailLevel,
    default: DetailLevel.INTERMEDIATE,
  })
  level: DetailLevel;

  @Column('varchar', { nullable: true })
  category: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
