import { Module } from '@nestjs/common';
import { ProducerController } from './producer.controller';
import { ProducerService } from './producer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producer } from '../../../libs/entities/producer.entity'; // ✅ corrige la ruta si estás dentro de src/auth/producer/

@Module({
  imports: [
    TypeOrmModule.forFeature([Producer]), 
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
