import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Season } from 'libs/entities/season.entity';
import { User } from 'libs/entities/user.entity';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Season, User])],
  providers: [SeasonService],
  controllers: [SeasonController],
  exports: [SeasonService],
})
export class SeasonModule {}
