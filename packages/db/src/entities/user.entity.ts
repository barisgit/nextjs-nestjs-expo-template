import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, length: 255 })
  clerkUserId: string;

  // Add password hash later if needed
  // @Column()
  // passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => GameParticipant, (gameParticipant) => gameParticipant.user)
  // gameParticipants: GameParticipant[];

  // @OneToMany(() => UserAnswer, (userAnswer) => userAnswer.user)
  // userAnswers: UserAnswer[];
}
