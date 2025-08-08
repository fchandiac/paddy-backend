import { Controller, Post, Body, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { SeasonService } from './season.service';
import { CreateSeasonDto } from 'libs/dto/season.dto';
import { JweAuthGuard } from '../../auth/jwe/jwe-auth.guard';
import { AuditInterceptor, Audit } from '../../common/interceptors/audit.interceptor';

@Controller('seasons')
@UseGuards(JweAuthGuard)
@UseInterceptors(AuditInterceptor)
export class SeasonController {
  constructor(private readonly seasonService: SeasonService) {}

  @Post()
  @Audit('CREATE', 'SEASON', 'Crear temporada')
  async create(@Body() dto: CreateSeasonDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.seasonService.create(dto, userId);
  }
}
