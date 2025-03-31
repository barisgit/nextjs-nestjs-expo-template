import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Question, QuestionDifficulty } from "../db/entities/question.entity";
import { CreateQuestionDto } from "./dto/create-question.dto";

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({ where: { id } });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async create(questionData: CreateQuestionDto): Promise<Question> {
    let difficultyEnum: QuestionDifficulty;
    const difficultyValue = questionData.difficulty?.toLowerCase();

    if (
      Object.values(QuestionDifficulty).includes(
        difficultyValue as QuestionDifficulty
      )
    ) {
      difficultyEnum = difficultyValue as QuestionDifficulty;
    } else {
      console.warn(
        `Invalid difficulty provided: ${questionData.difficulty}. Defaulting to MEDIUM.`
      );
      difficultyEnum = QuestionDifficulty.MEDIUM;
    }

    const question = this.questionsRepository.create({
      text: questionData.text,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      difficulty: difficultyEnum,
      category: questionData.category,
    });

    return this.questionsRepository.save(question);
  }

  async update(id: string, questionData: Partial<Question>): Promise<Question> {
    await this.questionsRepository.update(id, questionData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.questionsRepository.delete(id);
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    return this.questionsRepository
      .createQueryBuilder("question")
      .orderBy("RANDOM()")
      .take(count)
      .getMany();
  }
}
