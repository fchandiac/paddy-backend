import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'libs/entities/transaction.entity';
import { User } from 'libs/entities/user.entity';
import { Producer } from 'libs/entities/producer.entity';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
  ) {}

  async health() {
    return { status: 'Transaction service is up' };
  }

  async findAll(filter?: FilterTransactionDto): Promise<Transaction[]> {
    const query = this.transactionRepo.createQueryBuilder('transaction');

    if (filter?.userId) query.andWhere('transaction.userId = :userId', { userId: filter.userId });
    if (filter?.producerId) query.andWhere('transaction.producerId = :producerId', { producerId: filter.producerId });
    if (filter?.typeCode) query.andWhere('transaction.typeCode = :typeCode', { typeCode: filter.typeCode });
    if (filter?.description) query.andWhere('transaction.description ILIKE :description', { description: `%${filter.description}%` });

    return query.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  async findById(id: number): Promise<Transaction> {
    const trx = await this.transactionRepo.findOne({ where: { id } });
    if (!trx) throw new NotFoundException(`Transacción con ID ${id} no encontrada.`);
    return trx;
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${dto.userId} no encontrado.`);

    const producer = await this.producerRepo.findOne({ where: { id: dto.producerId } });
    if (!producer) throw new NotFoundException(`Productor con ID ${dto.producerId} no encontrado.`);

    let lastTransaction: Transaction | null = null;
    if (dto.lastTransaction) {
      lastTransaction = await this.transactionRepo.findOne({ where: { id: dto.lastTransaction } });
      if (!lastTransaction) throw new NotFoundException(`Transacción anterior con ID ${dto.lastTransaction} no encontrada.`);
    }

    const trx = this.transactionRepo.create({
      user,
      producer,
      typeCode: dto.typeCode,
      debit: dto.debit,
      credit: dto.credit,
      description: dto.description,
      previousBalance: dto.previousBalance,
      balance: dto.balance,
      lastTransaction: lastTransaction || null,
      isDraft: dto.isDraft || false,
    });

    return this.transactionRepo.save(trx);
  }

  async findAllByProducer(producerId: number): Promise<Transaction[]> {
    return this.transactionRepo.find({
      where: { producer: { id: producerId } },
      order: { createdAt: 'DESC' },
    });
  }
  


  
}
