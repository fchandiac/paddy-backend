/**
 * Códigos y tipos de transacciones del sistema
 * 
 * Código  | Tipo          | Traducción        | Descripción
 * --------|---------------|-------------------|------------------------------------------
 * 1       | ADVANCE       | Anticipo          | Pago anticipado antes de una operación completa.
 * 2       | SETTLEMENT    | Liquidación       | Liquidación de una operación o cuenta.
 * 3       | INTEREST      | Interés           | Cargo aplicado sobre el capital prestado o saldo pendiente.
 * 4       | CREDIT_NOTE   | Nota de crédito   | Documento que refleja un crédito a favor.
 * 5       | DEBIT_NOTE    | Nota de débito    | Documento que refleja un débito o cargo.
 * 6       | PAYMENT       | Pago              | Registro de un pago realizado o recibido.
 */
export enum TransactionTypeCode {
  ADVANCE = 1,
  SETTLEMENT = 2,
  INTEREST = 3,
  CREDIT_NOTE = 4,
  DEBIT_NOTE = 5,
  PAYMENT = 6,
}

export enum TransactionType {
  ADVANCE = 'Anticipo',
  SETTLEMENT = 'Liquidación',
  INTEREST = 'Interés',
  CREDIT_NOTE = 'Nota de crédito',
  DEBIT_NOTE = 'Nota de débito',
  PAYMENT = 'Pago',
}


// Humedad
// Granos verdes
// Impurezas
// Granos manchados y dañados
// Hualcacho
// Granos pelados y partidos
// Granos yesosos y yesados