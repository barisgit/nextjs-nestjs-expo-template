import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1745601809237 implements MigrationInterface {
    name = 'InitialMigration1745601809237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(50) NOT NULL, "email" character varying(255) NOT NULL, "clerkUserId" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."items_status_enum" AS ENUM('pending', 'active', 'completed', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."items_status_enum" NOT NULL DEFAULT 'pending', "example_numeric_field" integer NOT NULL DEFAULT '0', "example_string_field" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."item_details_level_enum" AS ENUM('basic', 'intermediate', 'advanced')`);
        await queryRunner.query(`CREATE TABLE "item_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text NOT NULL, "tags" text, "detail_value" integer, "level" "public"."item_details_level_enum" NOT NULL DEFAULT 'intermediate', "category" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5454cdc4a554db3678109d12533" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "item_id" uuid NOT NULL, "user_id" uuid NOT NULL, "user_specific_value" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_73bc2ecd8f15ae345af4d8c3c09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_items" ADD CONSTRAINT "FK_9a25434e868cc98a8401560adc8" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_items" ADD CONSTRAINT "FK_020e818d4ac25c16e4906f27d8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_items" DROP CONSTRAINT "FK_020e818d4ac25c16e4906f27d8b"`);
        await queryRunner.query(`ALTER TABLE "user_items" DROP CONSTRAINT "FK_9a25434e868cc98a8401560adc8"`);
        await queryRunner.query(`DROP TABLE "user_items"`);
        await queryRunner.query(`DROP TABLE "item_details"`);
        await queryRunner.query(`DROP TYPE "public"."item_details_level_enum"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TYPE "public"."items_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
