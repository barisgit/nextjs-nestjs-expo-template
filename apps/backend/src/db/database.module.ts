import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { Item } from "./entities/item.entity";
import { ItemDetail } from "./entities/item-detail.entity";
import { UserItem } from "./entities/user-item.entity";
// import { GameParticipant } from "./entities/game-participant.entity";
import { dataSourceOptions } from "src/data-source";

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
