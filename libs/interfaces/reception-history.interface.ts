import { ReceptionStatus } from '../entities/reception.entity';

export interface ReceptionHistoryEntry {
  timestamp: string;          // Fecha y hora del cambio
  price?: number;             // Precio
  grossWeight?: number;       // Peso bruto
  tare?: number;              // Tara
  netWeight?: number;         // Peso neto
  
  // Análisis de granos
  percentHumedad?: number;
  toleranceHumedad?: number;
  percentGranosVerdes?: number;
  toleranceGranosVerdes?: number;
  percentImpurezas?: number;
  toleranceImpurezas?: number;
  percentGranosManchados?: number;
  toleranceGranosManchados?: number;
  percentHualcacho?: number;
  toleranceHualcacho?: number;
  percentGranosPelados?: number;
  toleranceGranosPelados?: number;
  percentGranosYesosos?: number;
  toleranceGranosYesosos?: number;
  percentVano?: number;
  toleranceVano?: number;
  
  // Bonificación y secado
  toleranceBonificacion?: number;
  percentSecado?: number;
  
  // Cálculos derivados
  totalDiscount?: number;    // Descuento total en kg
  bonus?: number;            // Bonificación en kg
  paddyNet?: number;         // Paddy neto en kg
  
  // Estado y nota
  status?: ReceptionStatus;
  note?: string;
  
  // Metadatos del cambio
  changedBy?: string;        // Usuario que realizó el cambio
  reason?: string;           // Razón del cambio (opcional)
}

export type ReceptionHistory = ReceptionHistoryEntry[];
