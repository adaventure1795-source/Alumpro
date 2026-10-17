/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProfileItem, AccessoryItem, GlassItem, FormulaRule, WorkshopConfig } from "../types";

export const DEFAULT_PROFILES: ProfileItem[] = [
  // Serie Corrediza 2" (Nacional)
  { id: "prof-nat2", name: "[11044] Cabezal 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 45, stockMeters: 620, minStockMeters: 100 },
  { id: "prof-nat2-jamba", name: "[7518] Chambrana / Jamba 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 45, stockMeters: 450, minStockMeters: 100 },
  { id: "prof-nat2-tras", name: "[9954] Traslape Ventana 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 48, stockMeters: 380, minStockMeters: 100 },
  { id: "prof-nat2-cerco", name: "[8320] Cerco Ventana 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 46, stockMeters: 512, minStockMeters: 100 },
  { id: "prof-nat2-riel", name: "[9953] Riel Corrediza 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 48, stockMeters: 340, minStockMeters: 80 },
  { id: "prof-nat2-zoclo", name: "[7825] Zoclo Puerta 2 Venas 2″", line: "Nacional 2″", brand: "Grupo Crucero", pricePerMeter: 52, stockMeters: 220, minStockMeters: 60 },

  // Serie Corrediza 3" (Nacional)
  { id: "prof-nat3", name: "[7836] Cabezal 3″", line: "Nacional 3″", brand: "Indalum", pricePerMeter: 58, stockMeters: 280, minStockMeters: 80 },
  { id: "prof-nat3-jamba", name: "[7826] Chambrana 3″", line: "Nacional 3″", brand: "Indalum", pricePerMeter: 58, stockMeters: 320, minStockMeters: 80 },
  { id: "prof-nat3-tras", name: "[7844] Traslape Ventana 3″", line: "Nacional 3″", brand: "Indalum", pricePerMeter: 62, stockMeters: 190, minStockMeters: 80 },
  { id: "prof-nat3-zoc", name: "[7842] Zoclo Puerta 2 Venas 3″", line: "Nacional 3″", brand: "Indalum", pricePerMeter: 65, stockMeters: 154, minStockMeters: 50 },
  { id: "prof-nat3-riel", name: "[9957] Riel Corrediza 3″", line: "Nacional 3″", brand: "Indalum", pricePerMeter: 64, stockMeters: 180, minStockMeters: 50 },

  // Serie Fija 1 1/2" (Nacional)
  { id: "prof-fija-15-bolsa", name: "[9073] Bolsa 1 1/2″", line: "Serie Fija 1 1/2″", brand: "Grupo Crucero", pricePerMeter: 38, stockMeters: 200, minStockMeters: 50 },
  { id: "prof-fija-15-esc", name: "[9074] Escalonado 1 1/2″", line: "Serie Fija 1 1/2″", brand: "Grupo Crucero", pricePerMeter: 38, stockMeters: 180, minStockMeters: 50 },
  { id: "prof-fija-15-tapa", name: "[9075] Tapa Bolsa 1 1/2″", line: "Serie Fija 1 1/2″", brand: "Grupo Crucero", pricePerMeter: 24, stockMeters: 150, minStockMeters: 40 },

  // Serie Fija 2" & 3" (Nacional)
  { id: "prof-fija-2-bolsa", name: "[9083] Bolsa 2″", line: "Serie Fija 2″", brand: "Grupo Crucero", pricePerMeter: 42, stockMeters: 310, minStockMeters: 60 },
  { id: "prof-fija-2-tapa", name: "[9085] Tapa Bolsa 2″", line: "Serie Fija 2″", brand: "Grupo Crucero", pricePerMeter: 28, stockMeters: 250, minStockMeters: 55 },
  { id: "prof-fija-2-junq", name: "[9088] Junquillo 2″", line: "Serie Fija 2″", brand: "Grupo Crucero", pricePerMeter: 18, stockMeters: 400, minStockMeters: 120 },
  { id: "prof-fija-3-bolsa", name: "[9135] Bolsa 3″", line: "Serie Fija 3″", brand: "Indalum", pricePerMeter: 54, stockMeters: 190, minStockMeters: 45 },
  { id: "prof-fija-3-tapa", name: "[7315] Tapa Bolsa 3″", line: "Serie Fija 3″", brand: "Indalum", pricePerMeter: 34, stockMeters: 160, minStockMeters: 40 },
  { id: "prof-fija-3-junq", name: "[9112] Junquillo 3″", line: "Serie Fija 3″", brand: "Indalum", pricePerMeter: 22, stockMeters: 300, minStockMeters: 80 },

  // Puerta Pesada y Batientes (Nacional)
  { id: "prof-puerta-pes-zoc", name: "[9187] Zoclo Puerta Pesada", line: "Puerta Pesada", brand: "Grupo Crucero", pricePerMeter: 85, stockMeters: 140, minStockMeters: 30 },
  { id: "prof-puerta-pes-cab", name: "[9207] Cabezal Puerta Pesada", line: "Puerta Pesada", brand: "Grupo Crucero", pricePerMeter: 78, stockMeters: 150, minStockMeters: 30 },
  { id: "prof-puerta-pes-chapa", name: "[9204] Cerco Chapa Puerta Pesada", line: "Puerta Pesada", brand: "Grupo Crucero", pricePerMeter: 82, stockMeters: 180, minStockMeters: 40 },
  { id: "prof-batiente-35844", name: "[35844] Batiente 2″ 2 Venas", line: "Batientes", brand: "Grupo Crucero", pricePerMeter: 34, stockMeters: 290, minStockMeters: 50 },
  { id: "prof-batiente-4105", name: "[4105] Batiente Ángulo 1/2″", line: "Batientes", brand: "Grupo Crucero", pricePerMeter: 18, stockMeters: 350, minStockMeters: 60 },

  // Serie 4000 (EuroAlum / Serie Española)
  { id: "prof-esp", name: "[2314] Riel Doble (EuroAlum 4000)", line: "EuroAlum 4000", brand: "EuroAlum", pricePerMeter: 82, stockMeters: 180, minStockMeters: 50 },
  { id: "prof-esp-hoja", name: "[2297] Hoja Ventana (EuroAlum 4000)", line: "EuroAlum 4000", brand: "EuroAlum", pricePerMeter: 88, stockMeters: 140, minStockMeters: 40 },
  { id: "prof-esp-proyeccion", name: "[2276] Adaptador Traslape (EuroAlum 4000)", line: "EuroAlum 4000", brand: "EuroAlum", pricePerMeter: 76, stockMeters: 190, minStockMeters: 30 },
  { id: "prof-s50", name: "Cerco Perimetral Serie 50 (EuroVent)", line: "Serie 50", brand: "EuroVent", pricePerMeter: 85, stockMeters: 120, minStockMeters: 30 },
  { id: "prof-s50-hoja", name: "Hoja Batiente Serie 50 (EuroVent)", line: "Serie 50", brand: "EuroVent", pricePerMeter: 90, stockMeters: 110, minStockMeters: 30 },

  // Portones y Perfiles Varios
  { id: "prof-porton-hoja", name: "Perfil Cerco Portón Heavy 4″", line: "Portones", brand: "Cuprum", pricePerMeter: 120, stockMeters: 350, minStockMeters: 60 },
  { id: "prof-duela-lisa", name: "[6617] Duela Lisa 10cm (Grupo Crucero)", line: "Portones", brand: "Grupo Crucero", pricePerMeter: 65, stockMeters: 820, minStockMeters: 120 },
  { id: "prof-canal-18081", name: "[18081] Canal 1/2″", line: "Canales", brand: "Grupo Crucero", pricePerMeter: 22, stockMeters: 410, minStockMeters: 100 },
  { id: "prof-repizon-7671", name: "[7671] Repizón 11 cm", line: "Canales", brand: "Grupo Crucero", pricePerMeter: 48, stockMeters: 290, minStockMeters: 50 },
  { id: "prof-tubo-cuad-2", name: "[2356] Tubo Cuadrado 2″", line: "Tubos", brand: "Grupo Crucero", pricePerMeter: 48, stockMeters: 320, minStockMeters: 60 }
];

export const DEFAULT_ACCESSORIES: AccessoryItem[] = [
  { id: "acc-roda", name: "Carretillas de Alta Carga (Rodamientos)", pricePerUnit: 12, stockUnits: 450, minStockUnits: 80 },
  { id: "acc-emb", name: "Felpa Selladora Cortaviento (metro)", pricePerUnit: 5, stockUnits: 400, minStockUnits: 100 },
  { id: "acc-tornillo", name: "Tornillo Cabeza Plana 8x1 (Bolsa de 100)", pricePerUnit: 35, stockUnits: 2400, minStockUnits: 500 },
  { id: "acc-esq", name: "Escuadra de Botón A-4006 / 4000C", pricePerUnit: 25, stockUnits: 180, minStockUnits: 40 },
  { id: "acc-carretilla", name: "Carretilla Ajustable A-4001 Opción B", pricePerUnit: 45, stockUnits: 120, minStockUnits: 30 },
  { id: "acc-jaladera", name: "Broche Embutido Especial A-5000", pricePerUnit: 48, stockUnits: 95, minStockUnits: 20 },
  { id: "acc-empaque", name: "Empaque Cuña 328-10 (metro)", pricePerUnit: 6, stockUnits: 800, minStockUnits: 200 },
  { id: "acc-motor", name: "Motor Residencial Automático de Cremallera (1/2 HP)", pricePerUnit: 3600, stockUnits: 35, minStockUnits: 5 },
  { id: "acc-cremallera", name: "Cremallera de Acero Galvanizado (tramo 1.0m)", pricePerUnit: 300, stockUnits: 110, minStockUnits: 10 },
  { id: "acc-pistones", name: "Kit Pistones Electromecánicos Batientes (Merik)", pricePerUnit: 6950, stockUnits: 12, minStockUnits: 2 },
  { id: "acc-chapa-seg", name: "Chapa de Piso Automática Inteligente", pricePerUnit: 480, stockUnits: 25, minStockUnits: 4 },
  { id: "acc-bisagra-heavy", name: "Bisagra de Carga Reforzada de Acero (3\")", pricePerUnit: 65, stockUnits: 160, minStockUnits: 20 }
];

export const DEFAULT_GLASSES: GlassItem[] = [
  { id: "glass-none", thickness: "Sin cristal (Solo Estructura / Perfilería)", pricePerM2: 0, stockM2: 9999, minStockM2: 0 },
  { id: "glass-3s", thickness: "3mm Claro Sencillo", pricePerM2: 120, stockM2: 85, minStockM2: 15 },
  { id: "glass-4s", thickness: "4mm Claro Sencillo", pricePerM2: 140, stockM2: 70, minStockM2: 15 },
  { id: "glass-5s", thickness: "5mm Filtrasol Sencillo", pricePerM2: 165, stockM2: 55, minStockM2: 12 },
  { id: "glass-6t", thickness: "6mm Claro Templado", pricePerM2: 240, stockM2: 40, minStockM2: 10 },
  { id: "glass-esmerilado", thickness: "6mm Esmerilado Privacidad", pricePerM2: 280, stockM2: 50, minStockM2: 10 },
  { id: "glass-filtrasol-plus", thickness: "6mm Filtrasol Plus Templado", pricePerM2: 295, stockM2: 45, minStockM2: 10 },
  { id: "glass-reflecta", thickness: "6mm Reflecta Plata", pricePerM2: 320, stockM2: 30, minStockM2: 5 },
  { id: "glass-reflecta-verde", thickness: "6mm Reflecta Verde", pricePerM2: 340, stockM2: 30, minStockM2: 5 },
  { id: "glass-reflecta-azul", thickness: "6mm Reflecta Azul", pricePerM2: 350, stockM2: 30, minStockM2: 5 },
  { id: "glass-duo", thickness: "Vidrio Doble (Duo) 6+1/4+6", pricePerM2: 420, stockM2: 35, minStockM2: 8 },
  { id: "glass-44d", thickness: "Doble Cristal Acústico Lami 4+4", pricePerM2: 380, stockM2: 25, minStockM2: 5 },
  { id: "glass-policarbonato", thickness: "Policarbonato Celular (6mm) - Cancel Baño", pricePerM2: 190, stockM2: 120, minStockM2: 20 },
  { id: "glass-panel-al", thickness: "Panel de Aluminio (Alucobond / 3mm) - Cancel/Puerta", pricePerM2: 260, stockM2: 80, minStockM2: 15 },
  { id: "glass-plastico", thickness: "Plástico Translúcido (Acrílico) - Cancel Baño", pricePerM2: 140, stockM2: 110, minStockM2: 15 }
];

export const DEFAULT_FORMULAS: FormulaRule[] = [
  {
    id: "f-window-slide-2in-nacional",
    name: "Ventana Corrediza 2″ Nacional (Aluminio Fácil)",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho total en cm", defaultValue: 100 },
      { name: "Alto", description: "Alto total en cm", defaultValue: 100 }
    ],
    profileEquations: [
      { profileId: "prof-nat2-riel", name: "Riel Inferior Horizontal", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat2", name: "Cabezal/Chambrana Horizontal Superior", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat2-jamba", name: "Jambas Laterales Verticales", formula: "Alto - 2.7", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-cerco", name: "Poste Liso Vertical de Hojas", formula: "Alto - 4.0", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-tras", name: "Traslapes Verticales Centrales", formula: "Alto - 4.0", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-zoclo", name: "Zoclo/Cabezal Horizontales", formula: "(Ancho - 15.9) / 2", quantity: 4, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "(Ancho - 15.9) / 2 + 1.7",
      formulaHeight: "Alto - 7.3",
      quantity: 2
    },
    accessoryEquations: [
      { accessoryId: "acc-carretilla", quantityFormula: "2" },
      { accessoryId: "acc-emb", quantityFormula: "Ancho * 2 + Alto * 4" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 4" },
      { accessoryId: "acc-tornillo", quantityFormula: "16" }
    ]
  },
  {
    id: "f-bath-encl-semilujo",
    name: "Cancel de Baño Semi Lujo (Aluminio Fácil)",
    category: "canceles",
    variables: [
      { name: "Ancho", description: "Ancho total de pared a pared en cm", defaultValue: 100 },
      { name: "Alto", description: "Alto total del cancel en cm", defaultValue: 180 }
    ],
    profileEquations: [
      { profileId: "prof-nat2-riel", name: "Riel Superior Horizontal", formula: "Ancho - 0.2", quantity: 1, angle: "90/90" },
      { profileId: "prof-canal-18081", name: "Guía Inferior Horizontal", formula: "Ancho - 0.7", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat2-jamba", name: "Jambas Verticales Laterales", formula: "Alto - 2.8", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-cerco", name: "Marco Vertical Hojas (Semi Lujo 45°)", formula: "Alto - 4.5", quantity: 4, angle: "45/45" },
      { profileId: "prof-nat2-cerco", name: "Marco Horizontal Hojas (Semi Lujo 45°)", formula: "(Ancho / 2) + 2.2", quantity: 4, angle: "45/45" }
    ],
    glassEquation: {
      formulaWidth: "(Ancho / 2) + 2.0",
      formulaHeight: "Alto - 6.5",
      quantity: 2
    },
    accessoryEquations: [
      { accessoryId: "acc-esq", quantityFormula: "8" },
      { accessoryId: "acc-carretilla", quantityFormula: "4" },
      { accessoryId: "acc-jaladera", quantityFormula: "4" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 4" },
      { accessoryId: "acc-tornillo", quantityFormula: "32" }
    ]
  },
  {
    id: "f-fixed-2in-nacional",
    name: "Ventana Fija 2″ Nacional (Aluminio Fácil)",
    category: "fijos",
    variables: [
      { name: "Ancho", description: "Ancho total de ventana en cm", defaultValue: 100 },
      { name: "Alto", description: "Alto total de ventana en cm", defaultValue: 100 }
    ],
    profileEquations: [
      { profileId: "prof-fija-2-bolsa", name: "Bolsas Verticales Laterales", formula: "Alto", quantity: 2, angle: "90/90" },
      { profileId: "prof-fija-2-bolsa", name: "Bolsa Horizontal Superior", formula: "Ancho - 6.4", quantity: 1, angle: "90/90" },
      { profileId: "prof-fija-2-tapa", name: "Escalonado Horizontal Inferior", formula: "Ancho - 6.4", quantity: 1, angle: "90/90" },
      { profileId: "prof-fija-2-junq", name: "Junquillo Horizontal", formula: "Ancho - 6.4", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 5.4",
      formulaHeight: "Alto - 6.6",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-tornillo", quantityFormula: "8" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 2" }
    ]
  },
  {
    id: "f-fixed-3in-nacional",
    name: "Ventana Fija 3″ Nacional (Aluminio Fácil)",
    category: "fijos",
    variables: [
      { name: "Ancho", description: "Ancho total de ventana en cm", defaultValue: 100 },
      { name: "Alto", description: "Alto total de ventana en cm", defaultValue: 100 }
    ],
    profileEquations: [
      { profileId: "prof-fija-3-bolsa", name: "Bolsas Verticales Laterales 3″", formula: "Alto", quantity: 2, angle: "90/90" },
      { profileId: "prof-fija-3-bolsa", name: "Bolsa Horizontal Superior 3″", formula: "Ancho - 8.8", quantity: 1, angle: "90/90" },
      { profileId: "prof-fija-3-tapa", name: "Tapa Bolsa Horizontal Inferior 3″", formula: "Ancho - 8.8", quantity: 1, angle: "90/90" },
      { profileId: "prof-fija-3-junq", name: "Junquillo Horizontal 3″", formula: "Ancho - 8.8", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 7.8",
      formulaHeight: "Alto - 9.0",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-tornillo", quantityFormula: "12" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 2" }
    ]
  },
  {
    id: "f-window-slide",
    name: "Ventana Corrediza Clásica (2 Hojas)",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho total del vano en cm", defaultValue: 120 },
      { name: "Alto", description: "Alto total del vano en cm", defaultValue: 100 }
    ],
    profileEquations: [
      { profileId: "prof-nat2", name: "Cabezal/Riel Superior (Ancho)", formula: "Ancho", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-jamba", name: "Jamba Lateral (Alto)", formula: "Alto", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-tras", name: "Traslape Central (Alto)", formula: "Alto - 3.2", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-cerco", name: "Cerco Vertical Hojas (Alto)", formula: "Alto - 3.2", quantity: 2, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "(Ancho / 2) - 4.2",
      formulaHeight: "Alto - 7.5",
      quantity: 2
    },
    accessoryEquations: [
      { accessoryId: "acc-roda", quantityFormula: "4" },
      { accessoryId: "acc-tornillo", quantityFormula: "24" },
      { accessoryId: "acc-emb", quantityFormula: "Ancho * 2 + Alto * 4" }
    ]
  },
  {
    id: "f-door-swivel",
    name: "Puerta Batiente / Pivotante",
    category: "puertas",
    variables: [
      { name: "Ancho", description: "Ancho de la puerta en cm", defaultValue: 90 },
      { name: "Alto", description: "Alto de la puerta en cm", defaultValue: 210 }
    ],
    profileEquations: [
      { profileId: "prof-nat3", name: "Marco Horizontal (Ancho)", formula: "Ancho", quantity: 2, angle: "45/45" },
      { profileId: "prof-nat3-jamba", name: "Marco Vertical Jamba (Alto)", formula: "Alto", quantity: 2, angle: "45/45" },
      { profileId: "prof-nat3-zoc", name: "Zoclo Inferior Hoja", formula: "Ancho - 11.2", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 14",
      formulaHeight: "Alto - 18",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-esq", quantityFormula: "4" },
      { accessoryId: "acc-emb", quantityFormula: "(Ancho * 2 + Alto * 2) * 1.05" },
      { accessoryId: "acc-jaladera", quantityFormula: "1" }
    ]
  },
  {
    id: "f-porton-corredizo-duela",
    name: "Portón Corredizo Automático de Duela",
    category: "portones",
    variables: [
      { name: "Ancho", description: "Ancho del portón en cm", defaultValue: 240 },
      { name: "Alto", description: "Alto del portón en cm", defaultValue: 200 }
    ],
    profileEquations: [
      { profileId: "prof-porton-hoja", name: "Riel/Cabezal Estructural Horizontal", formula: "Ancho", quantity: 2, angle: "90/90" },
      { profileId: "prof-porton-hoja", name: "Laterales de Retención Vertical", formula: "Alto", quantity: 2, angle: "90/90" },
      { profileId: "prof-duela-lisa", name: "Duela de Presión Lisa 10cm (Relleno horizontal)", formula: "(Ancho - 10) * (Alto / 10)", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "0",
      formulaHeight: "0",
      quantity: 0
    },
    accessoryEquations: [
      { accessoryId: "acc-motor", quantityFormula: "1" },
      { accessoryId: "acc-cremallera", quantityFormula: "Ancho / 100" },
      { accessoryId: "acc-roda", quantityFormula: "2" },
      { accessoryId: "acc-tornillo", quantityFormula: "80" }
    ]
  },
  {
    id: "f-porton-batiente-duela",
    name: "Portón Abatible de 2 Hojas Batientes",
    category: "portones",
    variables: [
      { name: "Ancho", description: "Ancho total libre en cm", defaultValue: 240 },
      { name: "Alto", description: "Alto total en cm", defaultValue: 200 }
    ],
    profileEquations: [
      { profileId: "prof-porton-hoja", name: "Marcos Horizontales Hojas", formula: "(Ancho / 2)", quantity: 4, angle: "90/90" },
      { profileId: "prof-porton-hoja", name: "Marcos Verticales Hojas", formula: "Alto", quantity: 4, angle: "90/90" },
      { profileId: "prof-duela-lisa", name: "Duelas de Relleno (Ambas Hojas)", formula: "(Ancho / 2 - 10) * (Alto / 10)", quantity: 2, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "0",
      formulaHeight: "0",
      quantity: 0
    },
    accessoryEquations: [
      { accessoryId: "acc-pistones", quantityFormula: "1" },
      { accessoryId: "acc-bisagra-heavy", quantityFormula: "6" },
      { accessoryId: "acc-chapa-seg", quantityFormula: "1" },
      { accessoryId: "acc-tornillo", quantityFormula: "120" }
    ]
  },
  {
    id: "f-ventana-proyeccion-esp",
    name: "Ventana de Proyección Inteligente Española",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho del vano en cm", defaultValue: 80 },
      { name: "Alto", description: "Alto del vano en cm", defaultValue: 100 }
    ],
    profileEquations: [
      { profileId: "prof-esp", name: "Marco Exterior Perimetral (Española)", formula: "Ancho * 2 + Alto * 2", quantity: 1, angle: "45/45" },
      { profileId: "prof-esp-proyeccion", name: "Marco de Hoja de Proyección", formula: "Ancho * 2 + Alto * 2 - 12", quantity: 1, angle: "45/45" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 12",
      formulaHeight: "Alto - 12",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-bisagra-heavy", quantityFormula: "2" },
      { accessoryId: "acc-emb", quantityFormula: "(Ancho * 2 + Alto * 2) * 1.05" },
      { accessoryId: "acc-tornillo", quantityFormula: "20" }
    ]
  },
  {
    id: "f-window-guillotine",
    name: "Ventana de Guillotina Standard",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho total en cm", defaultValue: 100 },
      { name: "Alto", description: "Alto total en cm", defaultValue: 140 }
    ],
    profileEquations: [
      { profileId: "prof-nat2", name: "Cabezal Horizontal Superior", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat2-riel", name: "Riel Inferior Horizontal", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat2-jamba", name: "Jambas Laterales de Guillotina (Guías)", formula: "Alto", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat2-cerco", name: "Cerco Hoja Superior e Inferior", formula: "Ancho - 5.5", quantity: 4, angle: "90/90" },
      { profileId: "prof-nat2-tras", name: "Hojas Laterales Interiores Montantes", formula: "(Alto / 2) - 3", quantity: 4, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "(Ancho - 12) / 2",
      formulaHeight: "(Alto / 2) - 6",
      quantity: 2
    },
    accessoryEquations: [
      { accessoryId: "acc-roda", quantityFormula: "4" },
      { accessoryId: "acc-emb", quantityFormula: "Ancho * 4 + Alto * 4" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 4 + Alto * 4" },
      { accessoryId: "acc-tornillo", quantityFormula: "24" }
    ]
  },
  {
    id: "f-window-projection-standard",
    name: "Ventana de Proyección Standard (Proyectable)",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho total en cm", defaultValue: 80 },
      { name: "Alto", description: "Alto total en cm", defaultValue: 80 }
    ],
    profileEquations: [
      { profileId: "prof-nat2-jamba", name: "Chambrana de Vano Perimetral", formula: "Ancho * 2 + Alto * 2 - 4", quantity: 1, angle: "45/45" },
      { profileId: "prof-nat2-cerco", name: "Cerco Hoja Proyectable", formula: "Ancho * 2 + Alto * 2 - 16", quantity: 1, angle: "45/45" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 14",
      formulaHeight: "Alto - 14",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-bisagra-heavy", quantityFormula: "2" },
      { accessoryId: "acc-jaladera", quantityFormula: "1" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 2" },
      { accessoryId: "acc-tornillo", quantityFormula: "12" }
    ]
  },
  {
    id: "f-door-monumental",
    name: "Puerta Monumental Premium",
    category: "puertas",
    variables: [
      { name: "Ancho", description: "Ancho total de entrada en cm", defaultValue: 120 },
      { name: "Alto", description: "Alto monumental en cm", defaultValue: 240 }
    ],
    profileEquations: [
      { profileId: "prof-puerta-pes-cab", name: "Cerco Portante de Pivot / Batiente", formula: "Ancho", quantity: 1, angle: "45/45" },
      { profileId: "prof-puerta-pes-chapa", name: "Jambas Laterales Monumentales", formula: "Alto", quantity: 2, angle: "45/45" },
      { profileId: "prof-puerta-pes-cab", name: "Cerco Superior de Hoja Monumental", formula: "Ancho - 12", quantity: 1, angle: "90/90" },
      { profileId: "prof-puerta-pes-zoc", name: "Zoclo Inferior Reforzado (2 Ventilas Heavy)", formula: "Ancho - 12", quantity: 1, angle: "90/90" },
      { profileId: "prof-puerta-pes-chapa", name: "Cercos Verticales Laterales Hoja", formula: "Alto - 6", quantity: 2, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 22",
      formulaHeight: "Alto - 28",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-bisagra-heavy", quantityFormula: "4" },
      { accessoryId: "acc-chapa-seg", quantityFormula: "1" },
      { accessoryId: "acc-jaladera", quantityFormula: "1" },
      { accessoryId: "acc-emb", quantityFormula: "Ancho * 4 + Alto * 4" },
      { accessoryId: "acc-tornillo", quantityFormula: "32" }
    ]
  },
  {
    id: "f-porton-ascendiendo-4",
    name: "Portón Ascendente de Aluminio (4 Módulos / Seccional)",
    category: "portones",
    variables: [
      { name: "Ancho", description: "Ancho total de garaje en cm", defaultValue: 300 },
      { name: "Alto", description: "Alto total de garaje en cm", defaultValue: 240 }
    ],
    profileEquations: [
      { profileId: "prof-porton-hoja", name: "Cerco Perimetral Módulos Seccionales", formula: "Ancho * 4 * 2 + Alto * 4 * 2", quantity: 1, angle: "45/45" },
      { profileId: "prof-duela-lisa", name: "Relleno Duela Lisa Estructural Sec", formula: "(Ancho - 12) * (Alto / 10)", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "0",
      formulaHeight: "0",
      quantity: 0
    },
    accessoryEquations: [
      { accessoryId: "acc-motor", quantityFormula: "1" },
      { accessoryId: "acc-bisagra-heavy", quantityFormula: "10" },
      { accessoryId: "acc-roda", quantityFormula: "8" },
      { accessoryId: "acc-tornillo", quantityFormula: "150" }
    ]
  },
  {
    id: "f-window-slide-3in-nacional",
    name: "Ventana Corrediza 3″ Nacional (Aluminio Fácil)",
    category: "ventanas",
    variables: [
      { name: "Ancho", description: "Ancho total en cm", defaultValue: 120 },
      { name: "Alto", description: "Alto total en cm", defaultValue: 120 }
    ],
    profileEquations: [
      { profileId: "prof-nat3-riel", name: "Riel Inferior Horizontal 3″", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat3", name: "Cabezal/Chambrana Horizontal Superior 3″", formula: "Ancho", quantity: 1, angle: "90/90" },
      { profileId: "prof-nat3-jamba", name: "Jambas Laterales Verticales 3″", formula: "Alto - 2.9", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat3-tras", name: "Traslapes Verticales Centrales 3″", formula: "Alto - 4.5", quantity: 2, angle: "90/90" },
      { profileId: "prof-nat3-zoc", name: "Zoclo/Cabezal Horizontales 3″", formula: "(Ancho - 22.0) / 2", quantity: 4, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "(Ancho - 22.0) / 2 + 1.9",
      formulaHeight: "Alto - 8.2",
      quantity: 2
    },
    accessoryEquations: [
      { accessoryId: "acc-carretilla", quantityFormula: "2" },
      { accessoryId: "acc-emb", quantityFormula: "Ancho * 2 + Alto * 4" },
      { accessoryId: "acc-empaque", quantityFormula: "Ancho * 2 + Alto * 4" },
      { accessoryId: "acc-tornillo", quantityFormula: "16" }
    ]
  },
  {
    id: "f-barandal-classico",
    name: "Barandal de Aluminio y Vidrio Templado",
    category: "barandales",
    variables: [
      { name: "Ancho", description: "Ancho del barandal en cm", defaultValue: 150 },
      { name: "Alto", description: "Alto del barandal en cm", defaultValue: 90 }
    ],
    profileEquations: [
      { profileId: "prof-tubo-cuad-2", name: "Postes de Soporte Verticales (Tubo 2″)", formula: "Alto", quantity: 3, angle: "90/90" },
      { profileId: "prof-nat2", name: "Pasamanos Superior Horizontal", formula: "Ancho", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "Ancho - 25",
      formulaHeight: "Alto - 15",
      quantity: 1
    },
    accessoryEquations: [
      { accessoryId: "acc-esq", quantityFormula: "4" },
      { accessoryId: "acc-tornillo", quantityFormula: "12" }
    ]
  },
  {
    id: "f-reja-seguridad",
    name: "Reja de Seguridad / Protección",
    category: "rejas",
    variables: [
      { name: "Ancho", description: "Ancho total de la reja en cm", defaultValue: 120 },
      { name: "Alto", description: "Alto total de la reja en cm", defaultValue: 120 }
    ],
    profileEquations: [
      { profileId: "prof-tubo-cuad-2", name: "Marco Perimetral y Soportes Interiores", formula: "Ancho * 2 + Alto * 5", quantity: 1, angle: "90/90" }
    ],
    glassEquation: {
      formulaWidth: "0",
      formulaHeight: "0",
      quantity: 0
    },
    accessoryEquations: [
      { accessoryId: "acc-tornillo", quantityFormula: "24" }
    ]
  }
];

export const BRANDS: string[] = [
  "Indalum",
  "Grupo Crucero",
  "Extrusiones Metálicas",
  "Cuprum",
  "EuroAlum",
  "EuroVent"
];

export const COLORS: string[] = [
  "Blanco (Pintado)",
  "Natural (Anodizado)",
  "Negro",
  "Bronce",
  "Duranodick",
  "Champagne",
  "Oro",
  "Nogal (Madera)",
  "Pino (Madera)",
  "Cerezo (Madera)",
  "Duro E",
  "Sin Acabado"
];

export const INITIAL_CONFIG: WorkshopConfig = {
  profiles: DEFAULT_PROFILES,
  accessories: DEFAULT_ACCESSORIES,
  glasses: DEFAULT_GLASSES,
  formulas: DEFAULT_FORMULAS,
  notes: [
    {
      id: "note-1",
      clientName: "Ignacio Martínez",
      projectName: "Ventanas Sala",
      date: "2026-06-11",
      type: "Medidas Campo",
      measurements: "125 x 160 cm",
      text: "Requiere aluminio color Negro Mate. Vidrio 6mm templado. Cotizar con perfil Nacional de 3\" para mayor soporte.",
      status: "pendiente"
    },
    {
      id: "note-2",
      clientName: "Sofia Vergara",
      projectName: "Cancel de Baño",
      date: "2026-06-10",
      type: "Cancel Baño",
      measurements: "135 x 182 cm",
      text: "Cancel corredizo templado. El cliente pidió jaladera de pomo tipo H. Perfil color Natural Mate.",
      status: "cotizado"
    }
  ],
  invoices: [
    {
      id: "inv-1",
      invoiceNumber: "REM-2601",
      businessName: "ALUDEV - Aluminios de Veracruz",
      businessPhone: "229-684-6549",
      businessAddress: "Francisco Javier mina 50, Veracruz, Veracruz",
      businessRFC: "ALU230611HAA",
      clientName: "Ignacio Martínez",
      clientPhone: "553-912-4021",
      clientAddress: "Calle Del Río 24, Int 4, San Angel",
      date: "2026-06-11",
      dueDate: "2026-06-25",
      items: [
        { description: "Ventana Corrediza 2 Hojas Nacional 3″ (1.25m x 1.6m) - Negro Mate con Vidrio 6mm Templado", quantity: 2, unitPrice: 3250, total: 6500 },
        { description: "Cancel de Baño Templado Corredizo (1.35m x 1.82m) - Natural", quantity: 1, unitPrice: 4200, total: 4200 }
      ],
      subtotal: 10700,
      ivaPercent: 16,
      total: 12412,
      advancePayment: 6000,
      pendingBalance: 6412,
      notes: "El costo incluye transporte e instalación a domicilio. Se requiere anticipo del 50%. Pago en efectivo.",
      status: "fabricando"
    }
  ],
  quotes: [],
  businessDetails: {
    name: "ALUDEV - Cancelería y Portones",
    phone: "229-684-6549",
    address: "Francisco Javier mina 50, Veracruz, Veracruz",
    rfc: "ALU230611HAA",
    laborRatePerHour: 220, // $ per hour
    defaultBarLengthCm: 610 // standard commercial length is 6.1m (610 cm)
  }
};
