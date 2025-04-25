import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import { Item } from "./item.entity.js";
import { User } from "./user.entity.js";

@Entity("user_items")
export class UserItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne("Item", (item: Item) => item.userItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "item_id" })
  item: Item;

  @Column('uuid', { name: "item_id" })
  itemId: string;

  @ManyToOne("User", { eager: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column('uuid', { name: "user_id" })
  userId: string;

  @Column('varchar', { name: "user_specific_value", nullable: true })
  userSpecificValue: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
