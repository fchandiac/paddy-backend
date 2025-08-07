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
  AddBankAccountDto,
} from '../../../libs/dto/producer.dto';
import { TransactionService } from '../../transactions/transaction/transaction.service';
import { TransactionTypeCode, BankCode, BankName, AccountTypeCode, AccountTypeName } from '../../../libs/enums';
import { CreateTransactionDto } from '../../../libs/dto/transaction.dto';

@Injectable()
export class ProducerService {
  constructor(
    @InjectRepository(Producer)
    private readonly producerRepo: Repository<Producer>,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * Helper para obtener el nombre del banco desde el código
   */
  private getBankNameFromCode(bankCode: number): string {
    switch (bankCode) {
      case BankCode.BANCO_CHILE:
        return BankName.BANCO_CHILE;
      case BankCode.BANCO_ESTADO:
        return BankName.BANCO_ESTADO;
      case BankCode.BANCO_SANTANDER:
        return BankName.BANCO_SANTANDER;
      case BankCode.BANCO_BCI:
        return BankName.BANCO_BCI;
      case BankCode.BANCO_FALABELLA:
        return BankName.BANCO_FALABELLA;
      case BankCode.BANCO_SECURITY:
        return BankName.BANCO_SECURITY;
      case BankCode.BANCO_CREDICHILE:
        return BankName.BANCO_CREDICHILE;
      case BankCode.BANCO_ITAU:
        return BankName.BANCO_ITAU;
      case BankCode.BANCO_SCOTIABANK:
        return BankName.BANCO_SCOTIABANK;
      case BankCode.BANCO_CONSORCIO:
        return BankName.BANCO_CONSORCIO;
      case BankCode.BANCO_RIPLEY:
        return BankName.BANCO_RIPLEY;
      case BankCode.BANCO_INTERNACIONAL:
        return BankName.BANCO_INTERNACIONAL;
      case BankCode.BANCO_BICE:
        return BankName.BANCO_BICE;
      case BankCode.BANCO_PARIS:
        return BankName.BANCO_PARIS;
      case BankCode.OTRO:
        return BankName.OTRO;
      default:
        return BankName.OTRO;
    }
  }

  /**
   * Helper para obtener el nombre del tipo de cuenta desde el código
   */
  private getAccountTypeNameFromCode(accountTypeCode: number): string {
    switch (accountTypeCode) {
      case AccountTypeCode.CUENTA_CORRIENTE:
        return AccountTypeName.CUENTA_CORRIENTE;
      case AccountTypeCode.CUENTA_AHORRO:
        return AccountTypeName.CUENTA_AHORRO;
      case AccountTypeCode.CUENTA_VISTA:
        return AccountTypeName.CUENTA_VISTA;
      case AccountTypeCode.CUENTA_RUT:
        return AccountTypeName.CUENTA_RUT;
      case AccountTypeCode.CUENTA_CHEQUERA:
        return AccountTypeName.CUENTA_CHEQUERA;
      case AccountTypeCode.LINEA_CREDITO:
        return AccountTypeName.LINEA_CREDITO;
      case AccountTypeCode.DEPOSITO_PLAZO:
        return AccountTypeName.DEPOSITO_PLAZO;
      case AccountTypeCode.OTRO_TIPO:
        return AccountTypeName.OTRO_TIPO;
      default:
        return AccountTypeName.OTRO_TIPO;
    }
  }

  /**
   * Obtiene la lista de bancos disponibles
   */
  getBanksList(): Array<{ code: number; name: string }> {
    return [
      { code: BankCode.BANCO_CHILE, name: BankName.BANCO_CHILE },
      { code: BankCode.BANCO_ESTADO, name: BankName.BANCO_ESTADO },
      { code: BankCode.BANCO_SANTANDER, name: BankName.BANCO_SANTANDER },
      { code: BankCode.BANCO_BCI, name: BankName.BANCO_BCI },
      { code: BankCode.BANCO_FALABELLA, name: BankName.BANCO_FALABELLA },
      { code: BankCode.BANCO_SECURITY, name: BankName.BANCO_SECURITY },
      { code: BankCode.BANCO_CREDICHILE, name: BankName.BANCO_CREDICHILE },
      { code: BankCode.BANCO_ITAU, name: BankName.BANCO_ITAU },
      { code: BankCode.BANCO_SCOTIABANK, name: BankName.BANCO_SCOTIABANK },
      { code: BankCode.BANCO_CONSORCIO, name: BankName.BANCO_CONSORCIO },
      { code: BankCode.BANCO_RIPLEY, name: BankName.BANCO_RIPLEY },
      { code: BankCode.BANCO_INTERNACIONAL, name: BankName.BANCO_INTERNACIONAL },
      { code: BankCode.BANCO_BICE, name: BankName.BANCO_BICE },
      { code: BankCode.BANCO_PARIS, name: BankName.BANCO_PARIS },
      { code: BankCode.OTRO, name: BankName.OTRO },
    ];
  }

  /**
   * Obtiene la lista de tipos de cuenta disponibles
   */
  getAccountTypesList(): Array<{ code: number; name: string }> {
    return [
      { code: AccountTypeCode.CUENTA_CORRIENTE, name: AccountTypeName.CUENTA_CORRIENTE },
      { code: AccountTypeCode.CUENTA_AHORRO, name: AccountTypeName.CUENTA_AHORRO },
      { code: AccountTypeCode.CUENTA_VISTA, name: AccountTypeName.CUENTA_VISTA },
      { code: AccountTypeCode.CUENTA_RUT, name: AccountTypeName.CUENTA_RUT },
      { code: AccountTypeCode.CUENTA_CHEQUERA, name: AccountTypeName.CUENTA_CHEQUERA },
      { code: AccountTypeCode.LINEA_CREDITO, name: AccountTypeName.LINEA_CREDITO },
      { code: AccountTypeCode.DEPOSITO_PLAZO, name: AccountTypeName.DEPOSITO_PLAZO },
      { code: AccountTypeCode.OTRO_TIPO, name: AccountTypeName.OTRO_TIPO },
    ];
  }

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
  
    // Validar que si se proporciona información bancaria, todos los campos requeridos estén presentes
    let bankAccounts = [];
    
    if (dto.bankCode || dto.accountTypeCode || dto.accountNumber) {
      // Si se proporciona algún campo bancario, validar que todos los requeridos estén presentes
      if (!dto.bankCode) {
        throw new ConflictException('bankCode es requerido cuando se proporciona información bancaria');
      }
      if (!dto.accountTypeCode) {
        throw new ConflictException('accountTypeCode es requerido cuando se proporciona información bancaria');
      }
      if (!dto.accountNumber) {
        throw new ConflictException('accountNumber es requerido cuando se proporciona información bancaria');
      }

      bankAccounts = [
        {
          bankCode: dto.bankCode,
          bankName: this.getBankNameFromCode(dto.bankCode),
          accountNumber: dto.accountNumber,
          accountTypeCode: dto.accountTypeCode,
          accountTypeName: this.getAccountTypeNameFromCode(dto.accountTypeCode),
          holderName: dto.holderName ?? dto.name, // por defecto usamos el nombre del productor
        },
      ];
    }
  
    const producer = this.producerRepo.create({
      ...dto,
      bankAccounts,
    });
  
    return this.producerRepo.save(producer);
  }


  async addBankAccount(
    producerId: number,
    dto: AddBankAccountDto
  ): Promise<Producer> {
    const producer = await this.producerRepo.findOne({ where: { id: producerId } });
  
    if (!producer) {
      throw new NotFoundException(`No se encontró el productor con ID ${producerId}`);
    }
  
    const existingAccounts = producer.bankAccounts || [];
    
    // Validar que no exista ya una cuenta con el mismo número de cuenta
    const duplicateAccount = existingAccounts.find(
      account => account.accountNumber === dto.accountNumber
    );
    
    if (duplicateAccount) {
      throw new ConflictException(`Ya existe una cuenta bancaria con el número ${dto.accountNumber}`);
    }
  
    const newAccount = {
      bankCode: dto.bankCode,
      bankName: this.getBankNameFromCode(dto.bankCode),
      accountNumber: dto.accountNumber,
      accountTypeCode: dto.accountTypeCode,
      accountTypeName: this.getAccountTypeNameFromCode(dto.accountTypeCode),
      holderName: dto.holderName,
    };
  
    const updatedAccounts = [...existingAccounts, newAccount];
  
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
