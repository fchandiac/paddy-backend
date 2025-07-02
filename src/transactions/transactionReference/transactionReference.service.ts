import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionReference } from '../../../libs/entities/transaction-reference.entity';
import { Repository } from 'typeorm';
import { Transaction } from 'libs/entities/transaction.entity';
import { Producer } from 'libs/entities/producer.entity';

@Injectable()
export class TransactionReferenceService {
  constructor(
    @InjectRepository(TransactionReference)
    private readonly refRepo: Repository<TransactionReference>,

    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
  ) {}

  async health(): Promise<string> {
    return 'TransactionReferenceService is healthy ✅';
  }

  /**
   * Crea una referencia entre dos transacciones
   * @param transactionCode Código del tipo de referencia (por ejemplo, "liquidación", "anticipo", etc.)
   * @param producerId ID del productor
   * @param parentId ID de la transacción principal
   * @param childId ID de la transacción relacionada
   * @param parentType Tipo de entidad del padre (opcional, por defecto "Transaction")
   * @returns La referencia creada
   */
  async createReference(
    transactionCode: string,
    producerId: number,
    parentId: number,
    childId: number,
    parentType: string = 'Transaction',
  ): Promise<TransactionReference> {
    // Verificar que exista el productor
    const producer = await this.producerRepo.findOne({ where: { id: producerId } });
    if (!producer) {
      throw new NotFoundException(`Productor con ID ${producerId} no encontrado`);
    }

    // Verificar que existan las transacciones
    const parentTransaction = await this.transactionRepo.findOne({ where: { id: parentId } });
    if (!parentTransaction) {
      throw new NotFoundException(`Transacción padre con ID ${parentId} no encontrada`);
    }

    const childTransaction = await this.transactionRepo.findOne({ where: { id: childId } });
    if (!childTransaction) {
      throw new NotFoundException(`Transacción hija con ID ${childId} no encontrada`);
    }

    // Crear y guardar la referencia
    const reference = this.refRepo.create({
      transactionCode,
      producer,
      parentId,
      childId,
      parentType,
    });

    return this.refRepo.save(reference);
  }

  /**
   * Obtiene todas las referencias para una transacción específica
   * @param transactionId ID de la transacción
   * @param isParent Buscar como padre (true) o como hijo (false)
   * @returns Lista de referencias
   */
  async findReferencesForTransaction(
    transactionId: number,
    isParent: boolean = true
  ): Promise<TransactionReference[]> {
    const whereCondition = isParent 
      ? { parentId: transactionId } 
      : { childId: transactionId };
    
    return this.refRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtiene todas las referencias para un productor específico
   * @param producerId ID del productor
   * @returns Lista de referencias
   */
  async findByProducer(producerId: number): Promise<TransactionReference[]> {
    return this.refRepo.find({
      where: { producer: { id: producerId } },
      order: { createdAt: 'DESC' },
    });
  }
}
