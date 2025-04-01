import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserItem } from "./user-item.entity";

export enum ItemStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  INACTIVE = "inactive",
}

@Entity("items")
export class Item {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: ItemStatus,
    default: ItemStatus.PENDING,
  })
  status: ItemStatus;

  @Column({ name: "example_numeric_field", default: 0 })
  exampleNumericField: number;

  @Column({ name: "example_string_field", type: "varchar", nullable: true })
  exampleStringField: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => UserItem, (userItem) => userItem.item)
  userItems: UserItem[];
}
