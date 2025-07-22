import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season } from 'libs/entities/season.entity';
import { User } from 'libs/entities/user.entity';
import { CreateSeasonDto } from 'libs/dto/season.dto';

@Injectable()
export class SeasonService {
  constructor(
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateSeasonDto): Promise<Season> {
    const user = await this.userRepo.findOne({ where: { id: dto.createdById } });
    if (!user) throw new NotFoundException('Usuario creador no encontrado');
    const season = this.seasonRepo.create({
      name: dto.name,
      createdBy: user,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
    return this.seasonRepo.save(season);
  }
}
