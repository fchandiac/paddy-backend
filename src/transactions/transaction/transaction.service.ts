import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'libs/entities/transaction.entity';
import { User } from 'libs/entities/user.entity';
import { Producer } from 'libs/entities/producer.entity';
import { Season } from 'libs/entities/season.entity';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
import { CreateDiscountTransactionDto } from 'libs/dto/discount-transaction.dto';
import { TransactionTypeCode } from 'libs/enums';

/**
 * Servicio para gestionar las transacciones financieras del sistema.
 * 
 * Tipos de movimientos disponibles:
 * Código  | Tipo          | Traducción        | Descripción
 * --------|---------------|-------------------|------------------------------------------
 * 1       | ADVANCE       | Anticipo          | Pago anticipado antes de una operación completa.
 * 2       | SETTLEMENT    | Liquidación       | Liquidación de una operación o cuenta.
 * 3       | INTEREST      | Interés           | Cargo aplicado sobre el capital prestado o saldo pendiente.
 * 4       | CREDIT_NOTE   | Nota de crédito   | Documento que refleja un crédito a favor.
 * 5       | DEBIT_NOTE    | Nota de débito    | Documento que refleja un débito o cargo.
 */
@Injectable()
export class TransactionService {

  async createDiscount(dto: CreateDiscountTransactionDto): Promise<Transaction> {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${dto.userId} no encontrado.`);

    const producer = await this.producerRepo.findOne({ where: { id: dto.producerId } });
    if (!producer) throw new NotFoundException(`Productor con ID ${dto.producerId} no encontrado.`);

    // Validar detalles mínimos para descuento
    if (!dto.details || typeof dto.details !== 'object') {
      throw new BadRequestException('El campo details es obligatorio y debe ser un objeto.');
    }
    if (typeof dto.details.productId !== 'number') {
      throw new BadRequestException('El campo details.productId es obligatorio y debe ser numérico.');
    }
    if (typeof dto.details.discountPercent !== 'number') {
      throw new BadRequestException('El campo details.discountPercent es obligatorio y debe ser numérico.');
    }
    if (typeof dto.details.discountAmount !== 'number') {
      throw new BadRequestException('El campo details.discountAmount es obligatorio y debe ser numérico.');
    }

    const trx = this.transactionRepo.create({
      typeCode: TransactionTypeCode.DISCOUNT,
      producer,
      producerId: dto.producerId,
      user,
      userId: dto.userId,
      amount: dto.details.discountAmount,
      notes: dto.notes,
      metadata: dto.details,
    });
    return this.transactionRepo.save(trx);
  }
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

  async health() {
    return { status: 'Transaction service is up' };
  }

  async findAll(filter?: FilterTransactionDto): Promise<Transaction[]> {
    const query = this.transactionRepo.createQueryBuilder('transaction');

    if (filter?.userId) query.andWhere('transaction.userId = :userId', { userId: filter.userId });
    if (filter?.producerId) query.andWhere('transaction.producerId = :producerId', { producerId: filter.producerId });
    if (filter?.typeCode) query.andWhere('transaction.typeCode = :typeCode', { typeCode: filter.typeCode });
    if (filter?.notes) query.andWhere('transaction.notes LIKE :notes', { notes: `%${filter.notes}%` });
    return query.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  async findById(id: number): Promise<Transaction> {
    const trx = await this.transactionRepo.findOne({ where: { id } });
    if (!trx) throw new NotFoundException(`Transacción con ID ${id} no encontrada.`);
    return trx;
  }

  async create(dto: CreateTransactionDto, userId: number): Promise<Transaction> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Usuario con ID ${userId} no encontrado.`);

    const producer = await this.producerRepo.findOne({ where: { id: dto.producerId } });
    if (!producer) throw new NotFoundException(`Productor con ID ${dto.producerId} no encontrado.`);

    const season = dto.seasonId ? await this.seasonRepo?.findOne({ where: { id: dto.seasonId } }) : null;

