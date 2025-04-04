import { DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User, Item, ItemDetail, UserItem } from "./entities/index.js";
import { dataSourceOptions } from "./data-source.js";

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: () => dataSourceOptions,
        }),
      ],
      exports: [TypeOrmModule],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forFeature([User, Item, ItemDetail, UserItem])],
      exports: [TypeOrmModule],
    };
  }
}
