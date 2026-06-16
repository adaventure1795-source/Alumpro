/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { QuoteItem, FormulaRule } from "../types";
import { evaluateEquation } from "../utils/cutOptimizer";
import { jsPDF } from "jspdf";
import {
  Plus,
  Trash2,
  Cpu,
  Scissors,
  FileText,
  Calculator,
  Layers,
  Sparkles,
  Grid,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckSquare,
  Square,
  ShoppingBag,
  Hammer,
  Printer,
  TrendingDown,
  Coins,
  Edit2,
  Check,
  X,
  Download
} from "lucide-react";
import { COLORS } from "../data/defaultData";
import { DynamicWindowPreview } from "./DynamicWindowPreview";

export const Cotizador: React.FC<{ setTab: (tab: string) => void; setCutsToOptimize?: (cuts: any) => void }> = ({
  setTab,
  setCutsToOptimize
}) => {
  const {
    state,
    addQuoteItem,
    updateQuoteItem,
    deleteQuoteItem,
    clearQuotes,
    addInvoice
  } = useWorkshop();

  // Selected formula template
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(
    state.formulas[0]?.id || ""
  );
  
  // Custom state modes for manual vs. calculated pricing
  const [isCalculatedMode, setIsCalculatedMode] = useState<boolean>(true);
  const [customPrice, setCustomPrice] = useState<number>(1500);
  
  // Costing & markup controls
  const [profitMargin, setProfitMargin] = useState<number>(30); // 30% default profit margin markup
  const [includeIva, setIncludeIva] = useState<boolean>(false); // 16% IVA toggle
  const [wastePercentage, setWastePercentage] = useState<number>(10); // 10% default waste/merma cost addition

  // Custom single item settings
  const [label, setLabel] = useState<string>("");
  const [width, setWidth] = useState<number>(120);
  const [height, setHeight] = useState<number>(100);
  const [line, setLine] = useState<string>("Nacional 2″");
  const [color, setColor] = useState<string>("Anodizado Natural");
  const [selectedGlassId, setSelectedGlassId] = useState<string>(
    state.glasses[0]?.id || ""
  );
  const [qty, setQty] = useState<number>(1);
  const [laborMinutes, setLaborMinutes] = useState<number>(120);
  
  // Quote item text-editor states:
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");

  // PDF download configurations:
  const [clientNameForPdf, setClientNameForPdf] = useState<string>("");
  const [notesForPdf, setNotesForPdf] = useState<string>("Precios expuestos en Moneda Nacional (MXN). 60% de anticipo para iniciar fabricación y 40% contra entrega e instalación.");
  const [simplifyPdf, setSimplifyPdf] = useState<boolean>(true);

  // Workshop integration states
  const [basketTab, setBasketTab] = useState<"venta" | "taller">("venta");
  const [completedCuts, setCompletedCuts] = useState<{[key: string]: boolean}>(() => {
    try {
      const saved = localStorage.getItem("aludev_completed_cuts");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save marked off cuts to local storage when changed
  useEffect(() => {
    localStorage.setItem("aludev_completed_cuts", JSON.stringify(completedCuts));
  }, [completedCuts]);

  const toggleCutCompleted = (stableId: string) => {
    setCompletedCuts(prev => ({
      ...prev,
      [stableId]: !prev[stableId]
    }));
  };

  // Default label updater and category enforcement when template changes
  const activeFormula = state.formulas.find((f) => f.id === selectedFormulaId);
  const activeCategory = activeFormula?.category || "ventanas";

  const selectedCategoryLabel = 
    activeCategory === "ventanas" ? "🪟 Ventanas" :
    activeCategory === "puertas" ? "🚪 Puertas" :
    activeCategory === "canceles" ? "🚿 Canceles de Baño" :
    activeCategory === "portones" ? "🚗 Portones y Garajes" :
    activeCategory === "fijos" ? "🖼️ Fijos Perimetrales" :
    "Estructura";

  useEffect(() => {
    const formula = state.formulas.find((f) => f.id === selectedFormulaId);
    if (formula) {
      setLabel(`Pieza: ${formula.name}`);
      // Load default variables if exists
      const wVar = formula.variables.find((v) => v.name.toLowerCase() === "ancho");
      const hVar = formula.variables.find((v) => v.name.toLowerCase() === "alto");
      if (wVar) setWidth(wVar.defaultValue);
      if (hVar) setHeight(hVar.defaultValue);

      // Auto aluminum line enforcement helper:
      const cat = formula.category;
      if (cat === "puertas" && line === "Nacional 2″") {
        setLine("Nacional 3″");
      } else if (cat === "portones") {
        setLine("Portones");
      } else if (cat === "ventanas" && line === "Portones") {
        setLine("Nacional 2″");
      }

      // Auto glass/filler material enforcement on design load:
      if (cat === "canceles") {
        if (!["glass-policarbonato", "glass-panel-al", "glass-plastico", "glass-6t", "glass-esmerilado", "glass-filtrasol-plus", "glass-reflecta", "glass-reflecta-verde", "glass-reflecta-azul", "glass-none"].includes(selectedGlassId)) {
          setSelectedGlassId("glass-none");
        }
      } else if (cat === "portones") {
        if (!["glass-none", "glass-panel-al"].includes(selectedGlassId)) {
          setSelectedGlassId("glass-none");
        }
      } else {
        if (["glass-policarbonato", "glass-plastico"].includes(selectedGlassId)) {
          setSelectedGlassId("glass-none");
        }
      }
    }
  }, [selectedFormulaId, state.formulas]);

  // Configuration Validation Issues helper
  const getValidationIssues = () => {
    const issues: { type: "error" | "warning"; message: string }[] = [];
    if (!isCalculatedMode) return issues;
    
    if (!activeFormula) return issues;
    const cat = activeFormula.category;

    // Line check - Doors/Portones cannot use Nacional 2"
    if ((cat === "puertas" || cat === "portones") && line === "Nacional 2″") {
      issues.push({
        type: "error",
        message: "Por normatividad estructural, no se permite cotizar Puertas o Portones con la línea de 2″. Elija una perfilería reforzada de 3″, Serie 50 o superior."
      });
    }

    // Windows with Portones line warning
    if (cat === "ventanas" && line === "Portones") {
      issues.push({
        type: "warning",
        message: "Línea excedida: El perfil de Portón de 4″ es excesivamente pesado y costoso para ventanas residenciales comunes. Se sugiere usar Nacional 2″ o 3″."
      });
    }

    // Glass / Relleno checks:
    const glass = state.glasses.find((g) => g.id === selectedGlassId);
    if (glass) {
      const isBathMaterial = ["glass-policarbonato", "glass-panel-al", "glass-plastico"].includes(glass.id);

      if (cat === "ventanas" && isBathMaterial && glass.id !== "glass-panel-al") {
        issues.push({
          type: "error",
          message: `El material "${glass.thickness}" es de uso para canceles de baño y no es admisible para ventanas residenciales estándar.`
        });
      }

      if (cat === "canceles" && glass.id === "glass-3s") {
        issues.push({
          type: "warning",
          message: "Vidrio inseguro: El cristal sencillo de 3mm no cumple con la norma ante impactos para zonas húmedas de baños. Se aconseja Policarbonato o Plástico Acrílico."
        });
      }

      if (cat === "portones" && glass.id !== "glass-none" && glass.id !== "glass-panel-al") {
        issues.push({
          type: "error",
          message: "Los Portones Seccionales/Batientes no admiten vidrios comunes por el peligro en su movimiento. Use 'Panel de Aluminio (Alucobond)' o configure 'Sin cristal'."
        });
      }
    }

    // Dimensions check
    if (cat === "puertas") {
      if (height < 185) {
        issues.push({
          type: "warning",
          message: `El alto de ${height}cm es inusual para una puerta de paso (rango recomendado: 185 - 240cm).`
        });
      }
      if (width > 165) {
        issues.push({
          type: "warning",
          message: `Ancho de hoja excedido (${width}cm). Para claros amplios se aconseja estructurar doble hoja por fatiga del marco.`
        });
      }
    }

    if (cat === "ventanas" && height > 220) {
      issues.push({
        type: "warning",
        message: `La altura de la ventana (${height}cm) requiere fijos adicionales o divisiones debido al empuje lateral de viento.`
      });
    }

    return issues;
  };

  const validationIssues = getValidationIssues();
  const hasValidationError = validationIssues.some(issue => issue.type === "error");

  // Real-time calculation state for the single item active preview
  const [previewResult, setPreviewResult] = useState<any>(null);

  // Perform calculation of active inputs
  useEffect(() => {
    if (!isCalculatedMode) {
      setPreviewResult({
        profiles: [],
        glasses: [],
        accessories: [],
        subtotalProfiles: 0,
        subtotalGlasses: 0,
        subtotalAccessories: 0,
        subtotalHardware: 0,
        laborMinutes: 0,
        laborCost: 0,
        total: customPrice * qty
      });
      return;
    }

    const formulaRule = state.formulas.find((f) => f.id === selectedFormulaId);
    const glass = state.glasses.find((g) => g.id === selectedGlassId);

    if (!formulaRule || !glass) return;

    const variables = {
      Ancho: width,
      Alto: height,
      Cantidad: qty
    };

    // Calculate profiles cuts
    let subtotalProfiles = 0;
    const computedProfiles = formulaRule.profileEquations.map((eq) => {
      // Find matching profile in inventory for line and template ref
      // Default to any profile corresponding to line, or base price
      let matchingProfile = state.profiles.find(
        (p) => p.line === line && p.id === eq.profileId
      );
      if (!matchingProfile) {
        // fallback to same line or Spanish line, etc.
        matchingProfile = state.profiles.find((p) => p.line === line) || state.profiles[0];
      }

      const cutSizeCm = evaluateEquation(eq.formula, variables);
      const totalMetersPerPiece = (cutSizeCm / 100) * eq.quantity;
      const totalMeters = totalMetersPerPiece * qty;
      const priceMeter = matchingProfile ? matchingProfile.pricePerMeter : 45;
      const cost = totalMeters * priceMeter;
      subtotalProfiles += cost;

      return {
        name: matchingProfile?.name || `Perfil ${line}`,
        label: eq.name,
        meters: totalMeters,
        cost,
        cuts: [
          {
            sizeCm: Number(cutSizeCm.toFixed(1)),
            qty: eq.quantity * qty,
            angle: eq.angle
          }
        ]
      };
    });

    // Calculate glass
    const glassWidthCm = evaluateEquation(formulaRule.glassEquation.formulaWidth, variables);
    const glassHeightCm = evaluateEquation(formulaRule.glassEquation.formulaHeight, variables);
    const areaM2PerPiece = (glassWidthCm / 100) * (glassHeightCm / 100) * formulaRule.glassEquation.quantity;
    const totalAreaM2 = areaM2PerPiece * qty;
    const glassCost = totalAreaM2 * glass.pricePerM2;

    const computedGlasses = [
      {
        thickness: glass.thickness,
        areaM2: Number(totalAreaM2.toFixed(3)),
        cost: glassCost,
        widthCm: Number(glassWidthCm.toFixed(1)),
        heightCm: Number(glassHeightCm.toFixed(1)),
        qty: formulaRule.glassEquation.quantity * qty
      }
    ];

    // Calculate accessories
    let subtotalAccessories = 0;
    const computedAccessories = formulaRule.accessoryEquations.map((eq) => {
      const matchAcc = state.accessories.find((a) => a.id === eq.accessoryId) || state.accessories[0];
      
      // We can evaluate formulas like "4" or "2 * Vidrios" => replace Variables
      const contextVars = { ...variables, Vidrios: formulaRule.glassEquation.quantity * qty };
      const rawQty = evaluateEquation(eq.quantityFormula, contextVars);
      const accessoryQty = Math.ceil(rawQty);

      const itemCost = matchAcc ? matchAcc.pricePerUnit : 10;
      const cost = accessoryQty * itemCost;
      subtotalAccessories += cost;

      return {
        name: matchAcc?.name || "Herraje / Accesorio",
        qty: accessoryQty,
        cost
      };
    });

    // Labor cost calculation
    const laborHourRate = state.businessDetails.laborRatePerHour;
    const laborCost = (laborMinutes / 60) * laborHourRate * qty;

    // Apply waste/merma percentage on raw profiles
    const subtotalProfilesWithWaste = subtotalProfiles * (1 + wastePercentage / 100);
    
    // Base cost is aluminum (with waste) + glass + accessories + labor
    const baseCost = subtotalProfilesWithWaste + glassCost + subtotalAccessories + laborCost;
    
    // Add profit/utility margin markup
    const priceWithMargin = baseCost * (1 + profitMargin / 100);
    
    // Add IVA taxes if enabled
    const finalTotal = includeIva ? priceWithMargin * 1.16 : priceWithMargin;

    setPreviewResult({
      profiles: computedProfiles,
      glasses: computedGlasses,
      accessories: computedAccessories,
      subtotalProfiles: subtotalProfilesWithWaste,
      subtotalGlasses: glassCost,
      subtotalAccessories,
      laborMinutes: laborMinutes * qty,
      laborCost,
      baseCost,
      profitMarginPercent: profitMargin,
      wastePercent: wastePercentage,
      includeIva,
      total: finalTotal
    });

  }, [
    selectedFormulaId,
    width,
    height,
    line,
    selectedGlassId,
    qty,
    laborMinutes,
    state.profiles,
    state.accessories,
    state.glasses,
    state.businessDetails.laborRatePerHour,
    isCalculatedMode,
    customPrice,
    profitMargin,
    includeIva,
    wastePercentage
  ]);

  // Handle adding computed configuration to quote list
  const handleAddToQuote = () => {
    if (!previewResult) return;

    const newItem: QuoteItem = {
      id: "quote-" + Date.now(),
      name: label || (isCalculatedMode ? "Cancel Desconocido" : "Concepto Libre"),
      formulaRuleId: isCalculatedMode ? selectedFormulaId : undefined,
      widthCm: isCalculatedMode ? width : 0,
      heightCm: isCalculatedMode ? height : 0,
      line: isCalculatedMode ? line : "Manual",
      color: isCalculatedMode ? color : "Manual",
      glassId: isCalculatedMode ? selectedGlassId : "",
      quantity: qty,
      calculated: previewResult
    };

    addQuoteItem(newItem);
    // Reset inputs
    setLabel("");
    setQty(1);
    if (!isCalculatedMode) {
      setCustomPrice(1500);
    }
    alert("¡Concepto agregado al proyecto actual!");
  };

  // Cart calculations
  const totalProjectPrice = state.quotes.reduce((sum, q) => sum + q.calculated.total, 0);
  const totalLaborPrice = state.quotes.reduce((sum, q) => sum + q.calculated.laborCost, 0);
  const totalProfilesPrice = state.quotes.reduce((sum, q) => sum + q.calculated.subtotalProfiles, 0);
  const totalAccessoriesPrice = state.quotes.reduce((sum, q) => sum + q.calculated.subtotalAccessories, 0);
  const totalGlassesPrice = state.quotes.reduce((sum, q) => sum + q.calculated.subtotalGlasses, 0);

  // Consolidated material lists for fabrication and purchase plan
  const aggregatedProfiles: { [key: string]: { name: string; line: string; color: string; meters: number; cost: number; barCount: number } } = {};
  const aggregatedGlasses: { [key: string]: { thickness: string; areaM2: number; cost: number; count: number } } = {};
  const aggregatedAccessories: { [key: string]: { name: string; qty: number; cost: number } } = {};
  const despieceCuts: any[] = [];

  state.quotes.forEach((q) => {
    // Compile profiles sum
    q.calculated.profiles.forEach((p) => {
      const key = `${p.name}-${q.line}-${q.color}`;
      if (!aggregatedProfiles[key]) {
        aggregatedProfiles[key] = {
          name: p.name,
          line: q.line,
          color: q.color,
          meters: 0,
          cost: 0,
          barCount: 0
        };
      }
      aggregatedProfiles[key].meters += p.meters * q.quantity;
      aggregatedProfiles[key].cost += p.cost * q.quantity;
      
      // Compile cuts for the workshops
      p.cuts.forEach((c, cutIdx) => {
        // Create duplicate flat items based on item product quantity
        for (let i = 0; i < q.quantity; i++) {
          const stableId = `${q.id}-${p.label}-${c.sizeCm}-${cutIdx}-${i}`;
          despieceCuts.push({
            stableId,
            quoteName: q.name,
            profileName: `${p.name} [${q.line}]`,
            label: p.label,
            sizeCm: c.sizeCm,
            angle: c.angle,
            color: q.color,
            line: q.line
          });
        }
      });
    });

    // Compile glasses sum
    q.calculated.glasses.forEach((g) => {
      const key = g.thickness;
      if (!aggregatedGlasses[key]) {
        aggregatedGlasses[key] = {
          thickness: g.thickness,
          areaM2: 0,
          cost: 0,
          count: 0
        };
      }
      aggregatedGlasses[key].areaM2 += g.areaM2 * q.quantity;
      aggregatedGlasses[key].cost += g.cost * q.quantity;
      aggregatedGlasses[key].count += g.qty * q.quantity;
    });

    // Compile accessories sum
    q.calculated.accessories.forEach((a) => {
      const key = a.name;
      if (!aggregatedAccessories[key]) {
        aggregatedAccessories[key] = {
          name: a.name,
          qty: 0,
          cost: 0
        };
      }
      aggregatedAccessories[key].qty += a.qty * q.quantity;
      aggregatedAccessories[key].cost += a.cost * q.quantity;
    });
  });

  // Calculate commercial bars of 610cm (6.1m) required corresponding to aggregated meters
  Object.keys(aggregatedProfiles).forEach((key) => {
    aggregatedProfiles[key].barCount = Math.ceil(aggregatedProfiles[key].meters / 6.1);
  });

  const totalCutsCount = despieceCuts.length;
  const completedCutsCount = despieceCuts.filter(c => completedCuts[c.stableId]).length;
  const progressPercent = totalCutsCount > 0 ? Math.round((completedCutsCount / totalCutsCount) * 100) : 0;

  // Print-friendly temporary popup layout for workers
  const handlePrintWorkshopPlan = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Ficha de Fabricacion y Despiece - ALUMASTER</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1e293b; }
            h1 { font-size: 24px; font-weight: 800; margin-bottom: 5px; text-transform: uppercase; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; color: #1e3a8a; }
            h2 { font-size: 13px; color: #64748b; margin-top: 5px; margin-bottom: 30px; font-family: monospace; letter-spacing: 0.5px; }
            h3 { font-size: 14px; text-transform: uppercase; font-weight: bold; margin-top: 35px; margin-bottom: 12px; border-left: 5px solid #3b82f6; padding-left: 10px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 11px; }
            th { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-weight: bold; text-transform: uppercase; color: #475569; }
            td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            .badge { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-family: monospace; }
            .angle { font-weight: bold; color: #0284c7; }
            .footer { margin-top: 50px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>ALUMASTER • HOJA DE PRODUCCUION Y DESPIECE</h1>
          <h2>PROYECTO: ${state.quotes.length} PIEZAS CONTRATADAS • FECHA: ${new Date().toLocaleDateString("es-MX")}</h2>
          
          <h3>1. RELACION DE COMPRA DE MATERIALES (ALMACEN)</h3>
          <table>
            <thead>
              <tr>
                <th>Perfil de Aluminio</th>
                <th>Línea & Color Solicitado</th>
                <th>Metraje de Ingeniería</th>
                <th>Barras Comerciales (6.1m a Comprar)</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(aggregatedProfiles).map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td>${p.line} • <span class="badge">${p.color}</span></td>
                  <td>${p.meters.toFixed(1)} m</td>
                  <td><strong>${p.barCount} barra(s)</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th>Lotes de Vidrio Solicitados</th>
                <th>Área Consolidada</th>
                <th>Piezas Requeridas</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(aggregatedGlasses).map(g => `
                <tr>
                  <td>Cristal Espesor <strong>${g.thickness}</strong></td>
                  <td>${g.areaM2.toFixed(3)} m²</td>
                  <td>${g.count} unidades de corte</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th>Herrajes, Cerraduras & Silicones</th>
                <th>Cantidad Total Consolidada</th>
              </tr>
            </thead>
            <tbody>
              ${Object.values(aggregatedAccessories).map(a => `
                <tr>
                  <td>${a.name}</td>
                  <td><strong>${a.qty} pzas</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>2. GUIA SECUENCIAL DE CORTES EN TALLER</h3>
          <table>
            <thead>
              <tr>
                <th>Secuencia</th>
                <th>Origen (Cancel)</th>
                <th>Perfil de Aluminio</th>
                <th>Línea y Color</th>
                <th>Medida de Corte (cm)</th>
                <th>Giro / Mitra</th>
                <th>Verificacion de Corte</th>
              </tr>
            </thead>
            <tbody>
              ${despieceCuts.map((c, i) => `
                <tr>
                  <td>#${i + 1}</td>
                  <td>${c.quoteName} - ${c.label}</td>
                  <td><strong>${c.profileName}</strong></td>
                  <td>${c.line} • ${c.color}</td>
                  <td style="font-size: 14px; font-weight: 800; color: #2563eb; font-family: monospace;">${c.sizeCm} cm</td>
                  <td class="angle">${c.angle.includes('45') ? '45° Mitra' : '90° Recto'}</td>
                  <td style="width: 100px; text-align: center; font-weight: bold; border: 2px solid #64748b; color: #64748b;">[  ] CORTADO</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Reporte Tecnico de Cortes generado digitalmente por Al Master Taller. Recuerde aplicar el descuento de perfileria segun fabricante antes de cortar material.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Group all cut requests from the active quotes cart and format for Optimizador
  const exportCutsToPackage = () => {
    if (state.quotes.length === 0) {
      alert("Agrega primero algunas piezas a tu cotización para exportar los cortes.");
      return;
    }

    const packageCuts: any[] = [];
    state.quotes.forEach((q) => {
      q.calculated.profiles.forEach((p) => {
        p.cuts.forEach((c) => {
          packageCuts.push({
            id: `cut-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `${q.name} - ${p.label}`,
            lengthCm: c.sizeCm,
            quantity: c.qty,
            angle: c.angle.includes("45") ? "45°" : "90°",
            profileName: `${p.name} [${q.line}]`
          });
        });
      });
    });

    if (setCutsToOptimize) {
      setCutsToOptimize(packageCuts);
      alert("¡Cortes extraídos con éxito! Te redirigimos al optimizador de perfiles.");
      setTab("optimizador");
    } else {
      alert("Corte exportado a caché. Por favor visita el Optimizador.");
    }
  };

  // Convert Quote list to invoice
  const exportToInvoice = () => {
    if (state.quotes.length === 0) {
      alert("El carro está vacío. Añade piezas al proyecto antes de generar la nota de remisión.");
      return;
    }

    const invoiceItems = state.quotes.map((q) => ({
      description: `${q.name} (${q.widthCm} x ${q.heightCm}cm) - Línea: ${q.line}, Color: ${q.color}, Vidrio: ${q.calculated.glasses[0]?.thickness}`,
      quantity: q.quantity,
      unitPrice: Math.round(q.calculated.total / q.quantity),
      total: Math.round(q.calculated.total)
    }));

    const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    const totalWithIva = Math.round(invoiceSubtotal * 1.16); // 16% IVA default, can be modified

    const newInvoice = {
      id: "inv-" + Date.now(),
      invoiceNumber: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: state.businessDetails.name,
      businessPhone: state.businessDetails.phone,
      businessAddress: state.businessDetails.address,
      businessRFC: state.businessDetails.rfc,
      clientName: "Cliente Nuevo Destinatario",
      clientPhone: "",
      clientAddress: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days due
      items: invoiceItems,
      subtotal: invoiceSubtotal,
      ivaPercent: 16,
      total: totalWithIva,
      advancePayment: Math.round(totalWithIva * 0.5), // 50% default advance
      pendingBalance: Math.round(totalWithIva * 0.5),
      notes: "El costo incluye instalación y garantía de 1 año contra filtraciones. No incluye reparaciones estructurales de albañilería.",
      status: "pendiente" as const
    };

    addInvoice(newInvoice);
    alert("¡Nota de remisión creada a partir del proyecto! Te redirigimos al generador.");
    setTab("remisiones");
  };

  // Generate and Download Client Quote PDF with jsPDF
  const handleDownloadPDF = () => {
    if (state.quotes.length === 0) {
      alert("El carro está vacío. Añade piezas al proyecto antes de descargar la cotización.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // A4 is 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // A4 is 297mm
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let y = margin;

    // Helper: Draw elegant divider
    const drawDivider = (currentY: number) => {
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      return currentY + 5;
    };

    // 1. BRAND HEADER
    doc.setFillColor(15, 23, 42); // slate-900 (Primary dark)
    doc.rect(0, 0, pageWidth, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(state.businessDetails.name || "TALLER DE ALUMINIO", margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225); // slate-300
    const bizAddress = state.businessDetails.address || "Dirección del Taller";
    const bizContact = `Tel: ${state.businessDetails.phone || "S/N"} | RFC: ${state.businessDetails.rfc || "S/RFC"}`;
    doc.text(bizAddress, margin, 27);
    doc.text(bizContact, margin, 32);

    // Document stamp right-aligned inside dark header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text("COTIZACIÓN", pageWidth - margin, 18, { align: "right" });
    
    doc.setFont("helvetica", "mono");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    const dateStr = new Date().toLocaleDateString("es-MX", { day: '2-digit', month: '2-digit', year: 'numeric' });
    const quoteCode = `COT-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.text(`Folio: ${quoteCode}`, pageWidth - margin, 26, { align: "right" });
    doc.text(`Fecha: ${dateStr}`, pageWidth - margin, 31, { align: "right" });

    y = 52; // Set y below dark header

    // 2. CLIENT SUB-PANEL
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, 24, "FD");

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("CLIENTE DESTINATARIO:", margin + 5, y + 6);
    
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(clientNameForPdf.trim() || "Público General / Cliente Particular", margin + 5, y + 13);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Atendido por: Equipo de Colaboradores de ${state.businessDetails.name.split("-")[0]}`, margin + 5, y + 19);

    y += 32;

    // 3. TABLE OF PRODUCTS / WORK ITEMS
    // Table Header Band
    doc.setFillColor(241, 245, 249); // slate-100 table row head
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600

    doc.text("PZ", margin + 2, y + 5.5);
    doc.text("DESCRIPCIÓN DEL CONCEPTO / TRABAJO CANCELERÍA", margin + 12, y + 5.5);
    doc.text("P. UNITARIO", margin + 128, y + 5.5, { align: "right" });
    doc.text("IMPORTE", margin + contentWidth - 2, y + 5.5, { align: "right" });

    y += 8;

    // Loop over quote items map
    state.quotes.forEach((q, index) => {
      // Check for page break if y is high
      if (y > 240) {
        doc.addPage();
        y = margin + 10;
        // Re-draw table header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text("PZ", margin + 2, y + 5.5);
        doc.text("DESCRIPCIÓN DEL CONCEPTO (Sigue...)", margin + 12, y + 5.5);
        doc.text("P. UNITARIO", margin + 128, y + 5.5, { align: "right" });
        doc.text("IMPORTE", margin + contentWidth - 2, y + 5.5, { align: "right" });
        y += 8;
      }

      // Generate description text
      let descString = "";
      if (q.customDescription) {
        descString = q.customDescription;
      } else if (simplifyPdf) {
        // Human friendly simplified representation
        const glassText = q.calculated.glasses[0]?.id === "glass-none" || !q.calculated.glasses[0]
          ? "sin incluir cristal"
          : `con cristal ${q.calculated.glasses[0]?.thickness.toLowerCase()}`;
        descString = `${q.name} de dimensiones ${q.widthCm} x ${q.heightCm} cm de alto. Estructurado en aluminio de línea ${q.line}, en color decorativo ${q.color}, ${glassText}. Fabricación con fijaciones herméticas, embalaje y garantía de taller.`;
      } else {
        // Detailed technical breakdown
        const glassText = q.calculated.glasses[0] ? q.calculated.glasses[0].thickness : "Sin vidrio";
        const profCount = q.calculated.profiles.length;
        const accCount = q.calculated.accessories.length;
        descString = `${q.name} (${q.widthCm}x${q.heightCm}cm) - Línea: ${q.line}, Color: ${q.color}. Vidrio: ${glassText}. [DESGLOSE TÉCNICO: ${profCount} perfiles de corte, ${accCount} bolsas de herrajes de fábrica, mano de obra estimada de ${q.calculated.laborMinutes} minutos]`;
      }

      // Calculate vertical height of row based on description wrap
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85); // slate-700

      const wrappedText = doc.splitTextToSize(descString, 108); // usable width for description
      const lineCount = wrappedText.length;
      const rowHeight = Math.max(lineCount * 4.2 + 6, 12);

      // White or very soft alt grid lines
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

      // Quantities and prices
      doc.setFont("helvetica", "bold");
      doc.text(String(q.quantity), margin + 3, y + 6);
      
      doc.setFont("helvetica", "normal");
      wrappedText.forEach((lineText: string, i: number) => {
        doc.text(lineText, margin + 12, y + 6 + (i * 4.2));
      });

      // Price Unitary & Totals
      const unitPrice = q.calculated.total / q.quantity;
      doc.text(`$${Math.round(unitPrice).toLocaleString("es-MX")}`, margin + 128, y + 6, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.text(`$${Math.round(q.calculated.total).toLocaleString("es-MX")}`, margin + contentWidth - 2, y + 6, { align: "right" });

      y += rowHeight;
    });

    y += 4;

    // Check for page break before totals
    if (y > 220) {
      doc.addPage();
      y = margin + 10;
    }

    // 4. SUMMARY TOTAL PANEL (Right-aligned)
    const totalProjectPriceLocal = state.quotes.reduce((sum, q) => sum + q.calculated.total, 0);
    const sub = Math.round(totalProjectPriceLocal / (includeIva ? 1.16 : 1));
    const ivaValue = includeIva ? Math.round(totalProjectPriceLocal - sub) : 0;
    const finalTot = Math.round(totalProjectPriceLocal);

    const startX = margin + 110;
    const totalsWidth = contentWidth - 110;

    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(startX, y, totalsWidth, includeIva ? 22 : 16, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    if (includeIva) {
      doc.text("Subtotal Neto:", startX + 3, y + 5.5);
      doc.text(`$${sub.toLocaleString("es-MX")}`, margin + contentWidth - 3, y + 5.5, { align: "right" });

      doc.text("I.V.A. Trasladado (16%):", startX + 3, y + 10.5);
      doc.text(`$${ivaValue.toLocaleString("es-MX")}`, margin + contentWidth - 3, y + 10.5, { align: "right" });

      doc.setDrawColor(226, 232, 240);
      doc.line(startX + 3, y + 13, margin + contentWidth - 3, y + 13);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("TOTAL COTIZADO:", startX + 3, y + 18.5);
      doc.text(`$${finalTot.toLocaleString("es-MX")} MXN`, margin + contentWidth - 3, y + 18.5, { align: "right" });
    } else {
      doc.text("Importe de Materiales y Labor:", startX + 3, y + 5.5);
      doc.text(`$${finalTot.toLocaleString("es-MX")}`, margin + contentWidth - 3, y + 5.5, { align: "right" });

      doc.setDrawColor(226, 232, 240);
      doc.line(startX + 3, y + 8, margin + contentWidth - 3, y + 8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("TOTAL NETO:", startX + 3, y + 13);
      doc.text(`$${finalTot.toLocaleString("es-MX")} MXN`, margin + contentWidth - 3, y + 13, { align: "right" });
    }

    y += includeIva ? 28 : 22;

    // 5. NOTES AND CLAUSES TERMS
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("CONDICIONES COMERCIALES Y DE ENTREGA:", margin, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    
    const wrappedNotes = doc.splitTextToSize(notesForPdf, contentWidth);
    wrappedNotes.forEach((lineText: string, i: number) => {
      doc.text(lineText, margin, y + 4 + (i * 3.8));
    });

    y += 18 + (wrappedNotes.length * 3.8);

    // 6. SIGNATURE PLATES
    if (y < 265) {
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.setLineWidth(0.4);

      // Taller Signature Line
      doc.line(margin + 15, y + 15, margin + 65, y + 15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("REPRESENTANTE AUTORIZADO", margin + 40, y + 19, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text(state.businessDetails.name.split("-")[0], margin + 40, y + 23, { align: "center" });

      // Client Signature Line
      doc.line(margin + 105, y + 15, margin + 155, y + 15);
      doc.setFont("helvetica", "bold");
      doc.text("ACEPTO CONFORMIDAD CLIENTE", margin + 130, y + 19, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.text("Firma de Autorización de Proyecto", margin + 130, y + 23, { align: "center" });
    }

    // Save File
    const sanitizedClientName = (clientNameForPdf.trim() || "Publico_General").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Cotizacion_${quoteCode}_${sanitizedClientName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">
            Sistema de Cotización Instantánea
          </h1>
          <p className="text-slate-500 text-xs">
            Calcula piezas individualizadas en segundos y compila proyectos integrales con cálculos de materiales.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={exportCutsToPackage}
            disabled={state.quotes.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            id="export-cuts-button"
          >
            <Scissors size={14} />
            Optimizar Cortes ({state.quotes.length})
          </button>
          <button
            onClick={exportToInvoice}
            disabled={state.quotes.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            id="create-bill-button"
          >
            <FileText size={14} />
            Hacer Nota de Remisión
          </button>
        </div>
      </div>

      {/* Primary Workspace: Form on left, cart details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* CONFIGURATION PANEL (Col span 3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Calculator size={15} className="text-blue-600" />
                Nueva Pieza o Concepto
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                ALUDEV Sistema
              </span>
            </div>

            {/* INTERACTIVE MODE TOGGLE SWITCH SLIDER */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
              <button 
                type="button"
                onClick={() => setIsCalculatedMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 ${isCalculatedMode ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800"}`}
              >
                Calculadora de Fórmulas
              </button>
              <button 
                type="button"
                onClick={() => setIsCalculatedMode(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-200 ${!isCalculatedMode ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800"}`}
              >
                Concepto Manual (Rápido)
              </button>
            </div>

            {isCalculatedMode ? (
              // MODAL CALCULADO / FORMULAS COMPLETE FLOW
              <>
                <div className="border-l-4 border-blue-500 pl-3 py-1 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">1. Seleccionar Diseño & Medidas</h3>
                  {activeCategory && (
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                      activeCategory === "ventanas" ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" :
                      activeCategory === "puertas" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                      activeCategory === "canceles" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                      activeCategory === "portones" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {selectedCategoryLabel}
                    </span>
                  )}
                </div>

                {/* Template Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Estructura Predeterminada</label>
                    <select
                      value={selectedFormulaId}
                      onChange={(e) => setSelectedFormulaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <optgroup label="🪟 Ventanas">
                        {state.formulas.filter(f => f.category === "ventanas").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🚪 Puertas">
                        {state.formulas.filter(f => f.category === "puertas").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🚿 Canceles de Baño">
                        {state.formulas.filter(f => f.category === "canceles").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🖼️ Fijos Perimetrales">
                        {state.formulas.filter(f => f.category === "fijos").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🚗 Portones y Garajes">
                        {state.formulas.filter(f => f.category === "portones").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Etiqueta de Pieza (Nombre)</label>
                    <input
                      type="text"
                      placeholder="Ej: Ventana Recámara Principal"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Dimensions (Double Slider & Manual text Inputs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700">Ancho (Ancho Vano)</span>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                        className="w-20 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>30 cm</span>
                      <span>150 cm</span>
                      <span>300 cm</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700">Alto (Alto Vano)</span>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                        className="w-20 bg-white border border-slate-200 rounded px-2 py-0.5 text-right font-mono text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>30 cm</span>
                      <span>150 cm</span>
                      <span>300 cm</span>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC VISUAL BLUEPRINT GRAPHICS (Vista Previa Semicad) */}
                <div className="pt-2" id="live-visual-blueprint-section">
                  <div className="border-l-4 border-blue-600 pl-3 py-1 mb-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600" />
                      Visualización Técnica Semicad (Plano Activo)
                    </h3>
                  </div>
                  <DynamicWindowPreview
                    category={state.formulas.find(f => f.id === selectedFormulaId)?.category || "ventanas"}
                    width={width}
                    height={height}
                    color={color}
                    glassType={state.glasses.find(g => g.id === selectedGlassId)?.thickness || "4mm"}
                  />
                </div>

                <div className="border-l-4 border-emerald-500 pl-3 py-1 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">2. Especificación de Sistema & Vidrios</h3>
                </div>

                {/* Profile Line & Glass Type selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Línea de Aluminio</label>
                    <select
                      value={line}
                      onChange={(e) => setLine(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option 
                        value="Nacional 2″" 
                        disabled={activeCategory === "puertas" || activeCategory === "portones"}
                      >
                        Nacional 2″ {activeCategory === "puertas" || activeCategory === "portones" ? "(⚠️ No apto para Puerta/Portón)" : "(Económico)"}
                      </option>
                      <option value="Nacional 3″">Nacional 3″ (Estándar)</option>
                      <option value="Española">Española (Premium)</option>
                      <option value="Serie 50">Serie 50 (Resistente)</option>
                      <option value="EuroVent">EuroVent (Elite)</option>
                      <option 
                        value="Portones" 
                        disabled={activeCategory === "ventanas" || activeCategory === "canceles"}
                      >
                        Portones {activeCategory === "ventanas" || activeCategory === "canceles" ? "(⚠️ Exclusivo para Portón/Pesados)" : "(Pesados/Portón)"}
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-slate-500">Color del Aluminio</label>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{color}</span>
                    </div>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      {COLORS.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    
                    {/* Visual Round Swatches Grid */}
                    <div className="flex flex-wrap gap-2.5 mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100 dark:bg-slate-800/10">
                      {[
                        { name: "Blanco (Pintado)", hex: "#f8fafc", border: "border-slate-300", label: "Blanco" },
                        { name: "Natural (Anodizado)", hex: "#94a3b8", border: "border-slate-400", label: "Natural" },
                        { name: "Negro", hex: "#0f172a", border: "border-black", label: "Negro" },
                        { name: "Bronce", hex: "#45322e", border: "border-slate-800", label: "Bronce" },
                        { name: "Duranodick", hex: "#231e21", border: "border-stone-900", label: "Duranodick" },
                        { name: "Champagne", hex: "#e2c994", border: "border-amber-400", label: "Champagne" },
                        { name: "Nogal (Madera)", hex: "#7c2d12", border: "border-orange-950", label: "Madera" }
                      ].map((sw) => {
                        const isSelected = color === sw.name;
                        return (
                          <button
                            key={sw.name}
                            type="button"
                            onClick={() => setColor(sw.name)}
                            className={`w-5.5 h-5.5 rounded-full ${sw.border} border flex items-center justify-center relative cursor-pointer hover:scale-110 transition ${
                              isSelected ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-105 shadow" : "opacity-80"
                            }`}
                            style={{ backgroundColor: sw.hex }}
                            title={sw.name}
                          >
                            {isSelected && (
                              <span className={`w-1 h-1 rounded-full ${color.toLowerCase().includes("negro") || color.toLowerCase().includes("bronce") || color.toLowerCase().includes("duranodick") ? "bg-white" : "bg-slate-800"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cristal o Material de Relleno</label>
                    <select
                      value={selectedGlassId}
                      onChange={(e) => setSelectedGlassId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      {state.glasses
                        .filter((glass) => {
                          if (activeCategory === "canceles") {
                            // allow bath plastic, acrylic, and all premium bath-safe glasses
                            return ["glass-policarbonato", "glass-panel-al", "glass-plastico", "glass-6t", "glass-esmerilado", "glass-filtrasol-plus", "glass-reflecta", "glass-reflecta-verde", "glass-reflecta-azul", "glass-none"].includes(glass.id);
                          }
                          if (activeCategory === "portones") {
                            // allow panels and no-glass options
                            return ["glass-none", "glass-panel-al"].includes(glass.id);
                          }
                          // Windows, doors and custom shapes can use any glass including 'Sin cristal'
                          return true;
                        })
                        .map((glass) => (
                          <option key={glass.id} value={glass.id}>
                            {glass.thickness} {glass.pricePerM2 > 0 ? `($${glass.pricePerM2}/m²)` : ""}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad piezas</label>
                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Mano Obra (Min/pz)</label>
                      <input
                        type="number"
                        min="1"
                        value={laborMinutes}
                        onChange={(e) => setLaborMinutes(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: COSTING AND MARGIN MARKUPS (Aluminio Facil Excel matching) */}
                <div className="border-l-4 border-amber-500 pl-3 py-1 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">3. Parámetros de Utilidad & Merma</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/20 dark:bg-slate-800/10 p-4 rounded-xl border border-dashed border-amber-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Coins size={12} className="text-amber-500" />
                        Margen de Utilidad
                      </span>
                      <strong className="text-amber-700 dark:text-amber-400 font-mono">+{profitMargin}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="w-full h-1.5 bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Costo Neto (0%)</span>
                      <span>50%</span>
                      <span>150%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <TrendingDown size={12} className="text-emerald-500" />
                        Factor Desperdicio (Merma)
                      </span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-mono">+{wastePercentage}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="25"
                      step="1"
                      value={wastePercentage}
                      onChange={(e) => setWastePercentage(Number(e.target.value))}
                      className="w-full h-1.5 bg-emerald-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>0% (Preciso)</span>
                      <span>10% (Taller)</span>
                      <span>25%</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200/60">
                    <div className="flex flex-col text-slate-700">
                      <span className="text-xs font-bold leading-tight flex items-center gap-1">
                        Desglosar IVA (+16%)
                      </span>
                      <span className="text-[10px] text-slate-400 leading-normal">Agrega 16% de remisión estructurada al total de venta</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeIva(!includeIva)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeIva ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-750"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          includeIva ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // MODAL MANUAL / LIBRE FLOW (OLD HERO LAYOUT)
              <>
                <div className="border-l-4 border-amber-500 pl-3 py-1 bg-amber-50/50 rounded-r-lg pr-2">
                  <h3 className="text-xs font-bold text-amber-800 uppercase">Configuración de Concepto Manual Libre</h3>
                  <p className="text-[10px] text-amber-700">Igual al generador original. Ingresa los datos exactos que quieres reflejar.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Descripción del Producto / Servicio</label>
                    <input
                      type="text"
                      placeholder="Ej: Portón automático de aluminio duela 10cm, con instalación y kit de pistones batientes"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Precio Unitario ($ MXN)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Cantidad de Unidades</label>
                      <input
                        type="number"
                        placeholder="1"
                        min="1"
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-sans text-center"
                      />
                    </div>
                  </div>

                  {/* Optional decorative helper */}
                  <div className="bg-slate-50 hover:bg-slate-100/70 py-2.5 px-3.5 rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-500 flex items-start gap-2">
                    <span className="text-amber-500 font-bold">ℹ️</span>
                    <div>
                      Este concepto se sumará directamente a los subtotales del proyecto. Tus notas de remisión se generarán automáticamente vinculando este renglón sin afectar base de cortes del taller.
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CONFIGURATION VALIDATION MESSAGES */}
            {isCalculatedMode && validationIssues.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <AlertCircle size={14} className="text-amber-500" />
                  <span>Validación de Aludev ({selectedCategoryLabel})</span>
                </div>
                <div className="space-y-1.5">
                  {validationIssues.map((issue, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                        issue.type === "error" 
                          ? "bg-red-50 text-red-905 border-red-100 dark:bg-red-950/25 dark:text-red-300 dark:border-red-900/40 font-semibold" 
                          : "bg-amber-50 text-amber-905 border-amber-100 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/40"
                      }`}
                    >
                      <span className="mt-0.5">{issue.type === "error" ? "🛑" : "⚠️"}</span>
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PREVIEW SINGLE COST CARD */}
            {previewResult && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Cálculo de Cotización</span>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-bold px-1.5 py-0.5 rounded-full">Unitario</span>
                  </div>
                  
                  {isCalculatedMode ? (
                    <div className="space-y-1 font-sans text-slate-600 dark:text-slate-300 text-xs mb-3">
                      <div className="flex justify-between">
                        <span>Base + Merma ({previewResult.wastePercent}%):</span>
                        <strong className="font-mono text-slate-700 dark:text-slate-200">${Math.round(previewResult.baseCost / qty).toLocaleString("es-MX")}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilidad (+{previewResult.profitMarginPercent}%):</span>
                        <strong className="font-mono text-amber-600 dark:text-amber-400">+${Math.round((previewResult.baseCost * (previewResult.profitMarginPercent / 100)) / qty).toLocaleString("es-MX")}</strong>
                      </div>
                      {previewResult.includeIva && (
                        <div className="flex justify-between">
                          <span>Impuestos (IVA 16%):</span>
                          <strong className="font-mono text-blue-600 dark:text-blue-400">+${Math.round((previewResult.baseCost * (1 + previewResult.profitMarginPercent / 100) * 0.16) / qty).toLocaleString("es-MX")}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 mb-2">Concepto manual libre con precio establecido directamente.</p>
                  )}

                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Total Unitario:</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-50">${Math.round(previewResult.total / qty).toLocaleString("es-MX")} <span className="text-xs font-normal">MXN</span></span>
                  </div>
                </div>
                
                <div className={`text-white p-4 rounded-xl flex flex-col justify-between h-full shadow-lg ${isCalculatedMode ? "bg-gradient-to-br from-blue-900 to-indigo-950 shadow-indigo-950/10" : "bg-gradient-to-br from-amber-800 to-stone-900 shadow-amber-800/10"}`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono uppercase ${isCalculatedMode ? "text-blue-300" : "text-amber-200"}`}>Importe Total ({qty} pz)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${isCalculatedMode ? "bg-blue-800 text-blue-200" : "bg-amber-700 text-amber-200"}`}>
                      {hasValidationError ? "Configuración Inválida" : "Listo para guardar"}
                    </span>
                  </div>
                  <h3 className={`text-3xl font-black tracking-tight mt-1.5 font-sans ${isCalculatedMode ? "text-blue-50" : "text-amber-50"}`}>
                    ${Math.round(previewResult.total).toLocaleString("es-MX")} MXN
                  </h3>
                  <button
                    onClick={handleAddToQuote}
                    disabled={hasValidationError}
                    className={`mt-3.5 w-full bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold py-2 rounded-lg text-center transition shadow ${isCalculatedMode ? "text-blue-900" : "text-amber-900"}`}
                    id="add-item-to-project"
                  >
                    {hasValidationError ? "🛑 Configuración No Válida" : "+ Agregar a Cotización"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME TECHNICAL MATERIAL BREAKDOWN */}
          {isCalculatedMode && previewResult && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-indigo-500" />
                Desglose Físico y Descuentos Asociados (Instantáneo)
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {/* Profiles section */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Perfiles de Aluminio</span>
                  {previewResult.profiles.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-800 font-semibold">{p.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.name} - Medidas de corte:{" "}
                          <strong>
                            {p.cuts[0]?.sizeCm}cm ({p.cuts[0]?.qty} piezas, ángulo {p.cuts[0]?.angle})
                          </strong>
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-700 font-mono">
                        {p.meters.toFixed(1)}m | ${Math.round(p.cost)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Glass section */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Vidriería</span>
                  {previewResult.glasses.map((g: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-xs text-slate-800 font-semibold">Cristal Espesor {g.thickness}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Lámina cortada:{" "}
                          <strong>
                            {g.widthCm} x {g.heightCm}cm ({g.qty} pzas)
                          </strong>
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-700 font-mono">
                        {g.areaM2.toFixed(2)}m² | ${Math.round(g.cost)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Accessories section */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Herrajes / Accesorios de Montaje</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewResult.accessories.map((acc: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 py-1 px-2.5 rounded border border-slate-100">
                        <span className="text-xs text-slate-700 max-w-[150px] truncate">{acc.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {acc.qty} pz (${Math.round(acc.cost)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PROJECT CART BOARD (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[500px]">
            <div>
              {/* Header with Title and Clear Button */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Grid size={16} className="text-blue-600" />
                  Proyecto en Cotización ({state.quotes.length} items)
                </h3>
                {state.quotes.length > 0 && (
                  <button
                    onClick={clearQuotes}
                    className="text-xs text-red-500 hover:text-red-700 font-medium font-sans flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    Limpiar
                  </button>
                )}
              </div>

              {/* Toggle Switch between Venta and Taller modes */}
              {state.quotes.length > 0 && (
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold gap-1">
                  <button
                    onClick={() => setBasketTab("venta")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition ${
                      basketTab === "venta"
                        ? "bg-white text-slate-800 shadow"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Detalle de Venta
                  </button>
                  <button
                    onClick={() => setBasketTab("taller")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                      basketTab === "taller"
                        ? "bg-white text-slate-800 shadow"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Hammer size={12} className="text-blue-600" />
                    Ficha de Taller ({despieceCuts.length} Cortes)
                  </button>
                </div>
              )}

              {/* Basket Content Area */}
              {basketTab === "venta" ? (
                /* CLIENT/SALE DETAIL VIEW (Original Quoter Basket) */
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {state.quotes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl relative group hover:border-slate-300 hover:bg-slate-100/50 transition"
                    >
                      {editingQuoteId !== q.id ? (
                        <>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingQuoteId(q.id);
                                setEditName(q.name);
                                setEditDescription(q.customDescription || "");
                              }}
                              className="text-slate-400 hover:text-blue-600 transition"
                              title="Editar texto de cotización"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => deleteQuoteItem(q.id)}
                              className="text-slate-300 hover:text-red-600 transition"
                              title="Eliminar pieza"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-xs pr-14 flex items-center gap-1">
                              {q.name}
                              {q.customDescription && (
                                <span className="text-[8px] bg-sky-100 text-sky-700 px-1 rounded font-bold uppercase">
                                  Simplificado
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {q.widthCm} x {q.heightCm} cm | {q.line} | {q.color}
                            </p>
                            
                            {/* Saved Custom Description */}
                            {q.customDescription ? (
                              <div className="mt-2 p-2 bg-sky-50/50 text-slate-600 rounded-lg text-[11px] border border-sky-100/60 leading-relaxed font-sans italic">
                                <span className="font-bold text-sky-800 not-italic block text-[9px] uppercase tracking-wider mb-0.5">Descripción para cliente:</span>
                                "{q.customDescription}"
                              </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 mt-1 italic">
                                Usando desglose técnico automático.
                              </p>
                            )}

                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
                                {q.quantity} pz
                              </span>
                              <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-medium">
                                {q.calculated.glasses[0]?.id === "glass-none" ? "Sin vidrio" : q.calculated.glasses[0]?.thickness}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-slate-200/50">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Editando Texto</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  updateQuoteItem(q.id, {
                                    name: editName,
                                    customDescription: editDescription.trim() || undefined
                                  });
                                  setEditingQuoteId(null);
                                }}
                                className="flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-2.5 rounded-lg transition font-medium"
                              >
                                <Check size={10} />
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingQuoteId(null)}
                                className="flex items-center gap-1 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 py-1 px-2.5 rounded-lg transition font-medium"
                              >
                                <X size={10} />
                                Cancelar
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Nombre Corto de Pieza</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Descripción para el Cliente (Sin Tecniscismos)</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const gText = q.calculated.glasses[0]?.id === "glass-none" || !q.calculated.glasses[0]
                                      ? "sin incluir vidrio (solo perfilería)"
                                      : `con cristal ${q.calculated.glasses[0]?.thickness.toLowerCase()}`;
                                    setEditDescription(`Cancelería de aluminio en color ${q.color.toLowerCase()} para ${q.name.toLowerCase()} de ${q.widthCm} x ${q.heightCm} cm de alto, ${gText} e instalación premium de taller.`);
                                  }}
                                  className="text-[9px] text-blue-600 hover:underline font-semibold"
                                >
                                  Sugerir texto simple
                                </button>
                              </div>
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Escribe la descripción simplificada aquí. Esto ocultará los milímetros y perfiles técnicos al cliente en el PDF."
                                className="w-full h-16 bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-normal resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500">Subtotal con Mano Obra:</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          ${Math.round(q.calculated.total).toLocaleString("es-MX")}
                        </span>
                      </div>
                    </div>
                  ))}

                  {state.quotes.length === 0 && (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <LaptopIcon className="mx-auto text-slate-300" size={40} />
                      <p className="text-sm font-semibold">No hay canceles en el proyecto</p>
                      <p className="text-xs text-slate-400">
                        Usa el panel de la izquierda para configurar tus piezas e incluirlas aquí.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* WORKSHOP INTEGRATED SHEET & DESPIECE */
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                  {/* WORKSHOP PROGRESS BAR */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Scissors size={13} className="text-blue-600" />
                        Progreso de Cortes en Sierra
                      </span>
                      <span className="font-mono font-bold text-blue-700">{progressPercent}% ({completedCutsCount}/{totalCutsCount})</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${progressPercent}%` }} 
                        className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={handlePrintWorkshopPlan}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-white border border-blue-200 px-2.5 py-1 rounded shadow-sm transition"
                      >
                        <Printer size={10} />
                        Imprimir Hoja de Taller
                      </button>
                      {completedCutsCount > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm("¿Deseas reiniciar el estatus de todos los cortes?")) {
                              setCompletedCuts({});
                            }
                          }}
                          className="text-[9px] text-slate-500 hover:text-red-500 transition"
                        >
                          Reiniciar Listado
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SECTION 1: CONSOLIDATED MATERIALS LIST */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <ShoppingBag size={10} className="text-slate-500" />
                      Plan de Compra de Almacén
                    </h4>
                    
                    {/* Raw profiles list with Bar calculation */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 font-mono block border-b border-slate-200 pb-1 uppercase font-bold">1. Perfiles de Aluminio (Barras 6.1m)</span>
                      {Object.values(aggregatedProfiles).map((p, i) => (
                        <div key={i} className="flex justify-between items-start text-xs border-b border-dashed border-slate-150 last:border-none pb-1.5 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{p.line} | {p.color}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-800 text-xs">{p.barCount} bar(s)</span>
                            <span className="block text-[9px] text-slate-400 font-mono">({p.meters.toFixed(1)}m req.)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Consolidated glasses */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 font-mono block border-b border-slate-200 pb-1 uppercase font-bold">2. Vidriería</span>
                      {Object.values(aggregatedGlasses).map((g, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">{g.thickness}</p>
                            <p className="text-[9px] text-slate-400">{g.count} pzas de cristal necesarias</p>
                          </div>
                          <span className="font-mono font-bold text-slate-800">
                            {g.areaM2.toFixed(2)} m²
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Consolidated hardware */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 font-mono block border-b border-slate-200 pb-1 uppercase font-bold">3. Accesorios / Herrajes</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {Object.values(aggregatedAccessories).map((a, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-700 bg-white px-2 py-1 rounded border border-slate-100">
                            <span>{a.name}</span>
                            <span className="font-mono font-bold text-slate-800">{a.qty} pz</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: WORKSHOP DETAIL CUTTING LIST */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Plan de Cortes (Ordenado por Perfil)
                    </h4>
                    
                    <div className="space-y-1.5">
                      {despieceCuts.map((c) => (
                        <div 
                          key={c.stableId}
                          onClick={() => toggleCutCompleted(c.stableId)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition select-none ${
                            completedCuts[c.stableId]
                              ? "bg-slate-100/70 border-slate-300 opacity-60 line-through text-slate-400"
                              : "bg-white border-slate-200/60 text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <button
                            type="button"
                            className={`p-0.5 shrink-0 ${completedCuts[c.stableId] ? "text-blue-600" : "text-slate-300"}`}
                          >
                            {completedCuts[c.stableId] ? (
                              <CheckSquare size={15} />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-bold font-mono text-sm tracking-tight text-blue-700">
                                {c.sizeCm} cm
                              </span>
                              <span className={`text-[9px] px-1.5 rounded font-bold font-mono ${c.angle.includes("45") ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-slate-100 text-slate-600"}`}>
                                {c.angle.includes("45") ? "45° Mitra" : "90° Recto"}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 truncate mt-0.5">
                              {c.quoteName} - {c.label} • <span className="text-[8px] font-mono">{c.color}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total project panel at very bottom of card */}
            {state.quotes.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-250/80 space-y-4">
                
                {/* PDF BRAND CUSTOMIZER CONTROLS */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/50">
                    <Download size={12} className="text-blue-600" />
                    <span className="font-bold text-slate-700 uppercase tracking-wide">Exportación PDF Profesional</span>
                  </div>
                  
                  <div className="space-y-2 Pt-1">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Nombre del Cliente</label>
                      <input
                        type="text"
                        value={clientNameForPdf}
                        onChange={(e) => setClientNameForPdf(e.target.value)}
                        placeholder="Ej: Ignacio Martínez"
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Condiciones comerciales / Garantías</label>
                      <textarea
                        value={notesForPdf}
                        onChange={(e) => setNotesForPdf(e.target.value)}
                        placeholder="Condiciones de pago..."
                        className="w-full h-11 bg-white border border-slate-200 rounded-lg p-2 text-slate-800 text-[10px] focus:ring-1 focus:ring-blue-500 focus:outline-none leading-normal resize-none"
                      />
                    </div>

                    <div className="pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={simplifyPdf}
                          onChange={(e) => setSimplifyPdf(e.target.checked)}
                          className="rounded border-slate-200 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[10px] text-slate-600 font-semibold leading-tight">
                          Simplificar PDF (Ocultar cortes y desgloses milimétricos técnicos)
                        </span>
                      </label>
                    </div>

                    <button
                      onClick={handleDownloadPDF}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg hover:shadow-emerald-900/10 active:scale-[0.99]"
                    >
                      <Download size={13} />
                      Descargar PDF de Cotización
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono pt-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Mano de obra total:</span>
                    <span>${Math.round(totalLaborPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Materia prima (aluminio):</span>
                    <span>${Math.round(totalProfilesPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Materia prima (vidrios):</span>
                    <span>${Math.round(totalGlassesPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Herrajes totales:</span>
                    <span>${Math.round(totalAccessoriesPrice).toLocaleString("es-MX")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-700">Importe Proyecto Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-700 font-mono">
                      ${Math.round(totalProjectPrice).toLocaleString("es-MX")}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">MXN Neto</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={exportCutsToPackage}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Scissors size={13} />
                    Extraer Cortes
                  </button>
                  <button
                    onClick={exportToInvoice}
                    className="py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <FileText size={13} />
                    Hacer Remisión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple Fallback Component inside file since Lucide icon doesn't have custom laptop
const LaptopIcon = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
    <line x1="2" x2="22" y1="20" y2="20" />
    <line x1="5" x2="19" y1="20" y2="16" />
  </svg>
);