    const trx = this.transactionRepo.create({
      typeCode: dto.typeCode,
      producer,
      producerId: dto.producerId,
      user,
      userId,
      season: season || null,
      seasonId: dto.seasonId,
      amount: dto.amount,
      date: dto.date,
      notes: dto.notes,
      metadata: dto.metadata,
    });
    return this.transactionRepo.save(trx);
  }

  async findAllByProducer(producerId: number): Promise<Transaction[]> {
    return this.transactionRepo.find({
      where: { producer: { id: producerId } },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Valida que el objeto details tenga la estructura correcta según el tipo de transacción
   * @param typeCode Tipo de transacción
   * @param details Objeto con los detalles específicos
   * @throws BadRequestException si los detalles no son válidos para el tipo de transacción
   */
  private validateTransactionDetails(typeCode: TransactionTypeCode, details: any): void {
    if (!details) return; // Si no hay detalles, no hay nada que validar
    
    switch (typeCode) {
      case TransactionTypeCode.ADVANCE:
        // Validación para anticipos
        if (details.advanceRate !== undefined && (details.advanceRate < 0 || details.advanceRate > 1)) {
          throw new BadRequestException('La tasa de anticipo debe estar entre 0 y 1');
        }
        
        // Validación para intereses en anticipos
        if (details.interest) {
          if (details.interest.dailyRate === undefined) {
            throw new BadRequestException('La tasa diaria de interés es obligatoria');
          }
          
          if (details.interest.dailyRate < 0) {
            throw new BadRequestException('La tasa diaria de interés no puede ser negativa');
          }
          
          if (!details.interest.startDate) {
            throw new BadRequestException('La fecha de inicio del interés es obligatoria');
          }
          
          // Validar que la fecha de inicio sea válida
          try {
            const startDate = new Date(details.interest.startDate);
            if (isNaN(startDate.getTime())) {
              throw new BadRequestException('La fecha de inicio del interés no es válida');
            }
          } catch (error) {
            throw new BadRequestException('La fecha de inicio del interés no es válida');
          }
          
          // Validar fecha de fin si existe
          if (details.interest.endDate) {
            try {
              const endDate = new Date(details.interest.endDate);
              if (isNaN(endDate.getTime())) {
                throw new BadRequestException('La fecha de fin del interés no es válida');
              }
              
              const startDate = new Date(details.interest.startDate);
              if (endDate < startDate) {
                throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
              }
            } catch (error) {
              throw new BadRequestException('La fecha de fin del interés no es válida');
            }
          }
          
          // Validar montos mínimos y máximos
          if (details.interest.minimumAmount !== undefined && details.interest.minimumAmount < 0) {
            throw new BadRequestException('El monto mínimo de interés no puede ser negativo');
          }
          
          if (details.interest.maximumAmount !== undefined && details.interest.maximumAmount < 0) {
            throw new BadRequestException('El monto máximo de interés no puede ser negativo');
          }
          
          if (details.interest.minimumAmount !== undefined && 
              details.interest.maximumAmount !== undefined && 
              details.interest.minimumAmount > details.interest.maximumAmount) {
            throw new BadRequestException('El monto mínimo no puede ser mayor que el monto máximo');
          }
        }
        break;
        
      case TransactionTypeCode.SETTLEMENT:
        // Validación para liquidaciones
        if (!details.receptionIds || !Array.isArray(details.receptionIds) || details.receptionIds.length === 0) {
          throw new BadRequestException('La liquidación debe estar asociada a al menos una recepción');
        }
        break;
    }
  }

    /**
   * Crea un anticipo y lo vincula a un pago mediante TransactionReference
   * @param advanceDto DTO para la transacción de anticipo
   * @param paymentDto DTO para la transacción de pago
   * @param transactionReferenceService Servicio para crear la referencia
   * @param userId ID de usuario autenticado
   * @returns { advance: Transaction, payment: Transaction, reference: TransactionReference }
   */
  async createAdvanceWithPayment(
    advanceDto: CreateTransactionDto,
    paymentDto: CreateTransactionDto,
    transactionReferenceService: any,
    userId: number
  ): Promise<{ advance: Transaction; payment: Transaction; reference: any }> {
    paymentDto.typeCode = TransactionTypeCode.PAYMENT;
    const payment = await this.create(paymentDto, userId);
    advanceDto.typeCode = TransactionTypeCode.ADVANCE;
    const advance = await this.create(advanceDto, userId);
    const reference = await transactionReferenceService.createReference(
      'payment',
      advanceDto.producerId,
      advance.id,
      payment.id,
      'ADVANCE'
    );
    return { advance, payment, reference };
  }
}
