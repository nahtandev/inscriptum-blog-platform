import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PublisherEntity, UserEntity } from "./user.model";
import { UserService } from "./user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PublisherEntity]),
    // AuthModule,
  ],
  exports: [UserService],
  providers: [UserService],
})
export class UserModule {}
