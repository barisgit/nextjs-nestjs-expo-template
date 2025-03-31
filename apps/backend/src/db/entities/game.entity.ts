import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { GameQuestion } from "./game-question.entity";

export enum GameStatus {
  PENDING = "pending", // Waiting for players
  ACTIVE = "active", // Game in progress
  COMPLETED = "completed",
  ABORTED = "aborted",
}

@Entity("games")
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "enum",
    enum: GameStatus,
    default: GameStatus.PENDING,
  })
  status: GameStatus;

  @Column({ name: "max_players", default: 4 })
  maxPlayers: number;

  @Column({ name: "current_round", default: 1 })
  currentRound: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  gameQuestions: GameQuestion[];
}
