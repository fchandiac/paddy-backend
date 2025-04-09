import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ReceptionService } from './receptions.service';
import {
  CreateReceptionDto,
  UpdateReceptionDto,
} from '../../../libs/dto/reception.dto';

@Controller('receptions')
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  @Get('health')
  health() {
    return this.receptionService.health();
  }

  @Get()
  findAll() {
    return this.receptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateReceptionDto) {
    return this.receptionService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReceptionDto,
  ) {
    return this.receptionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.receptionService.remove(id);
  }
}
