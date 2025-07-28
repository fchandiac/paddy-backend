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
}

/**
 * Detalles para transacciones de tipo PAYMENT (Pago)
 */
export interface PaymentDetails {
  /** Método de pago utilizado */
  paymentMethod?: string;
  /** Número de referencia del pago */
  referenceNumber?: string;
  /** Información bancaria del pago */
  bankInfo?: {
    bank: string;
    accountNumber: string;
    accountType: string;
  };
  /** Cualquier comentario adicional específico del pago */
  notes?: string;
}

/**
 * Detalles para transacciones de tipo DISCOUNT (Descuento)
 */
export interface DiscountDetails {
  /** ID del producto al que se aplica el descuento */
  productId: number;
  /** Porcentaje de descuento aplicado */
  discountPercent: number;
  /** Monto descontado */
  discountAmount: number;
  /** Motivo del descuento */
  reason?: string;
  /** Referencia a documento o recepción */
  reference?: string;
  /** Observaciones adicionales */
  observations?: string;
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
 * Tipo unión que puede ser cualquiera de los tipos de detalles de transacción
 */
export type TransactionDetails =
  | AdvanceDetails
  | PaymentDetails
  | DiscountDetails
  | SettlementDetails;
