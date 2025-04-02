import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity.js";
import { Item } from "./entities/item.entity.js";
import { ItemDetail } from "./entities/item-detail.entity.js";
import { UserItem } from "./entities/user-item.entity.js";
// import { GameParticipant } from "./entities/game-participant.entity";
import { dataSourceOptions } from "../data-source.js";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => dataSourceOptions,
    }),
    TypeOrmModule.forFeature([User, Item, ItemDetail, UserItem]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
