/**
 * Interfaces para los diferentes tipos de detalles de transacciones
 * Estas interfaces proporcionan tipado fuerte para el campo 'details' en la entidad Transaction
 */

/**
 * Detalles para transacciones de tipo ADVANCE (Anticipo)
 */
export interface AdvanceDetails {
  /** IDs de las recepciones relacionadas con este anticipo */
  receptionIds?: number[];
  /** Tasa de anticipo aplicada (ejemplo: 0.7 para un 70% del valor total) */
  advanceRate?: number;
  /** Cualquier comentario adicional específico del anticipo */
  notes?: string;
  
  /** Configuración del interés simple para el anticipo */
  interest?: {
    /** Tasa de interés diaria (decimal, ej: 0.0005 para un 0.05% diario) */
    dailyRate: number;
    /** Fecha de inicio para el cálculo de interés */
    startDate: string | Date;
    /** Fecha límite para el cálculo de interés (si no se especifica, se usa la fecha actual) */
    endDate?: string | Date;
    /** Monto mínimo de interés a cobrar */
    minimumAmount?: number;
    /** Monto máximo de interés a cobrar */
    maximumAmount?: number;
  };
}

/**
 * Detalles para transacciones de tipo SETTLEMENT (Liquidación)
 */
export interface SettlementDetails {
  /** IDs de las recepciones incluidas en esta liquidación */
  receptionIds: number[];
  /** IDs de los anticipos que se están liquidando */
  advanceIds?: number[];
  /** Retenciones aplicadas */
  retentions?: {
    type: string;
    percentage: number;
    amount: number;
  }[];
  /** Información del documento de liquidación */
  document?: {
    number: string;
    date: string;
  };
  /** Cualquier comentario adicional específico de la liquidación */
  notes?: string;
}

/**
 * Detalles para transacciones de tipo INTEREST (Interés)
 */
export interface InterestDetails {
  /** ID de la transacción sobre la que se aplica el interés */
  baseTransactionId: number;
  /** Monto base sobre el que se calcula el interés */
  baseAmount: number;
  /** Tasa de interés aplicada (decimal, ej: 0.12 para 12%) */
  interestRate: number;
  /** Número de días para el cálculo del interés */
  days: number;
  /** Fecha de inicio del período de interés */
  startDate: string;
  /** Fecha de fin del período de interés */
  endDate: string;
  /** Cualquier comentario adicional específico del interés */
  notes?: string;
}

/**
 * Detalles para transacciones de tipo CREDIT_NOTE (Nota de crédito)
 */
export interface CreditNoteDetails {
  /** ID de la transacción a la que se aplica la nota de crédito */
  relatedTransactionId: number;
  /** Motivo de la nota de crédito */
  reason: string;
  /** Número de la nota de crédito */
  noteNumber?: string;
  /** Cualquier comentario adicional */
  notes?: string;
}

/**
 * Detalles para transacciones de tipo DEBIT_NOTE (Nota de débito)
 */
export interface DebitNoteDetails {
  /** ID de la transacción a la que se aplica la nota de débito */
  relatedTransactionId: number;
  /** Motivo de la nota de débito */
  reason: string;
  /** Número de la nota de débito */
  noteNumber?: string;
  /** Cualquier comentario adicional */
  notes?: string;
}

/**
 * Tipo unión que puede ser cualquiera de los tipos de detalles de transacción
 */
export type TransactionDetails =
  | AdvanceDetails
  | SettlementDetails
  | InterestDetails
  | CreditNoteDetails
  | DebitNoteDetails;
