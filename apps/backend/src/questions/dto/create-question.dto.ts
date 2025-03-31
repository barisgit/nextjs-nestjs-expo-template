import { QuestionDifficulty } from "../../db/entities/question.entity";

export class CreateQuestionDto {
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: QuestionDifficulty | string; // Allow string for input flexibility, convert in service
  category?: string;
}
