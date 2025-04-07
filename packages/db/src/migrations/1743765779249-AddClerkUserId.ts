import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClerkUserId1743765779249 implements MigrationInterface {
  name = "AddClerkUserId1743765779249";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "clerkUserId" character varying(255)`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "users"."clerkUserId" IS 'The user ID from Clerk authentication'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "clerkUserId"`);
  }
}
