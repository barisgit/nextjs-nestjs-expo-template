import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from "typeorm";
import { Game } from "./game.entity";
import { Question } from "./question.entity";

@Entity("game_questions")
export class GameQuestion {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Game, (game) => game.gameQuestions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "game_id" })
  game: Game;

  @Column({ name: "game_id" })
  gameId: string;

  @ManyToOne(() => Question, { eager: true, onDelete: "CASCADE" }) // Eager load question details
  @JoinColumn({ name: "question_id" })
  question: Question;

  @Column({ name: "question_id" })
  questionId: string;

  @Column({ name: "round_number" })
  roundNumber: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
