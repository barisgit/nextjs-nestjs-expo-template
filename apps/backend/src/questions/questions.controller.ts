import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { Question } from "../db/entities/question.entity";
import { CreateQuestionDto } from "./dto/create-question.dto";

@Controller("questions")
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  async findAll(): Promise<Question[]> {
    return this.questionsService.findAll();
  }

  @Get("random")
  async getRandomQuestions(
    @Query("count") count: number = 10
  ): Promise<Question[]> {
    return this.questionsService.getRandomQuestions(count);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  @Post()
  async create(@Body() questionData: CreateQuestionDto): Promise<Question> {
    return this.questionsService.create(questionData);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() questionData: Partial<Question>
  ): Promise<Question> {
    return this.questionsService.update(id, questionData);
  }

  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return this.questionsService.remove(id);
  }
}
