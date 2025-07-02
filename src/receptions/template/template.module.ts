import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from 'libs/entities/template.entity';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { Producer } from 'libs/entities/producer.entity';
import { Reception } from 'libs/entities/reception.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Template, Producer, Reception])],
  controllers: [TemplateController],
  providers: [TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
