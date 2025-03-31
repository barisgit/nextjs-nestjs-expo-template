import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1743390614407 implements MigrationInterface {
    name = 'InitialSchema1743390614407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."questions_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" text NOT NULL, "options" text NOT NULL, "correctAnswer" character varying NOT NULL, "difficulty" "public"."questions_difficulty_enum" NOT NULL DEFAULT 'medium', "category" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "game_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "game_id" uuid NOT NULL, "question_id" uuid NOT NULL, "round_number" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8655fa1f9639162ee24c3a5582a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."games_status_enum" AS ENUM('pending', 'active', 'completed', 'aborted')`);
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."games_status_enum" NOT NULL DEFAULT 'pending', "max_players" integer NOT NULL DEFAULT '4', "current_round" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_4c5351759926b365b1572dbdd1e" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "game_questions" ADD CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_8b122e0afbb8b1a90a9b8c8ab56"`);
        await queryRunner.query(`ALTER TABLE "game_questions" DROP CONSTRAINT "FK_4c5351759926b365b1572dbdd1e"`);
        await queryRunner.query(`DROP TABLE "games"`);
        await queryRunner.query(`DROP TYPE "public"."games_status_enum"`);
        await queryRunner.query(`DROP TABLE "game_questions"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_difficulty_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
