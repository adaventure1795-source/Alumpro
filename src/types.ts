/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProfileItem {
  id: string;
  name: string;
  line: string; // e.g. "Nacional 2", "Nacional 3", "Española", "Serie 50", "EuroVent"
  brand: string; // e.g. "Cuprum", "Indalum", "Extrusiones Metálicas"
  pricePerMeter: number;
  stockMeters: number;
  minStockMeters: number;
  weightPerMeter?: number; // optionally in kg
}

export interface AccessoryItem {
  id: string;
  name: string;
  pricePerUnit: number;
  stockUnits: number;
  minStockUnits: number;
}

export interface GlassItem {
  id: string;
  thickness: string; // e.g. "3mm Sencillo", "4mm Sencillo", "6mm Templado", "4+4 Doble"
  pricePerM2: number;
  stockM2: number;
  minStockM2: number;
}

export interface FormulaVariable {
  name: string;
  description: string;
  defaultValue: number;
}

export interface FormulaRule {
  id: string;
  name: string; // e.g. "Ventana Corrediza de 2 hojas"
  category: "ventanas" | "puertas" | "canceles" | "fijos" | "portones" | "barandales" | "rejas";
  variables: FormulaVariable[];
  // Formulas written as strings that can be evaluated or calculated
  profileEquations: {
    profileId: string; // ID or template reference like "marco", "cerco", "traslape", "zoclo"
    name: string;      // Label for the cuts
    formula: string;   // e.g. "Ancho * 2", "(Alto - 3.5) * 2"
    quantity: number;  // Cuts per element
    angle: "90/90" | "45/45" | "45/90";
  }[];
  glassEquation: {
    formulaWidth: string;  // e.g. "(Ancho / 2) - 4"
    formulaHeight: string; // e.g. "Alto - 7.5"
    quantity: number;
  };
  accessoryEquations: {
    accessoryId: string;
    quantityFormula: string; // e.g. "2" or "Vidrios * 2"
  }[];
}

export interface QuoteItem {
  id: string;
  name: string; // Custom label for this item inside quote (e.g., "Ventana Baño principal")
  customDescription?: string; // Non-technical user-edited description to simplify quote
  designImageUrl?: string; // Optional custom sketch or reference image for the quote item
  previewImageUrl?: string; // Auto-generated visual project preview base64 image
  formulaRuleId?: string; // If based on a template FormulaRule
  widthCm: number;
  heightCm: number;
  line: string;
  color: string; // Blanc, Negro, Natural, Hueso, Bronce, Madera
  glassId: string;
  customProfilePrice?: number;
  customGlassPrice?: number;
  quantity: number;
  calculated: {
    profiles: { name: string; label: string; meters: number; cost: number; cuts: { sizeCm: number; qty: number; angle: string }[] }[];
    glasses: { thickness: string; areaM2: number; cost: number; widthCm: number; heightCm: number; qty: number }[];
    accessories: { name: string; qty: number; cost: number }[];
    subtotalProfiles: number;
    subtotalGlasses: number;
    subtotalAccessories: number;
    subtotalHardware: number;
    laborMinutes: number;
    laborCost: number;
    total: number;
  };
}

export interface CutRequest {
  id: string;
  name: string;      // Name of cut (e.g. "Marco Ventana Corrediza")
  lengthCm: number;  // Exact cut size in cm
  quantity: number;  // Amount of this cut
  angle: "90°" | "45°" | "45°/90°";
  profileName: string; // Grouping category (e.g., "Mochetas", "Traslape")
}

export interface OptimizedBar {
  barIndex: number;
  originalLengthCm: number;
  cuts: {
    id: string;
    name: string;
    lengthCm: number;
    angle: string;
  }[];
  usedLengthCm: number;
  wasteCm: number;
  wastePercent: number;
}

export interface ProfileOptimizationResult {
  profileName: string;
  standardBarLengthCm: number;
  totalBarsNeeded: number;
  bars: OptimizedBar[];
  totalRequiredCm: number;
  totalWasteCm: number;
  averageWastePercent: number;
}

export interface TallerNote {
  id: string;
  clientName: string;
  projectName: string;
  date: string;
  type: string; // e.g. "Medida de campo", "Ventana", "Vidrio", "Cotización rápida"
  measurements: string; // Formatted measurements e.g. "120 x 150 cm"
  text: string;
  status: "pendiente" | "cotizado" | "archivado";
}

export interface DeliveryInvoice {
  id: string;
  invoiceNumber: string;
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  businessRFC?: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  ivaPercent: number;
  total: number;
  advancePayment: number;
  pendingBalance: number;
  notes: string;
  status: "pendiente" | "entregado" | "fabricando" | "atrasado";
  logoUrl?: string;
}

export interface WorkshopConfig {
  profiles: ProfileItem[];
  accessories: AccessoryItem[];
  glasses: GlassItem[];
  formulas: FormulaRule[];
  notes: TallerNote[];
  invoices: DeliveryInvoice[];
  quotes: QuoteItem[];
  businessDetails: {
    name: string;
    phone: string;
    address: string;
    rfc: string;
    logoUrl?: string;
    laborRatePerHour: number;
    defaultBarLengthCm: number; // usually 610 or 420
  };
}
