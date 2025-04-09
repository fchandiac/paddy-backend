import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { User } from '../../../libs/entities/user.entity'; 
import { RecordModule } from '../record/record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RecordModule,
  ],

  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], 
})
export class UserModule {}
