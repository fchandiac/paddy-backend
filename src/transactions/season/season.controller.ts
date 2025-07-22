import { Controller, Post, Body } from '@nestjs/common';
import { SeasonService } from './season.service';
import { CreateSeasonDto } from 'libs/dto/season.dto';

@Controller('seasons')
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post()
  async create(@Body() dto: CreateSeasonDto) {
    return this.seasonService.create(dto);
  }
}
