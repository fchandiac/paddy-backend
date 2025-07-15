

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from 'libs/entities/transaction.entity';
import { User } from 'libs/entities/user.entity';
import { Producer } from 'libs/entities/producer.entity';
import { CreateTransactionDto, FilterTransactionDto } from 'libs/dto/transaction.dto';
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

    // Validar que la estructura de details sea coherente con el tipo de transacción
    if (dto.details) {
      this.validateTransactionDetails(dto.typeCode, dto.details);
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
      details: dto.details || {},
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
        
      case TransactionTypeCode.INTEREST:
        // Validación para intereses
        if (!details.baseTransactionId) {
          throw new BadRequestException('El interés debe estar asociado a una transacción base');
        }
        if (details.interestRate === undefined) {
          throw new BadRequestException('La tasa de interés es obligatoria');
        }
        if (!details.startDate || !details.endDate) {
          throw new BadRequestException('Las fechas de inicio y fin del período son obligatorias');
        }
        break;
        
      case TransactionTypeCode.CREDIT_NOTE:
      case TransactionTypeCode.DEBIT_NOTE:
        // Validación para notas de crédito y débito
        if (!details.relatedTransactionId) {
          throw new BadRequestException('La nota debe estar asociada a una transacción');
        }
        if (!details.reason) {
          throw new BadRequestException('El motivo de la nota es obligatorio');
        }
        break;
    }
  }

  /**
   * Calcula el interés acumulado para un anticipo
   * @param transaction La transacción de anticipo
   * @param referenceDate Fecha de referencia para el cálculo (por defecto: fecha actual)
   * @returns El monto de interés acumulado
   */
  async calculateAdvanceInterest(transaction: Transaction, referenceDate: Date = new Date()): Promise<number> {
    // Verificar que la transacción sea un anticipo
    if (transaction.typeCode !== TransactionTypeCode.ADVANCE) {
      throw new BadRequestException('La transacción no es un anticipo');
    }
    
    // Verificar que tenga configuración de interés
    if (!transaction.details?.interest || transaction.details.interest.dailyRate === 0) {
      return 0; // No hay interés configurado o la tasa es cero
    }
    
    const interest = transaction.details.interest;
    const startDate = new Date(interest.startDate);
    const endDate = interest.endDate ? new Date(interest.endDate) : referenceDate;
    
    // Verificar que la fecha de referencia sea posterior a la fecha de inicio
    if (referenceDate < startDate) {
      return 0; // No se ha iniciado el período de interés
    }
    
    // Calcular el capital (monto del anticipo)
    const capital = transaction.debit;
    
    // Calcular días entre la fecha de inicio y la fecha de referencia o fin
    const finalDate = endDate < referenceDate ? endDate : referenceDate;
    const daysElapsed = Math.max(0, Math.floor((finalDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calcular interés simple: P * r * n
    let interestAmount = capital * interest.dailyRate * daysElapsed;
    
    // Aplicar monto mínimo y máximo si están definidos
    if (interest.minimumAmount !== undefined) {
      interestAmount = Math.max(interestAmount, interest.minimumAmount);
    }
    
    if (interest.maximumAmount !== undefined) {
      interestAmount = Math.min(interestAmount, interest.maximumAmount);
    }
    
    return Math.round(interestAmount * 100) / 100; // Redondear a 2 decimales
  }

  /**
   * Genera una transacción de interés para un anticipo
   * @param advanceId ID de la transacción de anticipo
   * @param userId ID del usuario que genera la transacción de interés
   * @param referenceDate Fecha de referencia para el cálculo (por defecto: fecha actual)
   * @returns La transacción de interés generada
   */
  async generateInterestTransaction(advanceId: number, userId: number, referenceDate: Date = new Date()): Promise<Transaction> {
    // Obtener la transacción de anticipo
    const advance = await this.findById(advanceId);
    if (advance.typeCode !== TransactionTypeCode.ADVANCE) {
      throw new BadRequestException('La transacción no es un anticipo');
    }
    
    // Obtener el usuario
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }
    
    // Calcular el interés
    const interestAmount = await this.calculateAdvanceInterest(advance, referenceDate);
    if (interestAmount <= 0) {
      throw new BadRequestException('No hay interés para generar una transacción');
    }
    
    const startDate = new Date(advance.details.interest.startDate);
    const endDate = advance.details.interest.endDate ? new Date(advance.details.interest.endDate) : referenceDate;
    
    // Crear la transacción de interés
    const interestTransaction = this.transactionRepo.create({
      user,
      producer: advance.producer,
      typeCode: TransactionTypeCode.INTEREST,
      debit: interestAmount, // El interés se registra como débito (cargo)
      credit: 0,
      description: `Interés por anticipo #${advance.id}`,
      previousBalance: advance.balance,
      balance: advance.balance - interestAmount,
      lastTransaction: advance,
      isDraft: false,
      details: {
        baseTransactionId: advance.id,
        baseAmount: advance.debit,
        interestRate: advance.details.interest.dailyRate,
        days: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        notes: `Interés calculado desde ${startDate.toLocaleDateString()} hasta ${endDate.toLocaleDateString()}`
      }
    });
    
    return this.transactionRepo.save(interestTransaction);
  }

    /**
   * Crea un anticipo y lo vincula a un pago mediante TransactionReference
   * @param advanceDto DTO para la transacción de anticipo
   * @param paymentDto DTO para la transacción de pago
   * @param transactionReferenceService Servicio para crear la referencia
   * @returns { advance: Transaction, payment: Transaction, reference: TransactionReference }
   */
  async createAdvanceWithPayment(
    advanceDto: CreateTransactionDto,
    paymentDto: CreateTransactionDto,
    transactionReferenceService: any
  ): Promise<{ advance: Transaction; payment: Transaction; reference: any }> {
    paymentDto.typeCode = TransactionTypeCode.PAYMENT;
    const payment = await this.create(paymentDto);
    advanceDto.typeCode = TransactionTypeCode.ADVANCE;
    const advance = await this.create(advanceDto);
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
