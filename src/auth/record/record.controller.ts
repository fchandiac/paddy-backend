import {
    Controller,
    Get,
    Post,
    Body,
  } from '@nestjs/common';
  import { RecordService } from './record.service';
  import { CreateRecordDto } from '../../../libs/dto/record.dto';
  import { Record } from '../../../libs/entities/record.entity';
  import { RecordFlat } from './record.service';
  
  @Controller('records')
  export class RecordController {
    constructor(private readonly recordService: RecordService) {}
  
    @Get()
    async findAll(): Promise<RecordFlat[]> {
      return this.recordService.findAll();
    }
  
    @Post()
    async create(@Body() dto: CreateRecordDto): Promise<Record> {
      return this.recordService.createRecord(dto);
    }
  }
  