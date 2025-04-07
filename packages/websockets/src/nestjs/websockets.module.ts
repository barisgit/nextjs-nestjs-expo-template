import { Module } from "@nestjs/common";
import { WebsocketGateway } from "./websocket.gateway.js";
import { WebsocketService } from "./websocket.service.js";

@Module({
  providers: [WebsocketGateway, WebsocketService],
  exports: [WebsocketService],
})
export class WebsocketsModule {}
