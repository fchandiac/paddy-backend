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
 * 7       | DISCOUNT      | Descuento         | Registro de un descuento aplicado a productos.
 */

export enum TransactionTypeCode {
  ADVANCE = 1,
  SETTLEMENT = 2,
  INTEREST = 3,
  CREDIT_NOTE = 4,
  DEBIT_NOTE = 5,
  PAYMENT = 6,
  DISCOUNT = 7,
}


export enum TransactionType {
  ADVANCE = 'Anticipo',
  SETTLEMENT = 'Liquidación',
  INTEREST = 'Interés',
  CREDIT_NOTE = 'Nota de crédito',
  DEBIT_NOTE = 'Nota de débito',
  PAYMENT = 'Pago',
  DISCOUNT = 'Descuento',
}

/**
 * Códigos y nombres de bancos del sistema financiero chileno
 * 
 * Código  | Banco                  | Descripción
 * --------|------------------------|------------------------------------------
 * 100     | BANCO_CHILE            | Banco de Chile
 * 101     | BANCO_ESTADO           | Banco del Estado de Chile (BancoEstado)
 * 102     | BANCO_SANTANDER        | Banco Santander Chile
 * 103     | BANCO_BCI              | Banco de Crédito e Inversiones
 * 104     | BANCO_FALABELLA        | Banco Falabella
 * 105     | BANCO_SECURITY         | Banco Security
 * 106     | BANCO_CREDICHILE       | Banco CrediChile
 * 107     | BANCO_ITAU             | Banco Itaú Corpbanca
 * 108     | BANCO_SCOTIABANK       | Scotiabank Chile
 * 109     | BANCO_CONSORCIO        | Banco Consorcio
 * 110     | BANCO_RIPLEY           | Banco Ripley
 * 111     | BANCO_INTERNACIONAL    | Banco Internacional
 * 112     | BANCO_BICE             | Banco BICE
 * 113     | BANCO_PARIS            | Banco Paris
 * 999     | OTRO                   | Otro banco no listado
 */

export enum BankCode {
  BANCO_CHILE = 100,
  BANCO_ESTADO = 101,
  BANCO_SANTANDER = 102,
  BANCO_BCI = 103,
  BANCO_FALABELLA = 104,
  BANCO_SECURITY = 105,
  BANCO_CREDICHILE = 106,
  BANCO_ITAU = 107,
  BANCO_SCOTIABANK = 108,
  BANCO_CONSORCIO = 109,
  BANCO_RIPLEY = 110,
  BANCO_INTERNACIONAL = 111,
  BANCO_BICE = 112,
  BANCO_PARIS = 113,
  OTRO = 999,
}

export enum BankName {
  BANCO_CHILE = 'Banco de Chile',
  BANCO_ESTADO = 'Banco del Estado de Chile',
  BANCO_SANTANDER = 'Banco Santander Chile',
  BANCO_BCI = 'Banco de Crédito e Inversiones',
  BANCO_FALABELLA = 'Banco Falabella',
  BANCO_SECURITY = 'Banco Security',
  BANCO_CREDICHILE = 'Banco CrediChile',
  BANCO_ITAU = 'Banco Itaú Corpbanca',
  BANCO_SCOTIABANK = 'Scotiabank Chile',
  BANCO_CONSORCIO = 'Banco Consorcio',
  BANCO_RIPLEY = 'Banco Ripley',
  BANCO_INTERNACIONAL = 'Banco Internacional',
  BANCO_BICE = 'Banco BICE',
  BANCO_PARIS = 'Banco Paris',
  OTRO = 'Otro',
}

// Humedad
// Granos verdes
// Impurezas
// Granos manchados y dañados
// Hualcacho
// Granos pelados y partidos
// Granos yesosos y yesados