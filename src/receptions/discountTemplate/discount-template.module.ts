import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountTemplate } from 'libs/entities/discount-template.entity';
import { DiscountTemplateService } from './discount-template.service';
import { DiscountTemplateController } from './discount-template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DiscountTemplate])],
  controllers: [DiscountTemplateController],
  providers: [DiscountTemplateService],
  exports: [DiscountTemplateService],
})
export class DiscountTemplateModule {}
