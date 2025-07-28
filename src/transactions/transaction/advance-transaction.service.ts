import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'libs/entities/transaction.entity';
import { User } from 'libs/entities/user.entity';
import { Producer } from 'libs/entities/producer.entity';
import { Season } from 'libs/entities/season.entity';
import { CreateAdvanceTransactionDto } from 'libs/dto/advance-transaction.dto';

@Injectable()
export class AdvanceTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
    @InjectRepository(Season)
    private readonly seasonRepo: Repository<Season>,
  ) {}

  async create(dto: CreateAdvanceTransactionDto): Promise<Transaction> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${dto.userId} no encontrado.`);

    const producer = await this.producerRepo.findOne({ where: { id: dto.producerId } });
    if (!producer) throw new NotFoundException(`Productor con ID ${dto.producerId} no encontrado.`);

    const season = dto.seasonId ? await this.seasonRepo.findOne({ where: { id: dto.seasonId } }) : null;

    const trx = this.transactionRepo.create({
      typeCode: dto.typeCode,
      producer,
      producerId: dto.producerId,
      user,
      userId: dto.userId,
      season: season || null,
      seasonId: dto.seasonId,
      amount: dto.amount,
      notes: dto.notes,
      metadata: dto.metadata,
    });
    return this.transactionRepo.save(trx);
  }
}
