/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import {
  Wrench,
  Grid,
  FileText,
  Zap,
  Sliders,
  History,
  Scissors,
  Layers,
  Settings,
  ArrowLeft,
  Coins,
  TrendingDown,
  Trash2,
  Plus,
  Scale,
  Printer,
  ShoppingBag,
  Info,
  Award,
  Sparkles,
  Cloud,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  Percent,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image,
  Paintbrush
} from "lucide-react";
import { DynamicWindowPreview } from "./DynamicWindowPreview";

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-2xl text-[11px] font-mono">
        <p className="text-slate-400 font-sans font-bold border-b border-slate-850 pb-1 mb-1.5">{label}</p>
        <p className="text-[#38bdf8]">
          Cotizado: <span className="font-sans font-bold text-white">${payload[0].value.toLocaleString("es-MX")}</span>
        </p>
        <p className="text-emerald-400 mt-0.5">
          Materiales: <span className="font-sans font-bold text-white">${payload[1].value.toLocaleString("es-MX")}</span>
        </p>
        <p className="text-slate-400 mt-1 pt-1 border-t border-slate-850/50">
          Utilidad Est: <span className="font-sans font-bold text-amber-500">${(payload[0].value - payload[1].value).toLocaleString("es-MX")}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC<{
  setTab: (tab: string) => void;
  setCutsToOptimize?: (cuts: any[]) => void;
}> = ({ setTab, setCutsToOptimize }) => {
  const {
    state,
    addQuoteItem,
    deleteQuoteItem,
    clearQuotes,
    addInvoice,
    updateBusinessDetails,
    updateProfile,
    updateAccessory,
    updateGlass,
    resetToDefault
  } = useWorkshop();

  // Active sub-page in our beautiful native app structure
  // 'menu' is the landing grid of cards
  const [subScreen, setSubScreen] = useState<
    "menu" | "nueva" | "rapida" | "personalizado" | "historial" | "peso" | "config" | "alucalculadora"
  >("menu");

  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [showAyudaDialog, setShowAyudaDialog] = useState<boolean>(false);

  // -------------------------------------------------------------
  // STATE FOR ALU-CALCULADORA (VÍDEO STYLE STYLE)
  // -------------------------------------------------------------
  const [aluWidth, setAluWidth] = useState<number>(159);
  const [aluHeight, setAluHeight] = useState<number>(147);
  const [aluSeries, setAluSeries] = useState<"corrediza_3" | "corrediza_2" | "fijo_2">("corrediza_3");
  const [aluActiveTab, setAluActiveTab] = useState<"descuentos" | "cotizacion">("descuentos");
  const [aluGlassType, setAluGlassType] = useState<string>("glass-6t"); // Claro 6mm template
  
  // Custom price overrides to match video perfectly
  const [aluGlassPrice, setAluGlassPrice] = useState<number>(750); // $750/m2 per Claro 6mm
  const [aluJambaPrice, setAluJambaPrice] = useState<number>(180);
  const [aluRielPrice, setAluRielPrice] = useState<number>(150);
  const [aluCercoPrice, setAluCercoPrice] = useState<number>(135);
  const [aluTraslapePrice, setAluTraslapePrice] = useState<number>(135);
  const [aluZocloPrice, setAluZocloPrice] = useState<number>(140);
  const [aluAccessoryPrice, setAluAccessoryPrice] = useState<number>(327.90);
  const [aluLaborPrice, setAluLaborPrice] = useState<number>(420.19);

  // States for custom formulas editing to match video ("pueden ustedes modificar la formula")
  const [formulaJamba1, setFormulaJamba1] = useState<string>("W");
  const [formulaJamba2, setFormulaJamba2] = useState<string>("H - 2.7");
  const [formulaRiel, setFormulaRiel] = useState<string>("W");
  const [formulaCerco, setFormulaCerco] = useState<string>("H - 3.7");
  const [formulaTraslape, setFormulaTraslape] = useState<string>("H - 3.7");
  const [formulaZoclo, setFormulaZoclo] = useState<string>("(W - 18) / 2");

  // Secondary series inputs
  const [formulaJamba2_s2, setFormulaJamba2_s2] = useState<string>("H - 2.5");
  const [formulaRiel_s2, setFormulaRiel_s2] = useState<string>("W");
  const [formulaCabezal_s2, setFormulaCabezal_s2] = useState<string>("W");
  const [formulaCerco_s2, setFormulaCerco_s2] = useState<string>("H - 3.5");
  const [formulaTraslape_s2, setFormulaTraslape_s2] = useState<string>("H - 3.5");
  const [formulaZoclo_s2, setFormulaZoclo_s2] = useState<string>("(W - 14) / 2");

  const evalFormula = (equation: string, W: number, H: number): number => {
    try {
      const sanitized = equation
        .toUpperCase()
        .replace(/\bW\b/g, String(W))
        .replace(/\bH\b/g, String(H));
      const cleanExpr = sanitized.replace(/[^0-9.+\-*/() ]/g, "");
      // Evaluate safe expression
      const res = new Function(`return ${cleanExpr}`)();
      return typeof res === "number" && !isNaN(res) ? Number(res.toFixed(1)) : 0;
    } catch {
      return 0;
    }
  };

  // --- AluCalculadora Reactive Calculations ---
  const cutJamba1 = evalFormula(formulaJamba1, aluWidth, aluHeight);
  const cutJamba2 = evalFormula(formulaJamba2, aluWidth, aluHeight);
  const cutRiel = evalFormula(formulaRiel, aluWidth, aluHeight);
  const cutCerco = evalFormula(formulaCerco, aluWidth, aluHeight);
  const cutTraslape = evalFormula(formulaTraslape, aluWidth, aluHeight);
  const cutZoclo = evalFormula(formulaZoclo, aluWidth, aluHeight);

  const cutJamba2_s2 = evalFormula(formulaJamba2_s2, aluWidth, aluHeight);
  const cutRiel_s2 = evalFormula(formulaRiel_s2, aluWidth, aluHeight);
  const cutCabezal_s2 = evalFormula(formulaCabezal_s2, aluWidth, aluHeight);
  const cutCerco_s2 = evalFormula(formulaCerco_s2, aluWidth, aluHeight);
  const cutTraslape_s2 = evalFormula(formulaTraslape_s2, aluWidth, aluHeight);
  const cutZoclo_s2 = evalFormula(formulaZoclo_s2, aluWidth, aluHeight);

  const glassW = aluSeries === "corrediza_3" ? (aluWidth - 14.6) / 2 : (aluWidth - 11.2) / 2;
  const glassH = aluSeries === "corrediza_3" ? aluHeight - 5.5 : aluHeight - 4.5;
  const rawArea = (glassW / 100) * (glassH / 100) * 2;
  const billingArea = Number((rawArea * 1.1404).toFixed(2));
  const glassCostCalculated = Number((billingArea * aluGlassPrice).toFixed(1));

  const totJamba = aluSeries === "corrediza_3" ? cutJamba1 + (2 * cutJamba2) : (2 * cutJamba2_s2);
  const barsJamba = Math.ceil(totJamba / 600) || 1;
  const totJambaCost = barsJamba * aluJambaPrice;

  const totRiel = aluSeries === "corrediza_3" ? (2 * cutRiel) : (1 * cutRiel_s2 + 1 * cutCabezal_s2);
  const barsRiel = Math.ceil(totRiel / 600) || 1;
  const totRielCost = barsRiel * aluRielPrice;

  const totCerco = aluSeries === "corrediza_3" ? (2 * cutCerco) : (2 * cutCerco_s2);
  const barsCerco = Math.ceil(totCerco / 600) || 1;
  const totCercoCost = barsCerco * aluCercoPrice;

  const totTraslape = aluSeries === "corrediza_3" ? (2 * cutTraslape) : (2 * cutTraslape_s2);
  const barsTraslape = Math.ceil(totTraslape / 600) || 1;
  const totTraslapeCost = barsTraslape * aluTraslapePrice;

  const totZoclo = aluSeries === "corrediza_3" ? (4 * cutZoclo) : (4 * cutZoclo_s2);
  const barsZoclo = Math.ceil(totZoclo / 600) || 1;
  const totZocloCost = barsZoclo * aluZocloPrice;

  const totalPerfilesCost = totJambaCost + totRielCost + totCercoCost + totTraslapeCost + totZocloCost;
  const grandTotalAluCalculadora = totalPerfilesCost + glassCostCalculated + aluAccessoryPrice + aluLaborPrice;

  const copyCutsReport = () => {
    const report = `📐 ALU-CALCULADORA DE DESCUENTOS DE TALLER
Proyecto: Ventana Corrediza ${aluSeries === "corrediza_3" ? "3 pulgadas L3" : "2 pulgadas Económica"}
Dimensiones: ${aluWidth} cm de Ancho × ${aluHeight} cm de Alto

LISTA DE CORTES (DESCUENTOS REALES):
----------------------------------------
${aluSeries === "corrediza_3" ? `
• JAMBA_L3 Horizontal: 1 pz - ${cutJamba1} cm  (formula: ${formulaJamba1})
• JAMBA_L3 Vertical: 2 pz - ${cutJamba2} cm   (formula: ${formulaJamba2})
• RIEL_L3 Horizontal (Secciones): 2 pz - ${cutRiel} cm (formula: ${formulaRiel})
• CERCO_L3 Vertical de Hoja: 2 pz - ${cutCerco} cm (formula: ${formulaCerco})
• TRASLAPE_L3 Vertical: 2 pz - ${cutTraslape} cm (formula: ${formulaTraslape})
• ZOCLO 1V_L3 Horizontal: 4 pz - ${cutZoclo} cm (formula: ${formulaZoclo})
` : `
• JAMBA_L2 Horizontal: 1 pz - ${aluWidth} cm
• JAMBA_L2 Vertical: 2 pz - ${cutJamba2_s2} cm  (formula: ${formulaJamba2_s2})
• RIEL_L2 Inferior: 1 pz - ${cutRiel_s2} cm     (formula: ${formulaRiel_s2})
• CABEZAL_L2 Superior: 1 pz - ${cutCabezal_s2} cm (formula: ${formulaCabezal_s2})
• CERCO_L2 Vertical: 2 pz - ${cutCerco_s2} cm   (formula: ${formulaCerco_s2})
• TRASLAPE_L2 Vertical: 2 pz - ${cutTraslape_s2} cm (formula: ${formulaTraslape_s2})
• ZOCLO_L2 Horizontal: 4 pz - ${cutZoclo_s2} cm  (formula: ${formulaZoclo_s2})
`}

CRISTALERÍA REQUERIDA:
----------------------------------------
• 2 pzs - Claro 6mm de: ${glassW.toFixed(1)} cm × ${glassH.toFixed(1)} cm
• Área facturada total: ${billingArea} m² (con desperdicio de corte)

ESTIMADO DE COSTO DE FABRICACIÓN TRABAJO BRUTO:
----------------------------------------
- Costo de Perfiles (por tramas de 6m): $${totalPerfilesCost.toLocaleString("es-MX")} MXN
- Costo de Vidrios: $${glassCostCalculated.toLocaleString("es-MX")} MXN
- Costo de Herrajes & Accesorios: $${aluAccessoryPrice.toLocaleString("es-MX")} MXN
- Mano de Obra y Utilidad: $${aluLaborPrice.toLocaleString("es-MX")} MXN

💰 COSTO BRUTO TOTAL: $${grandTotalAluCalculadora.toLocaleString("es-MX")} MXN

Generado automáticamente desde AluDev Inc México.`;
    
    navigator.clipboard.writeText(report);
    alert("¡Lista de descuentos y costos copiada al portapapeles! Puedes enviarla cómodamente por WhatsApp a tus colaboradores del taller.");
  };

  const handleEmpezarTrabajar = () => {
    let cuts: any[] = [];
    if (aluSeries === "corrediza_3") {
      cuts = [
        { id: `alu-c-1`, name: `JAMBA_L3 Hor (W)`, lengthCm: cutJamba1, quantity: 1, angle: "90°", profileName: "JAMBA_L3" },
        { id: `alu-c-2`, name: `JAMBA_L3 Vert (H-2.7)`, lengthCm: cutJamba2, quantity: 2, angle: "90°", profileName: "JAMBA_L3" },
        { id: `alu-c-3`, name: `RIEL_L3 Hor`, lengthCm: cutRiel, quantity: 2, angle: "90°", profileName: "RIEL_L3" },
        { id: `alu-c-4`, name: `CERCO_L3 Vert`, lengthCm: cutCerco, quantity: 2, angle: "90°", profileName: "CERCO_L3" },
        { id: `alu-c-5`, name: `TRASLAPE_L3 Vert`, lengthCm: cutTraslape, quantity: 2, angle: "90°", profileName: "TRASLAPE_L3" },
        { id: `alu-c-6`, name: `ZOCLO 1V_L3 Hor`, lengthCm: cutZoclo, quantity: 4, angle: "90°", profileName: "ZOCLO 1V_L3" }
      ];
    } else {
      cuts = [
        { id: `alu-c-21`, name: `JAMBA_L2 Hor`, lengthCm: aluWidth, quantity: 1, angle: "90°", profileName: "JAMBA_L2" },
        { id: `alu-c-22`, name: `JAMBA_L2 Vert`, lengthCm: cutJamba2_s2, quantity: 2, angle: "90°", profileName: "JAMBA_L2" },
        { id: `alu-c-23`, name: `RIEL_L2 Inf`, lengthCm: cutRiel_s2, quantity: 1, angle: "90°", profileName: "RIEL_L2" },
        { id: `alu-c-24`, name: `CABEZAL_L2 Sup`, lengthCm: cutCabezal_s2, quantity: 1, angle: "90°", profileName: "CABEZAL_L2" },
        { id: `alu-c-25`, name: `CERCO_L2 Vert`, lengthCm: cutCerco_s2, quantity: 2, angle: "90°", profileName: "CERCO_L2" },
        { id: `alu-c-26`, name: `TRASLAPE_L2 Vert`, lengthCm: cutTraslape_s2, quantity: 2, angle: "90°", profileName: "TRASLAPE_L2" },
        { id: `alu-c-27`, name: `ZOCLO_L2 Hor`, lengthCm: cutZoclo_s2, quantity: 4, angle: "90°", profileName: "ZOCLO_L2" }
      ];
    }
    
    const validCuts = cuts.filter(c => c.lengthCm > 1);
    
    if (setCutsToOptimize) {
      setCutsToOptimize(validCuts);
      alert("¡Medidas y lista de cortes enviadas al ESPACIO DE OPTIMIZACIÓN! Pasemos automáticamente a generar el despachador de barras de 6.1m con menor residuo.");
      setTab("optimizador");
    } else {
      alert("El vinculador del despachador de barras no se encuentra activado. Copia la lista de cortes para pegarla manualmente en la ventana del Optimizador.");
    }
  };

  // -------------------------------------------------------------
  // RECHARTS SUMMARY METRICS CALCULATOR (LAST 30 DAYS)
  // -------------------------------------------------------------
  const generateChartData = () => {
    const dataMap = new Map<string, { date: string, formattedDate: string, valorCotizado: number, costoMateriales: number }>();
    
    // Simulate current time as June 14, 2026
    const today = new Date("2026-06-14");
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const day = d.getDate();
      const month = d.toLocaleString("es-MX", { month: "short" });
      const formattedDate = `${day} ${month}`;
      
      // Let's create some deterministic background invoice history to make the 30-day plot gorgeous initially!
      let baseVal = 0;
      let baseCost = 0;
      
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && i > 3) { // no mock sales on Sundays, and we leave the latest days empty for real testing
        const tick = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()) % 7;
        if (tick === 1) {
          baseVal = 6400;
          baseCost = 2820;
        } else if (tick === 3) {
          baseVal = 8200;
          baseCost = 3690;
        } else if (tick === 5) {
          baseVal = 11400;
          baseCost = 5130;
        }
      }
      
      dataMap.set(dateKey, {
        date: dateKey,
        formattedDate,
        valorCotizado: baseVal,
        costoMateriales: baseCost
      });
    }
    
    // Add real database state invoices dynamically on top
    state.invoices.forEach(invoice => {
      const dateKey = invoice.date;
      if (dataMap.has(dateKey)) {
        const existing = dataMap.get(dateKey)!;
        existing.valorCotizado += invoice.total;
        
        // Material cost is usually around 44% of subtotal
        const matCost = Math.round((invoice.subtotal || invoice.total) * 0.44);
        existing.costoMateriales += matCost;
      } else {
        const d = new Date(dateKey);
        if (!isNaN(d.getTime())) {
          const day = d.getDate();
          const month = d.toLocaleString("es-MX", { month: "short" });
          const formattedDate = `${day} ${month}`;
          const matCost = Math.round((invoice.subtotal || invoice.total) * 0.44);
          
          dataMap.set(dateKey, {
            date: dateKey,
            formattedDate,
            valorCotizado: invoice.total,
            costoMateriales: matCost
          });
        }
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const chartData = generateChartData();

  // -------------------------------------------------------------
  // SUBSCREEN S1: PESO DE VIDRIO UTILITY STATE
  // -------------------------------------------------------------
  const [glassBase, setGlassBase] = useState<number>(200);
  const [glassHeight, setGlassHeight] = useState<number>(200);
  const [glassThickness, setGlassThickness] = useState<number>(10);
  const [glassQty, setGlassQty] = useState<number>(1);

  const clearGlassCalculator = () => {
    setGlassBase(120);
    setGlassHeight(150);
    setGlassThickness(6);
    setGlassQty(1);
  };

  const calcGlassArea = () => {
    return (glassBase / 100) * (glassHeight / 100);
  };

  const calcSingleGlassWeight = () => {
    return calcGlassArea() * glassThickness * 2.5;
  };

  const calcTotalGlassWeight = () => {
    return calcSingleGlassWeight() * glassQty;
  };

  // -------------------------------------------------------------
  // SUBSCREEN S2: COTIZACIÓN RÁPIDA (LIGHTNING CALCULATOR STATE)
  // -------------------------------------------------------------
  const [qrProduct, setQrProduct] = useState<string>("Ventana Corrediza");
  const [qrLine, setQrLine] = useState<string>("Línea Nacional");
  const [qrInches, setQrInches] = useState<string>("2″");
  const [qrLeaves, setQrLeaves] = useState<string>("2 hojas");
  const [qrWidth, setQrWidth] = useState<number>(200);
  const [qrHeight, setQrHeight] = useState<number>(120);
  const [qrGlass, setQrGlass] = useState<string>("Claro");
  const [qrColor, setQrColor] = useState<string>("Natural");

  const [quickEstimateTotal, setQuickEstimateTotal] = useState<number>(0);

  // Run dynamic lightning math aligned with base configurations
  useEffect(() => {
    // Basic approximate math factor centered around dimensions
    const widthM = qrWidth / 100;
    const heightM = qrHeight / 100;
    const perimeterM = widthM * 2 + heightM * 2;

    // aluminum configuration factors
    let aluBasePrice = 65; // per meter
    if (qrColor === "Nogal" || qrColor === "Pino") aluBasePrice = 110;
    if (qrColor === "Negro Mate" || qrColor === "Negro Brillante") aluBasePrice = 85;
    if (qrColor === "Champagne") aluBasePrice = 90;
    if (qrColor === "Blanco") aluBasePrice = 75;

    // Line complexity factor
    let lineModifier = 1.0;
    if (qrLine === "Serie 4600") lineModifier = 1.6;
    if (qrLine === "Serie 1400") lineModifier = 1.4;
    if (qrInches === "3″") lineModifier *= 1.25;

    // Glass prices per square meter
    let glassPriceM2 = 300;
    if (qrGlass === "Filtrasol") glassPriceM2 = 350;
    if (qrGlass === "Tintex") glassPriceM2 = 400;

    // Accessory base kit
    let accessoryKitPrice = 220;
    if (qrProduct.includes("Cancel")) accessoryKitPrice = 380;

    // Sheet calculations base
    const aluminumMeters = perimeterM * (qrLeaves.includes("4") ? 2.5 : qrLeaves.includes("3") ? 2.0 : 1.5);
    const aluminumCost = aluminumMeters * aluBasePrice * lineModifier;
    const glassCost = widthM * heightM * glassPriceM2;
    
    // Add default waste factors and recommended utility markup
    const initialBaseCost = aluminumCost * 1.1 + glassCost + accessoryKitPrice;
    const markupPrice = initialBaseCost * 1.45; // default 45% margin
    
    setQuickEstimateTotal(Math.round(markupPrice));
  }, [qrProduct, qrLine, qrInches, qrLeaves, qrWidth, qrHeight, qrGlass, qrColor]);

  // Handle saving Quick Estimated item to quote roster
  const saveQuickEstimateToQuote = () => {
    const itemLabel = `Fast Calc: ${qrProduct} ${qrLine} ${qrInches} (${qrLeaves})`;
    addQuoteItem({
      id: "quick_" + Date.now(),
      label: itemLabel,
      width: qrWidth,
      height: qrHeight,
      line: qrLine + " " + qrInches,
      color: qrColor,
      glassType: qrGlass + " std",
      qty: 1,
      totalPrice: quickEstimateTotal,
      profiles: [],
      glasses: [],
      accessories: [],
      laborMinutes: 90,
      isManual: true
    });
    alert("¡Cotización Rápida agregada con éxito al carro de facturas!");
    setSubScreen("historial");
  };

  // -------------------------------------------------------------
  // SUBSCREEN S3: PRESUPUESTO PERSONALIZADO STATE
  // -------------------------------------------------------------
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [clientProject, setClientProject] = useState<string>("");

  const [customConcepts, setCustomConcepts] = useState<
    Array<{ id: string; description: string; qty: number; unitPrice: number }>
  >([{ id: "1", description: "", qty: 1, unitPrice: 0 }]);

  const [depositType, setDepositType] = useState<"percent" | "fixed">("percent");
  const [depositValue, setDepositValue] = useState<number>(70);
  const [manualIva, setManualIva] = useState<boolean>(false);

  const addCustomConceptRow = () => {
    setCustomConcepts((prev) => [
      ...prev,
      { id: Date.now().toString(), description: "", qty: 1, unitPrice: 0 }
    ]);
  };

  const removeCustomConceptRow = (id: string) => {
    if (customConcepts.length > 1) {
      setCustomConcepts((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleConceptChange = (id: string, field: "description" | "qty" | "unitPrice", value: any) => {
    setCustomConcepts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const calcManualSubtotal = () => {
    return customConcepts.reduce((acc, current) => acc + current.qty * current.unitPrice, 0);
  };

  const calcManualTotal = () => {
    const sub = calcManualSubtotal();
    return manualIva ? sub * 1.16 : sub;
  };

  const calcManualDeposit = () => {
    if (depositType === "fixed") {
      return depositValue;
    }
    return calcManualTotal() * (depositValue / 100);
  };

  const calcManualPending = () => {
    return calcManualTotal() - calcManualDeposit();
  };

  const saveManualBudgetToRoster = () => {
    if (customConcepts.some((c) => c.description.trim() === "")) {
      alert("Por favor, llena la descripción de tus conceptos personalizados.");
      return;
    }

    // Register each row as separate quotes
    customConcepts.forEach((item, index) => {
      addQuoteItem({
        id: "manual_item_" + index + "_" + Date.now(),
        label: item.description,
        width: 0,
        height: 0,
        line: "Concepto Libre",
        color: "N/A",
        glassType: "N/A",
        qty: item.qty,
        totalPrice: item.unitPrice * item.qty,
        profiles: [],
        glasses: [],
        accessories: [],
        laborMinutes: 0,
        isManual: true
      });
    });

    // Create immediate PDF Remisión Invoice if client name exists
    if (clientName.trim() !== "") {
      addInvoice({
        id: "rem_" + Date.now(),
        clientName: clientName,
        phone: clientPhone,
        address: clientAddress,
        projectName: clientProject,
        items: customConcepts.map((c) => ({
          description: c.description,
          qty: c.qty,
          unitPrice: c.unitPrice,
          total: c.qty * c.unitPrice
        })),
        subtotal: calcManualSubtotal(),
        tax: manualIva ? calcManualSubtotal() * 0.16 : 0,
        total: calcManualTotal(),
        advancePayment: calcManualDeposit(),
        pendingBalance: calcManualPending(),
        date: new Date().toLocaleDateString("es-MX"),
        notes: "Presupuesto personalizado directo registrado."
      });
    }

    alert("¡Presupuesto guardado en el archivo del taller con éxito!");
    // Reset
    setClientName("");
    setClientPhone("");
    setClientAddress("");
    setClientProject("");
    setCustomConcepts([{ id: "1", description: "", qty: 1, unitPrice: 0 }]);
    setSubScreen("historial");
  };

  // -------------------------------------------------------------
  // SUBSCREEN S4: NUEVA COTIZACIÓN (GUIDED FLOW STATE)
  // -------------------------------------------------------------
  const [guideStep, setGuideStep] = useState<1 | 2 | 3>(1);
  const [wizardClient, setWizardClient] = useState<string>("");
  const [wizardPhone, setWizardPhone] = useState<string>("");
  const [wizardAddress, setWizardAddress] = useState<string>("");
  const [wizardProject, setWizardProject] = useState<string>("");
  const [wizardNotes, setWizardNotes] = useState<string>("");

  const [wizardLine, setWizardLine] = useState<"nacional" | "espanola">("nacional");
  const [wizardCategory, setWizardCategory] = useState<string>("ventanas");
  const [wizardSubtype, setWizardSubtype] = useState<string>("Ventana Corrediza 2″");
  const [wizardHojas, setWizardHojas] = useState<number>(2);
  const [wizardModulation, setWizardModulation] = useState<string>("Puro Vidrio");

  const [wizardWidth, setWizardWidth] = useState<number>(120);
  const [wizardHeight, setWizardHeight] = useState<number>(120);
  const [wizardColor, setWizardColor] = useState<string>("Blanco (Pintado)");
  const [wizardGlass, setWizardGlass] = useState<string>("Vidrio Claro 6mm");

  const [guidedEstimatePrice, setGuidedEstimatePrice] = useState<number>(0);

  // Sync Guided pricing math
  useEffect(() => {
    const area = (wizardWidth / 100) * (wizardHeight / 100);
    const perimeter = (wizardWidth * 2 + wizardHeight * 2) / 100;
    
    let basePerimeterRate = 75; // Blanco
    if (wizardColor.includes("Nogal") || wizardColor.includes("Textura")) basePerimeterRate = 120;
    if (wizardColor.includes("Negro")) basePerimeterRate = 90;
    if (wizardColor.includes("Natural")) basePerimeterRate = 80;

    let baseGlassRate = 320; // 6mm clear
    if (wizardGlass.includes("10mm") || wizardGlass.includes("TEMPLADO")) baseGlassRate = 680;
    if (wizardGlass.includes("Filtrasol")) baseGlassRate = 380;

    const sheetsFactor = wizardHojas;
    const materialValue = (perimeter * basePerimeterRate * sheetsFactor * 1.1) + (area * baseGlassRate);
    const totalWLabor = materialValue + 500; // adding assembly flat fee
    
    setGuidedEstimatePrice(Math.round(totalWLabor));
  }, [wizardWidth, wizardHeight, wizardColor, wizardGlass, wizardHojas]);

  const submitWizardToQuotes = () => {
    addQuoteItem({
      id: "wiz_" + Date.now(),
      label: `Suministro de: ${wizardSubtype} (${wizardModulation})`,
      width: wizardWidth,
      height: wizardHeight,
      line: wizardLine === "nacional" ? "Línea Nacional" : "Línea Española",
      color: wizardColor,
      glassType: wizardGlass,
      qty: 1,
      totalPrice: guidedEstimatePrice,
      profiles: [],
      glasses: [],
      accessories: [],
      laborMinutes: 180,
      isManual: true
    });

    if (wizardClient.trim() !== "") {
      // also create notes
      addInvoice({
        id: "inv_wiz_" + Date.now(),
        clientName: wizardClient,
        phone: wizardPhone,
        address: wizardAddress,
        projectName: wizardProject,
        items: [
          {
            description: `${wizardSubtype} de ${wizardWidth}x${wizardHeight}cm. Color ${wizardColor}. Vidrio: ${wizardGlass}. Modulación: ${wizardModulation}.`,
            qty: 1,
            unitPrice: guidedEstimatePrice,
            total: guidedEstimatePrice
          }
        ],
        subtotal: guidedEstimatePrice,
        tax: 0,
        total: guidedEstimatePrice,
        advancePayment: guidedEstimatePrice * 0.7,
        pendingBalance: guidedEstimatePrice * 0.3,
        date: new Date().toLocaleDateString("es-MX"),
        notes: wizardNotes || "Cotización guiada estructurada."
      });
    }

    alert("¡Cotización guiada guardada e incorporada al balance!");
    setGuideStep(1);
    setWizardClient("");
    setWizardPhone("");
    setWizardAddress("");
    setWizardProject("");
    setWizardNotes("");
    setSubScreen("historial");
  };

  return (
    <div className="space-y-6" id="dashboard_native_module">
      
      {/* NATIVE APP TITLE BAR */}
      <div className="flex justify-between items-center bg-slate-950/20 p-2.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
        <button
          onClick={() => setSubScreen("menu")}
          className={`flex items-center gap-2 font-mono text-[11px] font-black uppercase py-2 px-4 rounded-xl transition ${
            subScreen !== "menu"
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30"
              : "text-slate-400 opacity-50 cursor-not-allowed"
          }`}
          disabled={subScreen === "menu"}
        >
          <ArrowLeft size={14} />
          Volver al Menú
        </button>

        <div className="flex items-center gap-2">
          {state.quotes.length > 0 && (
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-1 rounded font-bold uppercase tracking-wider font-mono animate-pulse">
              {state.quotes.length} Cotiz en Cola
            </span>
          )}
          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded font-bold uppercase tracking-wider font-mono">
            Versión Móvil 3.4
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN VIEW ROUTER PORTION
      ------------------------------------------------------------- */}

      {/* VIEW S0: landing menu structure matching video */}
      {subScreen === "menu" && (
        <div className="space-y-6 animate-fade-in relative">
          
          {/* Welcome Branding Hero Panel mimicking Perfilexacto Pro screenshots */}
          <div className="flex flex-col items-center justify-center text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl mb-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a213a] rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Round Medallion Brand Logo inspired by Perfilexacto Pro */}
            <div className="w-28 h-28 rounded-full bg-slate-950 border-4 border-slate-700/80 flex flex-col items-center justify-center p-3 mb-4 shadow-2xl select-none relative ring-4 ring-offset-2 ring-slate-900 ring-offset-slate-950">
              <div className="absolute inset-1.5 rounded-full border border-dashed border-slate-500/50"></div>
              <svg viewBox="0 0 100 100" className="w-16 h-16 text-[#0284c7] drop-shadow-lg">
                <rect x="20" y="20" width="60" height="60" rx="10" stroke="currentColor" strokeWidth="5.5" fill="none" />
                <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="4.5" />
                <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="4.5" />
                <line x1="30" y1="40" x2="40" y2="30" stroke="currentColor" strokeWidth="3" />
                <line x1="60" y1="70" x2="70" y2="60" stroke="currentColor" strokeWidth="3" />
              </svg>
            </div>

            <h1 className="text-3xl font-black text-slate-100 tracking-tight font-sans font-sans">
              Perfilexacto Pro
            </h1>
            <p className="text-[#38bdf8] text-xs font-mono font-bold tracking-wider mt-1 uppercase">
              Aluminio Residencial Perfilexacto
            </p>

            {/* Glowing PRO Active badge identical to the screenshot */}
            <div className="inline-flex items-center gap-1.5 bg-[#152e21] border border-[#214c35] px-4 py-1.5 rounded-full text-[#34d399] font-sans font-bold text-xs tracking-wider mt-4 shadow-sm animate-pulse">
              <Sparkles size={11} className="fill-current" />
              PRO Activo
            </div>
          </div>

          {/* Interactive menus grid aligned with video */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Item 1: Nueva Cotizacion */}
            <button
              onClick={() => {
                setGuideStep(1);
                setSubScreen("nueva");
              }}
              className="p-5 bg-gradient-to-br from-[#2a2421] to-[#1c1816] hover:from-[#342b27] hover:to-[#221c1a] border border-[#443831] hover:border-[#52443b] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#fb923c] text-[#3c1800] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#ffae66]/20 group-hover:scale-105 transition">
                <FileText size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-50 text-base">Nueva Cotización</h4>
                <p className="text-[#a89993] text-xs leading-normal mt-1">Estructura medidas de marcos, hojas, duelas y vidrio con planos guiados.</p>
              </div>
            </button>

            {/* Item 2: Cotizacion Rapida */}
            <button
              onClick={() => setSubScreen("rapida")}
              className="p-5 bg-gradient-to-br from-[#231f13] to-[#17140d] hover:from-[#2e291a] hover:to-[#1e1a11] border border-[#3e341f] hover:border-[#4d4026] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#facc15] text-[#342200] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#ffea66]/20 group-hover:scale-105 transition">
                <Zap size={20} className="fill-current animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-50 text-base">Cotización Rápida</h4>
                <p className="text-[#a19985] text-xs leading-normal mt-1">Sugerencias y estimados instantáneos por metro y color en 2 segundos.</p>
              </div>
            </button>

            {/* Item 3: Presupuesto Personalizado */}
            <button
              onClick={() => setSubScreen("personalizado")}
              className="p-5 bg-gradient-to-br from-[#1d1627] to-[#130f1a] hover:from-[#271e35] hover:to-[#1a1424] border border-[#35254a] hover:border-[#432f5e] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#c084fc] text-[#3b006f] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#dda6ff]/20 group-hover:scale-105 transition">
                <Sliders size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-50 text-base">Presupuesto Personalizado</h4>
                <p className="text-[#a499b1] text-xs leading-normal mt-1">Redacta conceptos manuales, añade anticipos y condiciones al PDF.</p>
              </div>
            </button>

            {/* Item 4: Historial */}
            <button
              onClick={() => setSubScreen("historial")}
              className="p-5 bg-gradient-to-br from-[#1a1b1d] to-[#111213] hover:from-[#232427] hover:to-[#17181a] border border-[#2d2f33] hover:border-[#383b40] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-slate-400 text-slate-900 p-3.5 rounded-2xl shadow-lg ring-1 ring-slate-300/20 group-hover:scale-105 transition">
                <History size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-200 text-base">Historial</h4>
                <p className="text-slate-400 text-xs leading-normal mt-1">Ficheros de cotizaciones en curso y notas de cobro archivadas.</p>
              </div>
            </button>

            {/* Item 5: Optimizador de Cortes */}
            <button
              onClick={() => setTab("optimizador")}
              className="p-5 bg-gradient-to-br from-[#15231c] to-[#0e1713] hover:from-[#1d3127] hover:to-[#13211a] border border-[#21372c] hover:border-[#2a4638] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#34d399] text-[#003c20] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#6bf8bf]/25 group-hover:scale-105 transition">
                <Scissors size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-emerald-50 text-base">Optimizador de Cortes</h4>
                <p className="text-[#96a99e] text-xs leading-normal mt-1">Reduce el desperdicio de barras de 6.10m ingresando tus medidas.</p>
              </div>
            </button>

            {/* Item 6: Peso de Vidrio */}
            <button
              onClick={() => setSubScreen("peso")}
              className="p-5 bg-gradient-to-br from-[#151f28] to-[#0e141a] hover:from-[#1e2b38] hover:to-[#141d26] border border-[#1e303f] hover:border-[#263c4e] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#38bdf8] text-[#003651] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#7dd3fc]/20 group-hover:scale-105 transition">
                <Scale size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sky-50 text-base">Peso de Vidrio</h4>
                <p className="text-[#98a6b1] text-xs leading-normal mt-1">Multiplica metros cuadrados por espesor de hoja al instante.</p>
              </div>
            </button>

            {/* Item 7: Calculadora AluDev (Fórmulas y Descuentos del Vídeo) */}
            <button
              onClick={() => setSubScreen("alucalculadora")}
              className="p-5 bg-gradient-to-br from-[#0c202d] to-[#06111a] hover:from-[#123145] hover:to-[#0a1b28] border border-[#1b435c] hover:border-[#225575] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group animate-pulse-slow"
              id="alucalculadora-dashboard-trigger"
            >
              <div className="bg-[#0284c7] text-[#e0f2fe] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#0284c7]/20 group-hover:scale-105 transition sm:animate-bounce">
                <Wrench size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sky-100 text-base font-sans">Calculadora AluDev</h4>
                <p className="text-slate-400 text-xs leading-normal mt-1">Generador de descuentos por perfiles de corte y cotizaciones rápidas tal como en el vídeo.</p>
              </div>
            </button>

            {/* Item 8: Configuración */}
            <button
              onClick={() => setSubScreen("config")}
              className="p-5 bg-gradient-to-br from-[#1d1d1f] to-[#121213] hover:from-[#262629] hover:to-[#19191b] border border-[#2e2e31] hover:border-[#39393d] text-left rounded-2xl flex items-start gap-4 transition shadow-lg group"
            >
              <div className="bg-[#a1a1aa] text-[#1f1f23] p-3.5 rounded-2xl shadow-lg ring-1 ring-[#d4d4d8]/20 group-hover:scale-105 transition">
                <Settings size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-zinc-100 text-base font-sans font-medium">Configuración</h4>
                <p className="text-zinc-400 text-xs leading-normal mt-1">Tabuladores de precios para perfiles de 2 y 3 pulgadas, planchas, vinil, herrajes y notas PDF.</p>
              </div>
            </button>

          </div>

          {/* LOWER ACTION RAIL AND STATUS INDICATORS matching Perfilexacto Pro style */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-1 border-t border-slate-800">
            {/* ID hardware serial plate block */}
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-400 font-medium">LICENCIA PRO:</span>
              <span className="text-emerald-400 font-bold tracking-wider">ID: PX-BE9C-787D</span>
            </div>

            {/* Green help messenger bubble button */}
            <button
              onClick={() => setShowAyudaDialog(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-950/20 active:scale-95 transition"
            >
              <HelpCircle size={16} />
              Ayuda
            </button>
          </div>

          {/* INTERACTIVE AYUDA MODAL DIALOG */}
          {showAyudaDialog && (
            <div className="fixed inset-0 bg-slate-1000/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4 animate-scale-up">
                <button
                  type="button"
                  onClick={() => setShowAyudaDialog(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                  <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-950">
                    <HelpCircle size={16} />
                  </div>
                  <h3 className="font-bold text-slate-100 text-base text-left">Asistente de Ayuda Pro</h3>
                </div>

                <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed max-h-[350px] overflow-y-auto pr-1 text-left">
                  <div>
                    <h5 className="font-bold text-[#38bdf8] mb-0.5">¿Cómo simplificar la cotización para el cliente?</h5>
                    <p>En el Proyecto de Cotización, puedes hacer clic en el botón <b>Editar</b> (el lápiz) de cualquier pieza. Allí puedes escribir un texto sencillo (sin milímetros ni claves raras) u oprimir <b>"Sugerir texto simple"</b>. Además, activa la casilla <i>"Simplificar PDF"</i> para ocultar desgloses de perfiles.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#38bdf8] mb-0.5">¿Cómo cotizar Sin Cristal?</h5>
                    <p>En la selección de vidrios de tu nueva pieza, desliza y selecciona la primera opción: <b>"Sin cristal (Solo Estructura / Perfilería)"</b>. El cotizador calculará el aluminio y accesorios, restando por completo los costos de cristalería.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[#38bdf8] mb-0.5">¿Dónde se guardan los PDF?</h5>
                    <p>Se descargan automáticamente en la carpeta de descargas de tu computadora o celular con el folio, fecha y nombre de tu cliente corporativo.</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-amber-500 mb-0.5">¿Cómo contacto a soporte de desarrollo?</h5>
                    <p>Usa la ID de licencia <b>PX-BE9C-787D</b> si necesitas recuperar o actualizar el sistema de descuentos personalizados.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAyudaDialog(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition"
                >
                  Entendido, Volver al Taller
                </button>
              </div>
            </div>
          )}

          {/* S0c Visual Sales and Material Costs Chart Card (Last 30 Days) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-2 border-b border-slate-850">
              <div>
                <h4 className="font-bold text-white text-sm uppercase font-sans tracking-wide">Métricas de Rendimiento (Últimos 30 Días)</h4>
                <p className="text-slate-400 text-xs mt-0.5">Historial acumulado de cotizaciones vs. costo estimado de materiales</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
                  <span className="text-slate-300">Valor Cotizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                  <span className="text-slate-300">Costo Materiales</span>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorQuoted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="formattedDate" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="valorCotizado" 
                    stroke="#38bdf8" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorQuoted)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="costoMateriales" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* S0b Quick Stock Alert segment helper and Cloud State */}
          <div className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 p-4 rounded-2xl flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Cloud size={14} className="text-emerald-500 shrink-0" />
              Sincronización de Base de Datos: <strong className="text-slate-700 dark:text-slate-200">Local + Offline Activado</strong>
            </span>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold font-mono px-2 py-0.5 rounded">
              Base: SQLite Local
            </span>
          </div>

        </div>
      )}

      {/* VIEW S1: PESO DE VIDRIO VIEW */}
      {subScreen === "peso" && (
        <div className="bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-3xl space-y-6 shadow-2xl animate-fade-in" id="glass-weight-calculator-view">
          
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/10">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans uppercase">Cálculo de Peso de Vidrio</h2>
              <p className="text-slate-400 text-xs">Cálculo para vidrios crudos templados o laminados</p>
            </div>
          </div>

          {/* Formula Instruction Box matches video exactly */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs">
            <Info size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="leading-normal font-medium">
              <strong className="text-amber-400 font-mono">Fórmula:</strong> Base(m) × Altura(m) × Espesor(mm) × 2.5 = Peso(kg)
            </p>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Base (cm):</label>
              <input
                type="number"
                value={glassBase}
                onChange={(e) => setGlassBase(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                placeholder="Ej: 120"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Altura (cm):</label>
              <input
                type="number"
                value={glassHeight}
                onChange={(e) => setGlassHeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                placeholder="Ej: 150"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Espesor (mm):</label>
              <input
                type="number"
                value={glassThickness}
                onChange={(e) => setGlassThickness(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3 px-4 font-mono font-bold text-lg focus:outline-none focus:ring-1 focus:ring-sky-500 transition animate-fade-in"
                placeholder="Ej: 6"
              />
            </div>

            {/* Espesores Comunes Pill Buttons matches video */}
            <div>
              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 font-mono">Espesores comunes:</span>
              <div className="flex flex-wrap gap-2">
                {[3, 4, 5, 6, 8, 9, 10, 12, 15, 19].map((thick) => {
                  const isActive = glassThickness === thick;
                  return (
                    <button
                      key={thick}
                      type="button"
                      onClick={() => setGlassThickness(thick)}
                      className={`text-xs font-bold font-mono px-3.5 py-1.5 rounded-xl border transition ${
                        isActive
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {thick}mm
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Glass Qty count */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Cantidad de Hojas:</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGlassQty((prev) => Math.max(1, prev - 1))}
                  className="bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-200 h-10 w-11 rounded-xl font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <div className="bg-slate-950 border border-slate-800 h-10 px-5 rounded-xl font-mono font-bold text-white flex items-center justify-center text-base min-w-[50px]">
                  {glassQty}
                </div>
                <button
                  type="button"
                  onClick={() => setGlassQty((prev) => prev + 1)}
                  className="bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-200 h-10 w-11 rounded-xl font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Calculations Results Block - exact style match */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">M² por vidrio</span>
              <h4 className="text-2xl font-black text-[#ff9f43] font-mono mt-1">
                {calcGlassArea().toFixed(2)} m²
              </h4>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850 text-center">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">kg por vidrio</span>
              <h4 className="text-2xl font-black text-[#ff9f43] font-mono mt-1">
                {calcSingleGlassWeight().toFixed(2)} kg
              </h4>
            </div>

            <div className="sm:col-span-2 bg-[#2d1e15] border border-[#52331f] p-4 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between items-center text-amber-200">
                <span className="font-bold">Área total:</span>
                <span className="font-mono text-base font-black">{(calcGlassArea() * glassQty).toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between items-center text-amber-200 pt-1 border-t border-[#52331f]/50">
                <span className="font-bold">Peso cargado total ({glassQty} hjs):</span>
                <span className="font-mono text-lg font-black text-[#ff9f43]">{calcTotalGlassWeight().toFixed(2)} Kg</span>
              </div>

              <div className="bg-slate-950/40 p-2 rounded-lg text-[10px] font-mono text-[#a89993] leading-normal pt-2 mt-2">
                <strong>Desglose del cálculo:</strong><br />
                {glassBase / 100}m × {glassHeight / 100}m × {glassThickness}mm × 2.5 factor × {glassQty} pzs = <strong>{calcTotalGlassWeight().toFixed(2)} kg</strong>
              </div>
            </div>
          </div>

          <button
            onClick={clearGlassCalculator}
            className="w-full py-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-2xl text-slate-400 hover:text-white transition font-bold text-xs uppercase font-mono"
          >
            Limpiar Campos
          </button>

        </div>
      )}

      {/* VIEW S7: ALU-CALCULADORA DE DESCUENTOS Y MEDIDAS (Tal como en el Vídeo) */}
      {subScreen === "alucalculadora" && (
        <div className="space-y-6 animate-fade-in" id="alucalculadora-view">
          
          {/* Header wrapper matching the back navbar */}
          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSubScreen("menu")}
                className="bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 p-2.5 rounded-xl transition"
                title="Volver"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-base font-bold text-white font-sans uppercase">Calculadora de Descuentos AluDev</h2>
                <p className="text-slate-400 text-xs">Corte de taller, tramos de 6m y cálculo de cristal basándose en el vídeo de cancelería</p>
              </div>
            </div>
            
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start sm:self-center">
              <button
                onClick={() => {
                  setAluSeries("corrediza_3");
                  setAluJambaPrice(180);
                  setAluRielPrice(150);
                  setAluCercoPrice(135);
                  setAluTraslapePrice(135);
                  setAluZocloPrice(140);
                }}
                className={`text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg transition ${
                  aluSeries === "corrediza_3"
                    ? "bg-[#0284c7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Serie 3″ L3 (Vídeo)
              </button>
              <button
                onClick={() => {
                  setAluSeries("corrediza_2");
                  setAluJambaPrice(140);
                  setAluRielPrice(132);
                  setAluCercoPrice(120);
                  setAluTraslapePrice(120);
                  setAluZocloPrice(115);
                }}
                className={`text-[10px] uppercase font-mono font-bold px-3 py-1.5 rounded-lg transition ${
                  aluSeries === "corrediza_2"
                    ? "bg-[#0284c7] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Serie 2″ Nac (Económica)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: SMARTPHONE LAYOUT PLAYGROUND (SMARTPHONE FRAME ON DESKTOP) */}
            <div className="lg:col-span-7 xl:col-span-6 flex justify-center w-full">
              
              {/* Virtual Smartphone container matching exactly the device frame from video */}
              <div className="w-full max-w-[420px] bg-slate-950 border-4 border-slate-800 rounded-[3rem] p-4 p-y-5 shadow-2xl relative ring-1 ring-slate-850/50">
                
                {/* Smartphone Dynamic Island pill at the top */}
                <div className="absolute top-2 w-28 h-5 bg-black rounded-full left-1/2 -translate-x-1/2 z-20 flex justify-center items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950/20 mr-1.5 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900/40"></span>
                </div>

                {/* Smartphone Screen container */}
                <div className="bg-[#0b0f19] rounded-[2.2rem] p-4 pt-6 space-y-4 shadow-inner text-slate-300 min-h-[690px] flex flex-col justify-between">
                  
                  {/* Internal navbar header */}
                  <div className="text-center pb-2 border-b border-sky-950/40">
                    <span className="text-[9px] uppercase font-mono font-semibold tracking-widest text-sky-500">ALU-CALCULADORA</span>
                    <h3 className="font-black text-sm uppercase text-slate-100 tracking-tight">CORREDIZA - GENERADOR DE FÓRMULAS</h3>
                  </div>

                  {/* Dual Tab Switch matching vide's top tab */}
                  <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-xl border border-slate-850/60">
                    <button
                      onClick={() => setAluActiveTab("descuentos")}
                      className={`py-2 rounded-lg text-[11px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                        aluActiveTab === "descuentos"
                          ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Scissors size={12} />
                      Descuentos
                    </button>
                    <button
                      onClick={() => setAluActiveTab("cotizacion")}
                      className={`py-2 rounded-lg text-[11px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                        aluActiveTab === "cotizacion"
                          ? "bg-[#10b981] text-white shadow-md shadow-emerald-500/10"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Coins size={12} />
                      Cotización
                    </button>
                  </div>

                  {/* Input measures segment - identical to video */}
                  <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 space-y-3.5">
                    <span className="block text-[9px] font-bold uppercase text-slate-400 tracking-wider font-mono text-center">INGRESE MEDIDAS EN CM</span>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="block text-[8px] font-black uppercase text-slate-500 font-mono text-center mb-1">ANCHO</span>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={aluWidth}
                            onChange={(e) => setAluWidth(Number(e.target.value) || 0)}
                            className="w-full bg-[#18233c] hover:bg-[#1f2d4d] border border-sky-900 focus:border-sky-500 text-white rounded-xl py-2 px-2 text-center font-mono font-bold text-sm focus:ring-1 focus:ring-sky-500 transition"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono sm:hidden">cm</span>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[8px] font-black uppercase text-[#cbd5e1] font-mono text-center mb-1">ALTO</span>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={aluHeight}
                            onChange={(e) => setAluHeight(Number(e.target.value) || 0)}
                            className="w-full bg-[#18233c] hover:bg-[#1f2d4d] border border-sky-900 focus:border-sky-500 text-white rounded-xl py-2 px-2 text-center font-mono font-black text-sm focus:ring-1 focus:ring-sky-500 transition"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-slate-500 font-mono sm:hidden">cm</span>
                        </div>
                      </div>
                    </div>

                    {/* Numeric sliding helper to support touch devices */}
                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div className="flex justify-between items-center bg-[#070b13] px-2 py-1 rounded border border-slate-900">
                        <button type="button" onClick={() => setAluWidth(prev => Math.max(10, prev - 1))} className="text-slate-400 font-bold px-1.5 py-0.5 hover:text-white">-</button>
                        <span className="text-[10px] font-mono font-bold text-sky-400">{aluWidth} cm</span>
                        <button type="button" onClick={() => setAluWidth(prev => prev + 1)} className="text-slate-400 font-bold px-1.5 py-0.5 hover:text-white">+</button>
                      </div>
                      <div className="flex justify-between items-center bg-[#070b13] px-2 py-1 rounded border border-slate-900">
                        <button type="button" onClick={() => setAluHeight(prev => Math.max(10, prev - 1))} className="text-slate-400 font-bold px-1.5 py-0.5 hover:text-white">-</button>
                        <span className="text-[10px] font-mono font-bold text-sky-400">{aluHeight} cm</span>
                        <button type="button" onClick={() => setAluHeight(prev => prev + 1)} className="text-slate-400 font-bold px-1.5 py-0.5 hover:text-white">+</button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE TAB PANEL VIEWPORTS */}
                  <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3 custom-scrollbar">
                    
                    {/* VIEWPORT 1: LISTA DESCUENTOS - MATCHES VIDEO SCREEN */}
                    {aluActiveTab === "descuentos" && (
                      <div className="space-y-2.5 animate-fade-in">
                        <div className="flex justify-between items-center border-b border-sky-950/20 pb-1.5">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#fbbf24] font-bold">LISTA DE DESCUENTOS</span>
                          <span className="text-[9px] font-mono text-slate-500 bg-[#070b13] px-1.5 py-0.5 rounded border border-slate-900">
                            {aluSeries === "corrediza_3" ? "3 pulgadas L3" : "2 pulgadas Nac"}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {aluSeries === "corrediza_3" ? (
                            <>
                              {/* Jamba 1 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">JAMBA_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Cabezal Superior (Ancho)</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">1 pz {cutJamba1.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaJamba1}</span>
                                </div>
                              </div>

                              {/* Jamba 2 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">JAMBA_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Jambas Laterales</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutJamba2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaJamba2}</span>
                                </div>
                              </div>

                              {/* Riel L3 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">RIEL_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans font-medium">Riel Horizontal Superior/Inferior</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutRiel.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaRiel}</span>
                                </div>
                              </div>

                              {/* Cerco L3 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">CERCO_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Cercos Hojas</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutCerco.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaCerco}</span>
                                </div>
                              </div>

                              {/* Traslape L3 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">TRASLAPE_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Traslapes Centrales</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutTraslape.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaTraslape}</span>
                                </div>
                              </div>

                              {/* Zoclo 1V */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">ZOCLO 1V_L3</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Zoclos Horizontales</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">4 pz {cutZoclo.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaZoclo}</span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Jamba Serie 2 */}
                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">JAMBA_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Chambrana Horizontal</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">1 pz {aluWidth} cm</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">JAMBA_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Jambas Laterales</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutJamba2_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaJamba2_s2}</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">RIEL_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Riel Inferior</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">1 pz {cutRiel_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaRiel_s2}</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">CABEZAL_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Cabezal Superior Horizontal</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">1 pz {cutCabezal_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaCabezal_s2}</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">CERCO_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Cerco Hojas</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutCerco_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaCerco_s2}</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">TRASLAPE_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Traslape Central</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">2 pz {cutTraslape_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaTraslape_s2}</span>
                                </div>
                              </div>

                              <div className="bg-[#111726]/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center font-mono hover:bg-[#151e33] transition">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-bold text-slate-400">ZOCLO_L2</span>
                                  <span className="block text-[8px] text-slate-500 font-sans">Zoclo de Hoja</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-black text-white bg-slate-900 px-2 py-1 rounded border border-slate-805">4 pz {cutZoclo_s2.toFixed(1)} cm</span>
                                  <span className="block text-[8px] text-slate-500 mt-1">fórmula: {formulaZoclo_s2}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* VIEWPORT 2: PRECIOS Y COTIZACIÓN - MATCH DEL VÍDEO AL 0:21 */}
                    {aluActiveTab === "cotizacion" && (
                      <div className="space-y-3.5 animate-fade-in text-[11px]">
                        
                        <div className="flex justify-between items-center border-b border-sky-950/20 pb-1.5">
                          <span className="text-[9px] uppercase font-mono tracking-widest text-[#10b981] font-bold">MATERIALES DE FABRICACIÓN</span>
                          <span className="text-[9px] font-mono text-slate-500">Tramas 6 Metros</span>
                        </div>

                        {/* Vidrios Details with manual overrides */}
                        <div className="bg-[#0c1220] border border-sky-950/40 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#38bdf8] uppercase tracking-wide text-[10px]">VIDRIOS:</span>
                            <span className="text-[9px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-900">
                              Área Facturar: {billingArea} m²
                            </span>
                          </div>
                          <div className="bg-[#060b13] p-2.5 rounded-lg flex justify-between items-center hover:border-slate-805 transition border border-transparent">
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block text-[10px]">Vidrio Claro 6mm</span>
                              <span className="text-[8px] text-slate-500 block">Medida: 2 pzs × {glassW.toFixed(1)} × {glassH.toFixed(1)} cm (waste 14%)</span>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 justify-end">
                                <span className="text-slate-450">$</span>
                                <input
                                  type="number"
                                  value={aluGlassPrice}
                                  onChange={(e) => setAluGlassPrice(Number(e.target.value) || 0)}
                                  className="w-12 bg-slate-900 border border-slate-800 text-white font-mono font-bold text-center rounded py-0.5 px-0.5 focus:ring-1 focus:ring-emerald-550 focus:outline-none"
                                />
                                <span className="text-slate-500">/m²</span>
                              </div>
                              <span className="text-xs font-bold text-emerald-400 mt-1 block">${glassCostCalculated.toLocaleString("es-MX")}</span>
                            </div>
                          </div>
                        </div>

                        {/* Costo Bruto Perfiles tramas 6m */}
                        <div className="bg-[#0c1220] border border-sky-950/40 rounded-xl p-3 space-y-2">
                          <span className="font-bold text-slate-300 block uppercase tracking-wide text-[10px] mb-1">COSTO BRUTO (TRAMOS 6M):</span>
                          
                          <div className="space-y-1 text-[10px] font-mono">
                            {/* Row 1: Jamba */}
                            <div className="flex justify-between items-center p-1.5 hover:bg-slate-900/30 rounded border border-transparent hover:border-slate-805">
                              <span className="text-slate-400">JAMBA {totJamba.toFixed(0)}cm</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#070b13] text-slate-400 font-bold px-1 py-0.5 rounded">{barsJamba} trm de 6m</span>
                                <div className="flex items-center">
                                  <span className="text-slate-500 mr-0.5">$</span>
                                  <input
                                    type="number"
                                    value={aluJambaPrice}
                                    onChange={(e) => setAluJambaPrice(Number(e.target.value) || 0)}
                                    className="w-9 bg-slate-950 border border-slate-800 text-white font-bold text-center rounded focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                                <span className="font-bold text-white min-w-[35px] text-right">${totJambaCost}</span>
                              </div>
                            </div>

                            {/* Row 2: Riel */}
                            <div className="flex justify-between items-center p-1.5 hover:bg-slate-900/30 rounded border border-transparent hover:border-slate-805">
                              <span className="text-slate-400">RIEL {totRiel.toFixed(0)}cm</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#070b13] text-slate-400 font-bold px-1 py-0.5 rounded">{barsRiel} trm de 6m</span>
                                <div className="flex items-center flex-row">
                                  <span className="text-slate-500 mr-0.5">$</span>
                                  <input
                                    type="number"
                                    value={aluRielPrice}
                                    onChange={(e) => setAluRielPrice(Number(e.target.value) || 0)}
                                    className="w-9 bg-slate-950 border border-slate-800 text-white font-bold text-center rounded focus:ring-1 focus:ring-emerald-550"
                                  />
                                </div>
                                <span className="font-bold text-white min-w-[35px] text-right">${totRielCost}</span>
                              </div>
                            </div>

                            {/* Row 3: Cerco */}
                            <div className="flex justify-between items-center p-1.5 hover:bg-slate-900/30 rounded border border-transparent hover:border-slate-805">
                              <span className="text-slate-400">CERCO {totCerco.toFixed(0)}cm</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#070b13] text-slate-400 font-bold px-1 py-0.5 rounded">{barsCerco} trm de 6m</span>
                                <div className="flex items-center flex-row">
                                  <span className="text-slate-500 mr-0.5">$</span>
                                  <input
                                    type="number"
                                    value={aluCercoPrice}
                                    onChange={(e) => setAluCercoPrice(Number(e.target.value) || 0)}
                                    className="w-9 bg-slate-950 border border-slate-800 text-white font-bold text-center rounded focus:ring-1 focus:ring-emerald-550"
                                  />
                                </div>
                                <span className="font-bold text-white min-w-[35px] text-right">${totCercoCost}</span>
                              </div>
                            </div>

                            {/* Row 4: Traslape */}
                            <div className="flex justify-between items-center p-1.5 hover:bg-slate-900/30 rounded border border-transparent hover:border-slate-805">
                              <span className="text-slate-400">TRASLAPE {totTraslape.toFixed(0)}cm</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#070b13] text-slate-400 font-bold px-1 py-0.5 rounded">{barsTraslape} trm de 6m</span>
                                <div className="flex items-center">
                                  <span className="text-slate-500 mr-0.5">$</span>
                                  <input
                                    type="number"
                                    value={aluTraslapePrice}
                                    onChange={(e) => setAluTraslapePrice(Number(e.target.value) || 0)}
                                    className="w-9 bg-slate-950 border border-slate-800 text-white font-bold text-center rounded focus:ring-1 focus:ring-emerald-550"
                                  />
                                </div>
                                <span className="font-bold text-white min-w-[35px] text-right">${totTraslapeCost}</span>
                              </div>
                            </div>

                            {/* Row 5: Zoclo */}
                            <div className="flex justify-between items-center p-1.5 hover:bg-slate-900/30 rounded border border-transparent hover:border-slate-850">
                              <span className="text-slate-400">ZOCLO_1V {totZoclo.toFixed(0)}cm</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-[#070b13] text-slate-400 font-bold px-1 py-0.5 rounded">{barsZoclo} trm de 6m</span>
                                <div className="flex items-center flex-row">
                                  <span className="text-slate-500 mr-0.5">$</span>
                                  <input
                                    type="number"
                                    value={aluZocloPrice}
                                    onChange={(e) => setAluZocloPrice(Number(e.target.value) || 0)}
                                    className="w-9 bg-slate-950 border border-slate-800 text-white font-bold text-center rounded focus:ring-1 focus:ring-emerald-550"
                                  />
                                </div>
                                <span className="font-bold text-white min-w-[35px] text-right">${totZocloCost}</span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs font-bold text-sky-400 font-mono">
                            <span>Suma Perfiles:</span>
                            <span>${totalPerfilesCost.toLocaleString()} MXN</span>
                          </div>
                        </div>

                        {/* Accessories and Labor */}
                        <div className="bg-[#0c1220] border border-[#2e2e33]/30 rounded-xl p-3 space-y-2">
                          <span className="font-bold text-slate-300 block uppercase tracking-wide text-[10px]">ADICIONALES DE COTIZACIÓN</span>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#070b13] p-2 rounded border border-slate-900">
                              <span className="block text-[8px] text-slate-500 uppercase font-mono">Costos Herrajes:</span>
                              <div className="flex items-center mt-1">
                                <span className="text-slate-400 mr-0.5">$</span>
                                <input
                                  type="number"
                                  value={aluAccessoryPrice}
                                  onChange={(e) => setAluAccessoryPrice(Number(e.target.value) || 0)}
                                  className="w-full bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs rounded p-0.5"
                                />
                              </div>
                            </div>

                            <div className="bg-[#070b13] p-2 rounded border border-slate-900">
                              <span className="block text-[8px] text-slate-500 uppercase font-mono">Costo Mano Obra:</span>
                              <div className="flex items-center mt-1">
                                <span className="text-slate-400 mr-0.5">$</span>
                                <input
                                  type="number"
                                  value={aluLaborPrice}
                                  onChange={(e) => setAluLaborPrice(Number(e.target.value) || 0)}
                                  className="w-full bg-slate-900 border border-slate-800 text-white font-mono font-bold text-xs rounded p-0.5"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* BOTTOM SMARTPHONE ACTIONS */}
                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    
                    {/* Glowing Total Box matching video screen absolute totals */}
                    <div className="bg-sky-950/40 border border-[#1e3a8a]/30 rounded-2xl p-2.5 text-center">
                      <span className="text-[7px] font-black uppercase text-sky-400 tracking-widest block mb-0.5 font-mono">MONTO TOTAL ESTIMADO (FRACCIÓN)</span>
                      <strong className="text-lg font-mono text-emerald-400 tracking-tight font-black">
                        ${grandTotalAluCalculadora.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setAluWidth(159);
                          setAluHeight(147);
                          if (aluActiveTab === "cotizacion") {
                            setAluGlassPrice(750);
                            setAluJambaPrice(180);
                            setAluRielPrice(150);
                            setAluCercoPrice(135);
                            setAluTraslapePrice(135);
                            setAluZocloPrice(140);
                            setAluAccessoryPrice(327.90);
                            setAluLaborPrice(420.19);
                          }
                        }}
                        className="py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/40 hover:border-red-700/60 text-red-100 rounded-xl font-bold uppercase text-[10px] tracking-wider transition"
                      >
                        REINICIAR
                      </button>
                      <button
                        onClick={copyCutsReport}
                        className="py-2.5 bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-600 text-slate-100 rounded-xl font-bold uppercase text-[10px] tracking-wider transition flex items-center justify-center gap-1.5"
                      >
                        <Printer size={12} />
                        COMPARTIR
                      </button>
                    </div>

                    <button
                      onClick={handleEmpezarTrabajar}
                      className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-xl font-black uppercase text-xs tracking-wider transition shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2"
                    >
                      <Wrench size={12} className="animate-spin-slow" />
                      EMPEZAR A TRABAJAR (OPTIMIZAR)
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* COLUMN 2: WORKSHOP DOCUMENTATION AND LIVE FORMULA EDITING ACCORDION */}
            <div className="lg:col-span-5 xl:col-span-6 space-y-5">
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping"></span>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">Fórmulas en Tiempo Real ("Modo Taller")</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para darte <strong>completa libertad de taller</strong> (tal como se destaca en el vídeo), hemos expuesto el generador de fórmulas directo. Puedes re-escribir las ecuaciones matemáticas utilizando las constantes <code className="text-sky-300 font-mono">W</code> (Ancho total) y <code className="text-sky-300 font-mono">H</code> (Alto total). Toda modificación se calcula de inmediato.
                </p>

                {aluSeries === "corrediza_3" ? (
                  <div className="space-y-3 pt-2 text-xs">
                    {/* formula jamba 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">JAMBA_L3 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: W (1 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaJamba1}
                          onChange={(e) => setFormulaJamba1(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaJamba1, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula jamba 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">JAMBA_L3 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 2.7 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaJamba2}
                          onChange={(e) => setFormulaJamba2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaJamba2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula riel */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">RIEL_L3 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: W (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaRiel}
                          onChange={(e) => setFormulaRiel(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaRiel, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula cerco */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">CERCO_L3 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 3.7 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaCerco}
                          onChange={(e) => setFormulaCerco(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaCerco, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula traslape */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">TRASLAPE_L3 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 3.7 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaTraslape}
                          onChange={(e) => setFormulaTraslape(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaTraslape, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula zoclo */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">ZOCLO 1V_L3 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: (W - 18) / 2 (4 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaZoclo}
                          onChange={(e) => setFormulaZoclo(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaZoclo, aluWidth, aluHeight)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 text-xs">
                    {/* formula jamba 2 s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">JAMBA_L2 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 2.5 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaJamba2_s2}
                          onChange={(e) => setFormulaJamba2_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaJamba2_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula riel s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">RIEL_L2 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: W (1 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaRiel_s2}
                          onChange={(e) => setFormulaRiel_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaRiel_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula cabezal s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">CABEZAL_L2 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: W (1 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaCabezal_s2}
                          onChange={(e) => setFormulaCabezal_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaCabezal_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula cerco s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">CERCO_L2 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 3.5 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaCerco_s2}
                          onChange={(e) => setFormulaCerco_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaCerco_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula traslape s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">TRASLAPE_L2 (Corte Vertical):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: H - 3.5 (2 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaTraslape_s2}
                          onChange={(e) => setFormulaTraslape_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaTraslape_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>

                    {/* formula zoclo s2 */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2 p-3 bg-slate-950/50 rounded-xl border border-slate-850">
                      <div className="md:col-span-5">
                        <strong className="block text-slate-300 text-[11px]">ZOCLO_L2 (Corte Horizontal):</strong>
                        <span className="text-[10px] text-slate-500 italic">Predef: (W - 14) / 2 (4 pz)</span>
                      </div>
                      <div className="md:col-span-7 flex gap-1 items-center">
                        <input
                          type="text"
                          value={formulaZoclo_s2}
                          onChange={(e) => setFormulaZoclo_s2(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-sky-400 px-3 py-1.5 font-mono text-center rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                        />
                        <span className="text-[10px] text-[#fbbf24] font-mono">={evalFormula(formulaZoclo_s2, aluWidth, aluHeight)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Guide Card helper */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-sans">Guía de Colaboradores AluDev</h4>
                <div className="text-xs text-slate-400 space-y-3">
                  <p>
                    Esta calculadora emula el flujo de trabajo del vídeo para maximizar la velocidad y precisión de tu cuadrilla:
                  </p>
                  <ul className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Ingresa las medidas tomadas en campo utilizando los deslizadores o los botones directos.</li>
                    <li>Sigue las medidas bajo la pestaña <strong>Descuentos</strong> para preparar el corte físico en la ingletadora de disco.</li>
                    <li>Valida que el inventario tenga el color correspondiente para optimizar las barras de de aluminio comerciales de 6.10 metros.</li>
                    <li>Pulsa el botón de <strong>Compartir</strong> para generar un reporte del folio de cortes y enviarlo directo al WhatsApp de tu ayudante de taller de manera instantánea. No requiere lápiz ni papel.</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW S2: COTIZACIÓN RÁPIDA (LIGHTNING CALCULATOR) */}
      {subScreen === "rapida" && (
        <div className="bg-[#171410] border border-[#2d241d] text-slate-200 p-6 rounded-3xl space-y-5 shadow-2xl animate-fade-in" id="quick-cotizacion-estimator">
          
          <div className="flex items-center gap-3 pb-3 border-b border-[#2d241d]">
            <div className="bg-[#facc15]/10 text-[#facc15] p-2.5 rounded-xl border border-[#facc15]/10">
              <Zap size={20} className="fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans uppercase">Cotizador Estimado en Segundos</h2>
              <p className="text-slate-400 text-xs">Costo rápido preliminar basado en color y dimensiones</p>
            </div>
          </div>

          <div className="bg-[#facc15]/10 border border-[#facc15]/20 text-yellow-100 p-3.5 rounded-2xl flex items-start gap-2 text-xs">
            <Info size={16} className="text-[#facc15] mt-0.5 shrink-0" />
            <p>Este estimador aproxima el valor comercial sumando perfiles, herraje básico y el m² de vidrio correspondiente.</p>
          </div>

          {/* Form grid selectors */}
          <div className="space-y-4">
            
            {/* 1. Producto */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Producto:</span>
              <div className="flex flex-wrap gap-2">
                {["Ventana Corrediza", "Cancel Corredizo", "Cancel de Baño"].map((prod) => {
                  const isSel = qrProduct === prod;
                  return (
                    <button
                      key={prod}
                      onClick={() => setQrProduct(prod)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${
                        isSel ? "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/40" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {prod}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Linea */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Línea de Perfiles:</span>
              <div className="flex flex-wrap gap-2">
                {["Línea Nacional", "Serie 4600", "Serie 1400"].map((l) => {
                  const isSel = qrLine === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setQrLine(l)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${
                        isSel ? "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/40" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Pulgadas */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Pulgadas:</span>
              <div className="flex gap-2">
                {["2″", "3″"].map((pulg) => {
                  const isSel = qrInches === pulg;
                  return (
                    <button
                      key={pulg}
                      onClick={() => setQrInches(pulg)}
                      className={`w-14 text-center text-xs font-bold py-1.5 rounded-xl border transition ${
                        isSel ? "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/40" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {pulg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Hojas */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Número de Hojas:</span>
              <div className="flex flex-wrap gap-2">
                {["2 hojas", "3 hojas", "4 hojas"].map((h) => {
                  const isSel = qrLeaves === h;
                  return (
                    <button
                      key={h}
                      onClick={() => setQrLeaves(h)}
                      className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${
                        isSel ? "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/40" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Dimensions box */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Ancho (cm):</label>
                <input
                  type="number"
                  value={qrWidth}
                  onChange={(e) => setQrWidth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 font-mono font-bold text-center text-base"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Alto (cm):</label>
                <input
                  type="number"
                  value={qrHeight}
                  onChange={(e) => setQrHeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 text-white rounded-xl py-2 px-3 font-mono font-bold text-center text-base"
                />
              </div>
            </div>

            {/* 6. Vidrio */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Vidrio:</span>
              <div className="flex flex-wrap gap-2">
                {["Claro", "Filtrasol", "Tintex"].map((g) => {
                  const isSel = qrGlass === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setQrGlass(g)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                        isSel ? "bg-[#facc15]/20 text-[#facc15] border-[#facc15]/40" : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-850"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Color de Aluminio swatches */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono font-sans">Color de Aluminio:</span>
              <div className="flex flex-wrap gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                {[
                  { name: "White", query: "Blanco", hex: "#ffffff" },
                  { name: "Natural", query: "Natural", hex: "#94a3b8" },
                  { name: "Negro Mate", query: "Negro Mate", hex: "#1e293b" },
                  { name: "Negro Brillante", query: "Negro Brillante", hex: "#020617" },
                  { name: "Champagne", query: "Champagne", hex: "#d97706" },
                  { name: "Nogal", query: "Nogal", hex: "#7c2d12" },
                  { name: "Pino", query: "Pino", hex: "#b45309" }
                ].map((col) => {
                  const isSel = qrColor === col.query;
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setQrColor(col.query)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition cursor-pointer hover:scale-115 ${
                        isSel ? "border-yellow-400 scale-110 shadow-lg" : "border-slate-800"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.query}
                    >
                      {isSel && <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Golden Quick Result Card */}
          <div className="bg-[#2a2212] border border-[#4d3d1a] p-5 rounded-2xl flex flex-col justify-between items-center text-center mt-5">
            <span className="text-[10px] font-mono text-yellow-300 font-extrabold uppercase tracking-widest leading-3">Precio Estimado Rápido</span>
            <h4 className="text-3.5xl font-black text-yellow-400 tracking-tight font-mono mt-1">
              ${quickEstimateTotal.toLocaleString("es-MX")} <span className="text-xs font-normal">MXN</span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
              Incluye perfiles, cristal `{qrGlass}`, herrajes y +/- desperdicios con utilidad al 45%.
            </p>

            <button
              onClick={saveQuickEstimateToQuote}
              className="mt-4 w-full py-3 bg-[#facc15] hover:bg-[#eab308] text-[#1e1e1f] font-extrabold tracking-wider text-xs rounded-xl uppercase transition font-sans shadow-md"
            >
              Confirmar y Agregar a Venta
            </button>
          </div>

        </div>
      )}

      {/* VIEW S3: PRESUPUESTO PERSONALIZADO VIEW */}
      {subScreen === "personalizado" && (
        <div className="bg-[#151319] border border-[#2b2434] text-slate-200 p-6 rounded-3xl space-y-5 shadow-2xl animate-fade-in" id="custom-budget-man-editor">
          
          <div className="flex items-center gap-3 pb-3 border-b border-[#2b2434]">
            <div className="bg-[#c084fc]/10 text-[#c084fc] p-2.5 rounded-xl border border-[#c084fc]/10">
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans uppercase">Presupuesto Manual Personalizado</h2>
              <p className="text-slate-400 text-xs">Crea notas libres del taller sin fórmulas obligatorias</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Phase 1: Client Information */}
            <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850/80 space-y-3">
              <span className="block text-[10px] font-bold text-[#c084fc] uppercase tracking-wider font-mono">Datos del Cliente (Opcional):</span>
              
              <div>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Nombre de la obra / proyecto"
                  value={clientProject}
                  onChange={(e) => setClientProject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Dirección completa"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-white"
                />
              </div>
            </div>

            {/* Phase 2: Dynamic row elements editor */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Conceptos a Presupuestar:</span>
                <button
                  type="button"
                  onClick={addCustomConceptRow}
                  className="text-[10px] bg-[#c084fc]/15 hover:bg-[#c084fc]/25 text-[#d8b4fe] border border-[#a855f7]/30 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition"
                >
                  <Plus size={12} />
                  Agregar Concepto
                </button>
              </div>

              <div className="space-y-3.5" id="manual-concept-rows-grid">
                {customConcepts.map((item, index) => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl relative space-y-2">
                    
                    <button
                      type="button"
                      onClick={() => removeCustomConceptRow(item.id)}
                      className="absolute top-2 right-2 text-rose-500 hover:text-rose-400 p-1"
                      title="Eliminar fila"
                    >
                      <Trash2 size={13} />
                    </button>

                    <span className="text-[10px] font-bold font-mono text-slate-500">CONCEPTO {index + 1}</span>

                    <div>
                      <input
                        type="text"
                        placeholder="Descripción amplia (ej: Cancel de baño vidrio templado 9mm satinado)"
                        value={item.description}
                        onChange={(e) => handleConceptChange(item.id, "description", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl py-2 px-3 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase font-mono">Cant</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={item.qty}
                          onChange={(e) => handleConceptChange(item.id, "qty", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl py-1.5 px-3 font-mono text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] text-slate-500 font-bold uppercase font-mono">P. Unitario ($):</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChange={(e) => handleConceptChange(item.id, "unitPrice", Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-850 text-xs text-white rounded-xl py-1.5 px-3 font-mono text-center"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Advance deposit controls matches video */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Anticipo de Obra (Contrato):</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDepositType("percent")}
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded transition ${
                      depositType === "percent" ? "bg-[#c084fc] text-white" : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    Porcentaje %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositType("fixed")}
                    className={`text-[9px] font-black uppercase px-2.5 py-1 rounded transition ${
                      depositType === "fixed" ? "bg-[#c084fc] text-white" : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    Monto Fijo $
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="number"
                  value={depositValue}
                  onChange={(e) => setDepositValue(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3.5 font-bold font-mono text-sm focus:outline-none"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Se muestra en el PDF de Contrato: Total, Anticipo solicitado y Saldo restante</span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-slate-850">
                <span className="text-xs font-bold">Desglosar IVA (+16%):</span>
                <button
                  type="button"
                  onClick={() => setManualIva(!manualIva)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    manualIva ? "bg-[#c084fc]" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      manualIva ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Balance card */}
          <div className="bg-[#211a2a] border border-[#48375e] p-5 rounded-2xl space-y-2 mt-5">
            <div className="flex justify-between text-xs text-purple-200 font-mono">
              <span>Subtotal neto:</span>
              <span className="font-bold">${calcManualSubtotal().toLocaleString("es-MX")}</span>
            </div>
            {manualIva && (
              <div className="flex justify-between text-xs text-purple-200 font-mono">
                <span>Impuesto IVA (16%):</span>
                <span className="font-bold">+${(calcManualSubtotal() * 0.16).toLocaleString("es-MX")}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm text-purple-100 font-mono font-extrabold pt-2 border-t border-[#48375e]/40">
              <span>Importe Neto Total:</span>
              <span className="text-xl text-purple-300 font-black">${calcManualTotal().toLocaleString("es-MX")} MXN</span>
            </div>

            <div className="bg-slate-950/50 p-2.5 rounded-xl text-[10px] font-mono text-[#a599b1] space-y-1">
              <div className="flex justify-between">
                <span>Anticipo ({depositType === "percent" ? `${depositValue}%` : `$${depositValue}`}):</span>
                <strong className="text-purple-300">${calcManualDeposit().toLocaleString("es-MX")}</strong>
              </div>
              <div className="flex justify-between">
                <span>Saldo por liquidar:</span>
                <strong className="text-rose-400">${calcManualPending().toLocaleString("es-MX")}</strong>
              </div>
            </div>

            <button
              onClick={saveManualBudgetToRoster}
              className="mt-4 w-full py-3 bg-[#c084fc] hover:bg-[#a855f7] text-slate-950 font-extrabold text-xs tracking-wider rounded-xl uppercase transition font-sans shadow-md"
            >
              Guardar Presupuesto & Generar Contrato (PDF)
            </button>
          </div>

        </div>
      )}

      {/* VIEW S4: NUEVA COTIZACIÓN (GUIDED STEP WIZARD) */}
      {subScreen === "nueva" && (
        <div className="bg-[#1c1d1f] border border-[#35383e] text-slate-200 p-6 rounded-3xl space-y-5 shadow-2xl animate-fade-in" id="nueva-cotizacion-guided">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#fb923c]/10 text-[#fb923c] p-2 rounded-lg border border-[#fb923c]/10">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-sans uppercase">Asistente de Cotización</h2>
                <p className="text-slate-400 text-[10px]">Paso {guideStep} de 3</p>
              </div>
            </div>

            {/* Stepper bubbles */}
            <div className="flex gap-1.5">
              {[1, 2, 3].map((st) => (
                <div
                  key={st}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    guideStep === st ? "bg-[#fb923c]" : guideStep > st ? "bg-amber-600/50" : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: CLIENT DATA */}
          {guideStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-slate-400 text-xs leading-normal">
                Comencemos introduciendo el cliente para estructurar el catálogo y vincular la cotización al folio. Puedes omitirlo y dejarlo libre si gustas.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Nombre del Cliente (Opcional):</label>
                <input
                  type="text"
                  placeholder="Nombre de contacto del cliente"
                  value={wizardClient}
                  onChange={(e) => setWizardClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 px-3 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Teléfono:</label>
                  <input
                    type="text"
                    placeholder="Contacto telefónico"
                    value={wizardPhone}
                    onChange={(e) => setWizardPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Nombre Obra:</label>
                  <input
                    type="text"
                    placeholder="Proyecto"
                    value={wizardProject}
                    onChange={(e) => setWizardProject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Dirección de Obra:</label>
                <input
                  type="text"
                  placeholder="Calle, Colonia, Ciudad"
                  value={wizardAddress}
                  onChange={(e) => setWizardAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Notas:</label>
                <textarea
                  placeholder="Anotaciones extras o condiciones particulares..."
                  value={wizardNotes}
                  onChange={(e) => setWizardNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs h-16 resize-none animate-fade-in"
                />
              </div>

              <button
                type="button"
                onClick={() => setGuideStep(2)}
                className="w-full mt-4 py-3 bg-[#fb923c] hover:bg-amber-600 text-black font-extrabold tracking-wider text-xs rounded-xl uppercase transition"
              >
                Siguiente Paso: Escoger Línea & Producto
              </button>
            </div>
          )}

          {/* STEP 2: CHOOSE SERIES & SUBTYPE */}
          {guideStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Línea de Perfil Integrada:</span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWizardLine("nacional")}
                  className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition ${
                    wizardLine === "nacional"
                      ? "bg-amber-500/10 border-[#fb923c] text-amber-100 font-bold"
                      : "bg-slate-950 border-[#2d2f33] text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">Línea Nacional</span>
                  <span className="text-[9px] text-slate-500 font-mono">Perfiles 2″ y 3″ estándar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWizardLine("espanola")}
                  className={`p-4 border rounded-2xl text-center flex flex-col items-center justify-center gap-1.5 transition ${
                    wizardLine === "espanola"
                      ? "bg-amber-500/10 border-[#fb923c] text-amber-100 font-bold"
                      : "bg-slate-950 border-[#2d2f33] text-slate-400 hover:bg-slate-850"
                  }`}
                >
                  <span className="text-xs uppercase tracking-wider">Línea Española</span>
                  <span className="text-[9px] text-slate-500 font-mono">Series Europeas 4600/1400</span>
                </button>
              </div>

              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tipo de Cancelería:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { tag: "ventanas", name: "Ventana Corrediza" },
                  { tag: "doors", name: "Puerta Abatible" },
                  { tag: "canceles", name: "Batiente Cancel Baño" },
                  { tag: "fijos", name: "Fijo de Vidrio Directo" }
                ].map((item) => {
                  const isSel = wizardCategory === item.tag;
                  return (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => {
                        setWizardCategory(item.tag);
                        setWizardSubtype(item.name);
                      }}
                      className={`py-3 px-2 border text-xxs font-bold uppercase rounded-xl transition ${
                        isSel ? "bg-[#fb923c]/20 text-[#fb923c] border-[#fb923c]/50" : "bg-slate-950 text-slate-400 border-[#2d2f33]"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Subtipo Específico:</label>
                <select
                  value={wizardSubtype}
                  onChange={(e) => setWizardSubtype(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                >
                  {wizardLine === "nacional" ? (
                    <>
                      <option value="Ventana Corrediza 2″">Ventana Corrediza de 2 Pulgadas (Standard)</option>
                      <option value="Ventana Corrediza 3″">Ventana Corrediza de 3 Pulgadas (Panorámica)</option>
                      <option value="Cancel de Baño Corredizo 2″">Cancel de Baño de 2 Pulgadas</option>
                      <option value="Puerta Abatible Ligera 3″">Puerta Abatible de Aluminio 3″</option>
                      <option value="Fijo de Glaseado Directo">Fijo Directo con Junquillo 2″</option>
                    </>
                  ) : (
                    <>
                      <option value="Serie Española 4600 Corredizo">Serie 4600 Corredizo de Alto Desempeño</option>
                      <option value="Serie Española 1400 Abatible">Serie 1400 Puerta Abatible Elegante</option>
                      <option value="Eurovent Premium Cancelería">Eurovent Premium con Junta Perimetral</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGuideStep(1)}
                  className="w-1/3 py-3 bg-slate-950 hover:bg-slate-850 rounded-xl text-slate-400 text-xs font-bold uppercase transition"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setGuideStep(3)}
                  className="flex-1 py-3 bg-[#fb923c] hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl uppercase transition"
                >
                  Siguiente: Medidas & Acabado
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MEASUREMENTS & DESIGN DETAILS */}
          {guideStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <span className="block text-[10px] font-bold text-[#fb923c] uppercase tracking-wider font-mono">Visualización Física de Pieza (Plano Semicad):</span>
              
              {/* Inline layout window preview */}
              <DynamicWindowPreview
                category={wizardCategory === "doors" ? "puertas" : wizardCategory === "fijos" ? "fijos" : wizardCategory === "canceles" ? "canceles" : "ventanas"}
                width={wizardWidth}
                height={wizardHeight}
                color={wizardColor}
                glassType={wizardGlass}
              />

              {/* Dimensions input */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Ancho (cm):</label>
                  <input
                    type="number"
                    value={wizardWidth}
                    onChange={(e) => setWizardWidth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-center text-sm font-bold font-mono"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Min: 30cm</span>
                    <span>Max: 300cm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Alto (cm):</label>
                  <input
                    type="number"
                    value={wizardHeight}
                    onChange={(e) => setWizardHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-center text-sm font-bold font-mono"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>Min: 30cm</span>
                    <span>Max: 300cm</span>
                  </div>
                </div>
              </div>

              {/* Color & Glass choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Color de Aluminio:</label>
                  <select
                    value={wizardColor}
                    onChange={(e) => setWizardColor(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  >
                    <option value="Blanco (Pintado)">Blanco (Pintado)</option>
                    <option value="Anodizado Natural">Natural Anodizado</option>
                    <option value="Negro">Negro Mate</option>
                    <option value="Bronce Colonial">Bronce Colonial</option>
                    <option value="Champagne">Champagne</option>
                    <option value="Cerezo (Madera)">Textura Cerezo Madera</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-mono">Tipo de Cristal:</label>
                  <select
                    value={wizardGlass}
                    onChange={(e) => setWizardGlass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 text-xs"
                  >
                    <option value="Vidrio Claro 6mm">Vidrio Claro 6mm</option>
                    <option value="Vidrio Filtrasol 6mm">Filtrasol Tintado 6mm</option>
                    <option value="Vidrio Templado de Seguridad 10mm">Templado Seguridad 10mm</option>
                    <option value="Vidrio Tintex 6mm">Vidrio Esmerilado Tintex 6mm</option>
                  </select>
                </div>
              </div>

              {/* Instant Guided Calculation Block */}
              <div className="bg-[#241e15] border border-[#523d21] p-4 rounded-2xl flex justify-between items-center text-amber-200 mt-4">
                <div>
                  <span className="text-[9px] font-mono uppercase text-slate-400">Total Sugerido por Unidad</span>
                  <h4 className="text-2xl font-black text-[#fb923c] font-mono mt-0.5">
                    ${guidedEstimatePrice.toLocaleString("es-MX")} <span className="text-xs font-normal">MXN</span>
                  </h4>
                </div>
                <div className="text-right text-[10px] font-mono text-[#a89993] leading-normal uppercase">
                  <span>Ensamble: Integrado</span><br />
                  <span>Vidrio: {wizardGlass.split(" ")[1]}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGuideStep(2)}
                  className="w-1/3 py-3 bg-slate-950 hover:bg-slate-850 rounded-xl text-slate-400 text-xs font-bold uppercase transition"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={submitWizardToQuotes}
                  className="flex-1 py-3 bg-[#fb923c] hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl uppercase transition tracking-wider shadow-lg animate-pulse"
                >
                  Registrar e Ir a Facturas
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* VIEW S5: HISTORIAL VIEW */}
      {subScreen === "historial" && (
        <div className="bg-slate-900 border border-slate-800 text-slate-200 p-6 rounded-3xl space-y-5 shadow-2xl animate-fade-in" id="workshop-quote-history-view">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl border border-amber-500/10">
                <History size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-sans uppercase">Carro de Cotizaciones & Historial</h2>
                <p className="text-slate-400 text-xs">Administra tus notas temporales y órdenes de corte</p>
              </div>
            </div>
            {state.quotes.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("¿Estás seguro de que quieres limpiar todo el carro actual de cotizaciones?")) {
                    clearQuotes();
                  }
                }}
                className="text-xxs font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
              >
                <Trash2 size={11} />
                Vaciar Venta
              </button>
            )}
          </div>

          <div className="space-y-4" id="quotes-roster-list">
            
            {state.quotes.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                  <History size={32} className="opacity-40" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 text-sm">No hay cotizaciones guardadas en este momento</h4>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-sm mx-auto">
                    Presiona `Nueva Cotización` o `Cotización Rápida` para agregar elementos listos para ser ingresados al PDF.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {state.quotes.map((q) => (
                    <div key={q.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850/80 hover:border-slate-800/80 transition relative space-y-2">
                      <button
                        type="button"
                        onClick={() => deleteQuoteItem(q.id)}
                        className="absolute top-3.5 right-3.5 text-rose-500 hover:text-rose-400 p-1 bg-slate-900 border border-slate-800 rounded-lg hover:scale-105 transition"
                        title="Eliminar elemento"
                      >
                        <Trash2 size={13} />
                      </button>

                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded font-bold font-mono tracking-wider text-slate-400">
                        {q.line}
                      </span>

                      <h4 className="text-xs font-bold leading-normal text-white max-w-[85%]">{q.label}</h4>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-mono">
                        {q.width > 0 && (
                          <span>Medidas: <strong>{q.width}×{q.height}cm</strong></span>
                        )}
                        <span>Color: <strong className="text-slate-400">{q.color}</strong></span>
                        <span>Vidrio: <strong className="text-slate-400">{q.glassType}</strong></span>
                        {q.qty > 1 && (
                          <span>Cant: <strong className="text-[#ff9f43]">{q.qty} pzas</strong></span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-850/50 flex justify-between items-baseline">
                        <span className="text-[10px] text-slate-500 uppercase font-mono">Neto Unitario: ${Math.round(q.totalPrice / q.qty).toLocaleString("es-MX")}</span>
                        <span className="text-sm font-black text-[#ff9f43] font-mono">Monto Total: ${Math.round(q.totalPrice).toLocaleString("es-MX")} MXN</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summarized metrics matches video */}
                <div className="bg-[#241e15] border border-[#523d21] p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-slate-400">
                    <span>Partidas cotizadas:</span>
                    <span className="font-bold text-white">{state.quotes.length} Conceptos</span>
                  </div>
                  
                  <div className="flex justify-between font-mono text-slate-400 pt-1.5 border-t border-[#523d21]/30">
                    <span>Monto consolidado neto:</span>
                    <strong className="text-lg text-yellow-500 font-extrabold font-mono hover:underline">
                      ${Math.round(state.quotes.reduce((acc, current) => acc + current.totalPrice, 0)).toLocaleString("es-MX")} MXN
                    </strong>
                  </div>

                  <div className="flex justify-between items-center pt-3 mt-4 border-t border-[#523d21]/60">
                    <button
                      onClick={() => setTab("remisiones")}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-300 font-bold font-mono text-xxs uppercase rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Printer size={13} />
                      Remisiones / PDF
                    </button>
                    
                    <button
                      onClick={() => {
                        const confirmAdd = window.confirm("¿Deseas enviar todo este carro consolidado como una nueva nota de remisión formal al archivo de cobros?");
                        if (confirmAdd) {
                          const valTotalQuote = state.quotes.reduce((acc, c) => acc + c.totalPrice, 0);
                          addInvoice({
                            id: "inv_" + Date.now(),
                            clientName: "Cliente Carro " + new Date().toLocaleDateString("es-MX"),
                            phone: "",
                            address: "",
                            projectName: "Consolidado de Carro",
                            items: state.quotes.map((q) => ({
                              description: q.label,
                              qty: q.qty,
                              unitPrice: q.totalPrice / q.qty,
                              total: q.totalPrice
                            })),
                            subtotal: valTotalQuote,
                            tax: 0,
                            total: valTotalQuote,
                            advancePayment: valTotalQuote * 0.7,
                            pendingBalance: valTotalQuote * 0.3,
                            date: new Date().toLocaleDateString("es-MX"),
                            notes: "Generado a partir del consolidado del historial rápido."
                          });
                          alert("¡Remisión de venta registrada! Se ha transferido a Notas de Remisiones.");
                          setTab("remisiones");
                        }
                      }}
                      className="px-4 py-2.5 bg-[#ff9f43] hover:bg-amber-600 text-slate-950 font-extrabold tracking-wide text-xxs uppercase rounded-xl transition"
                    >
                      Facturar Todo Consolidado
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>

        </div>
      )}

      {/* VIEW S6: CONFIGURATION EDIT ACCORDION LIST matches video */}
      {subScreen === "config" && (
        <div className="bg-[#18181b] border border-[#2e2e33] text-slate-300 p-6 rounded-3xl space-y-4 shadow-2xl animate-fade-in" id="workshop-tabuladores-configurator">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="bg-zinc-700/10 text-zinc-300 p-2.5 rounded-xl border border-zinc-700/10">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-sans uppercase">Tabuladores del Taller</h2>
                <p className="text-slate-400 text-xs">Administrador de costos base de herrajes, cristales y marcas</p>
              </div>
            </div>
            <button
              onClick={resetToDefault}
              className="text-[10px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/35 px-2.5 py-1.5 rounded-lg font-bold transition font-mono uppercase"
            >
              Restablecer Fábrica
            </button>
          </div>

          <div className="space-y-2.5" id="tabulators-collapsable-accordions">
            
            {/* Accordion 1: Percentages (Utilidades y merma) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "utilidades" ? null : "utilidades")}
                className="w-full flex justify-between items-center py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-amber-500">
                  <Coins size={14} />
                  1. Porcentajes de Utilidad
                </span>
                {activeAccordion === "utilidades" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "utilidades" && (
                <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-3.5 text-xs">
                  <span className="block text-[10px] text-[#ff9f43] leading-normal font-mono uppercase">Preferencia de ganancia:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Ganancia recomendada (%):</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-850 py-1.5 px-3 rounded text-white text-xs font-mono font-bold"
                        defaultValue={45}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Ganancia mínima (%):</label>
                      <input
                        type="number"
                        className="w-full bg-slate-950 border border-slate-850 py-1.5 px-3 rounded text-white text-xs font-mono font-bold"
                        defaultValue={30}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Fórmula inteligente aplicada: <strong className="font-mono bg-slate-950 px-1 py-0.5 rounded">Costo / (1 - Porcentaje/100)</strong> para un cálculo preciso del margen útil.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Perfiles de Aluminio inline pricing list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "perfiles" ? null : "perfiles")}
                className="w-full flex justify-between items-center py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-zinc-300 animate-fade-in">
                  <Layers size={14} />
                  2. Perfiles de Aluminio (Marca Cuprum/Nac)
                </span>
                {activeAccordion === "perfiles" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "perfiles" && (
                <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-3 font-mono">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2">Precios base por metro lineal ($/m):</span>
                  <div className="space-y-2 text-xs">
                    {state.profiles.map((prof) => (
                      <div key={prof.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850/60">
                        <span className="text-slate-200 font-sans tracking-wide">{prof.name} ({prof.line})</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">$/m:</span>
                          <input
                            type="number"
                            value={prof.pricePerMeter}
                            onChange={(e) => updateProfile(prof.id, { pricePerMeter: Number(e.target.value) })}
                            className="w-20 bg-slate-900 border border-slate-800 py-1 px-2 rounded font-bold text-white text-right text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Glass Price Tabulator matches video list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "glasses" ? null : "glasses")}
                className="w-full flex justify-between items-center py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-sky-400">
                  <Scale size={14} />
                  3. Precios de Vidrio (Vidrio Plano)
                </span>
                {activeAccordion === "glasses" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "glasses" && (
                <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-3 font-mono">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-2">Precios base por metro cuadrado ($/m²):</span>
                  <div className="space-y-2 text-xs">
                    {state.glasses.map((glass) => (
                      <div key={glass.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850/60">
                        <span className="text-slate-200 font-sans tracking-wide">Vidrio Espesor {glass.thickness}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">$/m²:</span>
                          <input
                            type="number"
                            value={glass.pricePerM2}
                            onChange={(e) => updateGlass(glass.id, { pricePerM2: Number(e.target.value) })}
                            className="w-20 bg-slate-900 border border-slate-800 py-1 px-2 rounded font-bold text-white text-right text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Aluminum colors additonal rates matches video list */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "colors" ? null : "colors")}
                className="w-full flex justify-between items-center py-[#e] py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-violet-400">
                  <Paintbrush size={14} />
                  4. Colores de Aluminio (+ cost/m)
                </span>
                {activeAccordion === "colors" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "colors" && (
                <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-2 font-mono text-xs">
                  {[
                    { name: "Blanco", extra: 0 },
                    { name: "Natural Anodizado", extra: 0 },
                    { name: "Duro E", extra: 25 },
                    { name: "Negro Brillante", extra: 30 },
                    { name: "Champagne", extra: 20 },
                    { name: "Nogal (Madera)", extra: 35 },
                    { name: "Cerezo", extra: 35 }
                  ].map((colorItem) => (
                    <div key={colorItem.name} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850/60">
                      <span className="text-slate-200 font-sans tracking-wide">{colorItem.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">+$:</span>
                        <input
                          type="number"
                          defaultValue={colorItem.extra}
                          className="w-16 bg-slate-900 border border-slate-850 py-1 px-2 rounded font-bold text-white text-right text-xs"
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-500 pt-1 leading-normal uppercase">Recargo adicional aplicado por cada metro lineal fabricado.</p>
                </div>
              )}
            </div>

            {/* Accordion 5: Extra inputs (Mosquiteros and Duelas) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "extras" ? null : "extras")}
                className="w-full flex justify-between items-center py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-rose-400">
                  <Sliders size={14} />
                  5. mosquitero & Duela Doble Vista
                </span>
                {activeAccordion === "extras" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "extras" && (
                <div className="p-4 bg-slate-900 border-t border-[#2d2f33] space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-300">Mosquitero estándar:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">$/m²:</span>
                      <input
                        type="number"
                        defaultValue={250}
                        className="w-20 bg-slate-900 border border-slate-800 py-1 px-2 rounded font-bold text-white text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-slate-300">Duela Doble Vista (tira 6.10m):</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">$/tira:</span>
                      <input
                        type="number"
                        defaultValue={350}
                        className="w-20 bg-slate-900 border border-slate-800 py-1 px-2 rounded font-bold text-white text-right"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 6: Logo & enterprise settings PDF matches video */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveAccordion(activeAccordion === "branding" ? null : "branding")}
                className="w-full flex justify-between items-center py-3.5 px-4 bg-slate-950/80 text-left font-bold text-xs uppercase"
              >
                <span className="flex items-center gap-2 text-indigo-400 font-sans">
                  <Image size={14} />
                  6. Logo y Datos Corporativos (PDF)
                </span>
                {activeAccordion === "branding" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {activeAccordion === "branding" && (
                <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Nombre Comercial de la Empresa:</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-850 py-2 px-3 rounded text-white text-xs"
                      value={state.businessDetails.name}
                      onChange={(e) => updateBusinessDetails({ name: e.target.value })}
                    />
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1.5">Logotipo de la Nota de Venta:</span>
                    <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-850 transition cursor-pointer flex flex-col items-center justify-center gap-2">
                      <Image size={24} className="text-slate-600 animate-pulse" />
                      <span className="font-bold">Subir Logotipo Corporativo</span>
                      <span className="text-[9px] text-[#ff9f43] font-mono leading-none">Formatos recomendados: JPG o PNG cuadrados de 300px</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-slate-850/60 p-4 rounded-xl text-center bg-slate-950/30 text-xs">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Responsable Técnico del Software:</span>
            <strong className="text-white uppercase text-xs mt-1 block">AluDev Inc México</strong>
          </div>

        </div>
      )}

    </div>
  );
};
