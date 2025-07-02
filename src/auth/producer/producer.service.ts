import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producer } from '../../../libs/entities/producer.entity';
import {
  CreateProducerDto,
  CreateProducerWithBankDto,
  UpdateProducerDto,
} from '../../../libs/dto/producer.dto';
import { TransactionService } from '../../transactions/transaction/transaction.service';
import { TransactionTypeCode } from '../../../libs/enums';
import { CreateTransactionDto } from '../../../libs/dto/transaction.dto';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
    private readonly transactionService: TransactionService,
  ) {}

  async health(): Promise<string> {
    return 'ProducerService is healthy ✅';
  }

  async findAll(): Promise<Producer[]> {
    return this.producerRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<Producer> {
    const producer = await this.producerRepo.findOne({ where: { id } });
    if (!producer) {
      throw new NotFoundException(`Productor con ID ${id} no encontrado.`);
    }
    return producer;
  }

  async create(dto: CreateProducerDto): Promise<Producer> {
    const existing = await this.producerRepo.findOne({ where: { rut: dto.rut } });
    if (existing) {
      throw new ConflictException(`Ya existe un productor con el RUT ${dto.rut}.`);
    }

    const producer = this.producerRepo.create(dto);
    
    
    return this.producerRepo.save(producer);
  }

  async createWithBankAccount(dto: CreateProducerWithBankDto): Promise<Producer> {
    const existing = await this.producerRepo.findOne({ where: { rut: dto.rut } });
    if (existing) {
      throw new ConflictException(`Ya existe un productor con el RUT ${dto.rut}.`);
    }
  
    const bankAccounts = dto.bank
      ? [
          {
            bank: dto.bank,
            accountNumber: dto.accountNumber,
            accountType: dto.accountType,
            holderName: dto.holderName ?? dto.name, // por defecto usamos el nombre del productor
          },
        ]
      : [];
  
    const producer = this.producerRepo.create({
      ...dto,
      bankAccounts,
    });
  
    return this.producerRepo.save(producer);
  }


  async addBankAccount(
    producerId: number,
    account: {
      bank: string;
      accountNumber: string;
      accountType: string;
      holderName?: string;
    }
  ): Promise<Producer> {
    const producer = await this.producerRepo.findOne({ where: { id: producerId } });
  
    if (!producer) {
      throw new NotFoundException(`No se encontró el productor con ID ${producerId}`);
    }
  
    const existingAccounts = producer.bankAccounts || [];
  
    const updatedAccounts = [...existingAccounts, account];
  
    producer.bankAccounts = updatedAccounts;
  
    return this.producerRepo.save(producer);
  }
  
  

  async update(id: number, dto: UpdateProducerDto): Promise<Producer> {
    const producer = await this.findById(id);

    Object.assign(producer, dto);

    return this.producerRepo.save(producer);
  }

  async remove(id: number): Promise<void> {
    const producer = await this.findById(id);
    await this.producerRepo.softRemove(producer);
  }
}
