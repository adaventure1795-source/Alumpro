/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { QuoteItem, FormulaRule } from "../types";
import { evaluateEquation } from "../utils/cutOptimizer";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
  Download,
  ImagePlus
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
  const [customPrice, setCustomPrice] = useState<number | string>("1500");
  
  // Costing & markup controls
  const [profitMargin, setProfitMargin] = useState<number | string>("30"); // 30% default profit margin markup
  const [includeIva, setIncludeIva] = useState<boolean>(false); // 16% IVA toggle
  const [wastePercentage, setWastePercentage] = useState<number | string>("10"); // 10% default waste/merma cost addition
  const [overrideTotal, setOverrideTotal] = useState<number | string>(""); // manual total override
  const [showMaterialCost, setShowMaterialCost] = useState<boolean>(false); // Show material in PDF


  // Custom single item settings
  const [label, setLabel] = useState<string>("");
  const [width, setWidth] = useState<number | string>("120");
  const [height, setHeight] = useState<number | string>("100");
  const [line, setLine] = useState<string>("Nacional 2″");
  const [color, setColor] = useState<string>("Anodizado Natural");
  const [selectedGlassId, setSelectedGlassId] = useState<string>(
    state.glasses[0]?.id || ""
  );
  const [qty, setQty] = useState<number | string>("1");
  const [laborMinutes, setLaborMinutes] = useState<number | string>("120");

  // Manual / Freequote customized details
  const [manualHasGlass, setManualHasGlass] = useState<boolean>(true);
  const [manualGlassTone, setManualGlassTone] = useState<string>("Claro");
  const [manualAluColor, setManualAluColor] = useState<string>("Natural (Anodizado)");
  const [manualMaterialIncluded, setManualMaterialIncluded] = useState<boolean>(true);
  const [designImageUrl, setDesignImageUrl] = useState<string>("");
  
  // Quote item text-editor states:
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editQty, setEditQty] = useState<number | "">(1);

  // Helper to adjust quantity on the fly and trigger full recalculated pricing despiece
  const changeBasketItemQuantity = (qId: string, newQty: number) => {
    if (newQty < 1) return;
    const q = state.quotes.find((item) => item.id === qId);
    if (!q) return;

    if (!q.formulaRuleId) {
      // Manual / Concepto libre
      const originalUnitPrice = q.calculated.total / q.quantity;
      const newTotal = originalUnitPrice * newQty;
      updateQuoteItem(qId, {
        quantity: newQty,
        calculated: {
          ...q.calculated,
          total: newTotal
        }
      });
      return;
    }

    // Calculated template item
    const formulaRule = state.formulas.find((f) => f.id === q.formulaRuleId);
    const glass = state.glasses.find((g) => g.id === q.glassId);
    if (!formulaRule || !glass) {
      const originalTotal = q.calculated.total / q.quantity;
      updateQuoteItem(qId, {
        quantity: newQty,
        calculated: {
          ...q.calculated,
          total: originalTotal * newQty
        }
      });
      return;
    }

    const variables = {
      Ancho: q.widthCm,
      Alto: q.heightCm,
      Cantidad: newQty
    };

    const line = q.line;
    const wastePercentage = q.calculated.wastePercent ?? 10;
    const profitMargin = q.calculated.profitMarginPercent ?? 30;
    const includeIva = q.calculated.includeIva ?? false;
    const laborMinutesPerPiece = (q.calculated.laborCost ? q.calculated.laborMinutes / q.quantity : 120) || 120;

    let subtotalProfiles = 0;
    const computedProfiles = formulaRule.profileEquations.map((eq) => {
      let matchingProfile = state.profiles.find(
        (p) => p.line === line && p.id === eq.profileId
      );
      if (!matchingProfile) {
        matchingProfile = state.profiles.find((p) => p.line === line) || state.profiles[0];
      }

      const cutSizeCm = evaluateEquation(eq.formula, variables);
      const totalMetersPerPiece = (cutSizeCm / 100) * eq.quantity;
      const totalMeters = totalMetersPerPiece * newQty;
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
            qty: eq.quantity * newQty,
            angle: eq.angle
          }
        ]
      };
    });

    const glassWidthCm = evaluateEquation(formulaRule.glassEquation.formulaWidth, variables);
    const glassHeightCm = evaluateEquation(formulaRule.glassEquation.formulaHeight, variables);
    const areaM2PerPiece = (glassWidthCm / 100) * (glassHeightCm / 100) * formulaRule.glassEquation.quantity;
    const totalAreaM2 = areaM2PerPiece * newQty;
    const glassCost = totalAreaM2 * glass.pricePerM2;

    const computedGlasses = [
      {
        thickness: glass.thickness,
        areaM2: Number(totalAreaM2.toFixed(3)),
        cost: glassCost,
        widthCm: Number(glassWidthCm.toFixed(1)),
        heightCm: Number(glassHeightCm.toFixed(1)),
        qty: formulaRule.glassEquation.quantity * newQty
      }
    ];

    let subtotalAccessories = 0;
    const computedAccessories = formulaRule.accessoryEquations.map((eq) => {
      const matchAcc = state.accessories.find((a) => a.id === eq.accessoryId) || state.accessories[0];
      const contextVars = { ...variables, Vidrios: formulaRule.glassEquation.quantity * newQty };
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

    const laborHourRate = state.businessDetails.laborRatePerHour || 220;
    const laborCost = (laborMinutesPerPiece / 60) * laborHourRate * newQty;

    const normProfitMargin = Number(profitMargin) || 30;
    const normWastePercentage = Number(wastePercentage) || 10;

    const subtotalProfilesWithWaste = subtotalProfiles * (1 + normWastePercentage / 100);
    const baseCost = subtotalProfilesWithWaste + glassCost + subtotalAccessories + laborCost;
    const priceWithMargin = baseCost * (1 + normProfitMargin / 100);
    const finalTotal = includeIva ? priceWithMargin * 1.16 : priceWithMargin;

    updateQuoteItem(qId, {
      quantity: newQty,
      calculated: {
        profiles: computedProfiles,
        glasses: computedGlasses,
        accessories: computedAccessories,
        subtotalProfiles: subtotalProfilesWithWaste,
        subtotalGlasses: glassCost,
        subtotalAccessories,
        laborMinutes: laborMinutesPerPiece * newQty,
        laborCost,
        baseCost,
        profitMarginPercent: normProfitMargin,
        wastePercent: normWastePercentage,
        includeIva,
        total: finalTotal
      }
    });
  };

  // PDF download configurations:
  const [clientNameForPdf, setClientNameForPdf] = useState<string>("");
  const [clientAddressForPdf, setClientAddressForPdf] = useState<string>("");
  const [clientPhoneForPdf, setClientPhoneForPdf] = useState<string>("");
  const [businessAddressForPdf, setBusinessAddressForPdf] = useState<string>("Boca del Río, Veracruz");
  const [businessPhoneForPdf, setBusinessPhoneForPdf] = useState<string>("229-684-6549");
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
    activeCategory === "barandales" ? "🪜 Barandales" :
    activeCategory === "rejas" ? "🛡️ Rejas y Protecciones" :
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
    const normQty = Number(qty) || 1;
    const normLaborMinutes = Number(laborMinutes) || 120;
    const normCustomPrice = Number(customPrice) || 0;
    const normWidth = Number(width) || 120;
    const normHeight = Number(height) || 100;
    const normProfitMargin = Number(profitMargin) || 30;
    const normWastePercentage = Number(wastePercentage) || 10;

    if (!isCalculatedMode) {
      setPreviewResult({
        profiles: [],
        glasses: manualHasGlass ? [
          {
            thickness: manualGlassTone,
            areaM2: 0,
            cost: 0,
            widthCm: 0,
            heightCm: 0,
            qty: normQty,
            id: "glass-custom-" + manualGlassTone
          }
        ] : [],
        accessories: [],
        subtotalProfiles: 0,
        subtotalGlasses: 0,
        subtotalAccessories: 0,
        subtotalHardware: 0,
        laborMinutes: 0,
        laborCost: 0,
        total: normCustomPrice * normQty
      });
      return;
    }

    const formulaRule = state.formulas.find((f) => f.id === selectedFormulaId);
    const glass = state.glasses.find((g) => g.id === selectedGlassId);

    if (!formulaRule || !glass) return;

    const variables = {
      Ancho: normWidth,
      Alto: normHeight,
      Cantidad: normQty
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
      const totalMeters = totalMetersPerPiece * normQty;
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
            qty: eq.quantity * normQty,
            angle: eq.angle
          }
        ]
      };
    });

    // Calculate glass
    const glassWidthCm = evaluateEquation(formulaRule.glassEquation.formulaWidth, variables);
    const glassHeightCm = evaluateEquation(formulaRule.glassEquation.formulaHeight, variables);
    const areaM2PerPiece = (glassWidthCm / 100) * (glassHeightCm / 100) * formulaRule.glassEquation.quantity;
    const totalAreaM2 = areaM2PerPiece * normQty;
    const glassCost = totalAreaM2 * glass.pricePerM2;

    const computedGlasses = [
      {
        thickness: glass.thickness,
        areaM2: Number(totalAreaM2.toFixed(3)),
        cost: glassCost,
        widthCm: Number(glassWidthCm.toFixed(1)),
        heightCm: Number(glassHeightCm.toFixed(1)),
        qty: formulaRule.glassEquation.quantity * normQty
      }
    ];

    // Calculate accessories
    let subtotalAccessories = 0;
    const computedAccessories = formulaRule.accessoryEquations.map((eq) => {
      const matchAcc = state.accessories.find((a) => a.id === eq.accessoryId) || state.accessories[0];
      
      // We can evaluate formulas like "4" or "2 * Vidrios" => replace Variables
      const contextVars = { ...variables, Vidrios: formulaRule.glassEquation.quantity * normQty };
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
    const laborCost = (normLaborMinutes / 60) * laborHourRate * normQty;

    // Apply waste/merma percentage on raw profiles
    const subtotalProfilesWithWaste = subtotalProfiles * (1 + normWastePercentage / 100);
    
    // Base cost is aluminum (with waste) + glass + accessories + labor
    const baseCost = subtotalProfilesWithWaste + glassCost + subtotalAccessories + laborCost;
    
    // Add profit/utility margin markup
    const priceWithMargin = baseCost * (1 + normProfitMargin / 100);
    
    // Add IVA taxes if enabled
    const calculatedFinalTotal = includeIva ? priceWithMargin * 1.16 : priceWithMargin;
    const finalTotal = overrideTotal !== "" ? Number(overrideTotal) * normQty : calculatedFinalTotal;

    setPreviewResult({
      profiles: computedProfiles,
      glasses: computedGlasses,
      accessories: computedAccessories,
      subtotalProfiles: subtotalProfilesWithWaste,
      subtotalGlasses: glassCost,
      subtotalAccessories,
      laborMinutes: normLaborMinutes * normQty,
      laborCost,
      baseCost,
      profitMarginPercent: normProfitMargin,
      wastePercent: normWastePercentage,
      includeIva,
      total: finalTotal,
      hasManualOverride: overrideTotal !== ""
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
    wastePercentage,
    manualHasGlass,
    manualGlassTone,
    manualAluColor,
    manualMaterialIncluded,
    overrideTotal
  ]);


  // Handle adding computed configuration to quote list
  const handleAddToQuote = async () => {
    if (!previewResult) return;

    let previewImageUrl = undefined;
    if (isCalculatedMode) {
      try {
        const element = document.getElementById("live-visual-blueprint-section");
        if (element) {
          const canvas = await html2canvas(element, { backgroundColor: null, scale: 2 });
          previewImageUrl = canvas.toDataURL("image/png");
        }
      } catch (err) {
        console.error("Failed to capture preview image", err);
      }
    }

    const newItem: QuoteItem = {
      id: "quote-" + Date.now(),
      name: label || (isCalculatedMode ? "Cancel Desconocido" : "Concepto Libre"),
      formulaRuleId: isCalculatedMode ? selectedFormulaId : undefined,
      designImageUrl,
      previewImageUrl,
      widthCm: isCalculatedMode ? (Number(width) || 120) : 0,
      heightCm: isCalculatedMode ? (Number(height) || 100) : 0,
      line: isCalculatedMode ? line : (manualMaterialIncluded ? "Manual (Con Material)" : "Mano de Obra / Servicio"),
      color: isCalculatedMode ? color : manualAluColor,
      glassId: isCalculatedMode ? selectedGlassId : (manualHasGlass ? "glass-custom-" + manualGlassTone : "glass-none"),
      quantity: Number(qty) || 1,
      calculated: previewResult
    };

    addQuoteItem(newItem);
    // Reset inputs
    setLabel("");
    setQty(1);
    setDesignImageUrl("");
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

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);

    let y = 0;

    // 1. BRAND HEADER (Dark Blue)
    const headerHeight = 25;
    doc.setFillColor(30, 64, 137); // #1E4089 ALUDEV Blue
    doc.rect(0, 0, pageWidth, headerHeight, "F");

    // ALUDEV Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ALUDEV", margin, 15);

    // COTIZACIÓN Text (Right Aligned)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("COTIZACIÓN", pageWidth - margin, 12, { align: "right" });
    
    // Subtext
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Cotización personalizada de ALUDEV", pageWidth - margin, 17, { align: "right" });
    
    // Date and Quote Num
    const dateStr = new Date().toLocaleDateString("es-MX", { day: 'numeric', month: 'numeric', year: 'numeric' });
    const quoteCode = `10${Math.floor(Math.random() * 90)}`; // Example like 1091
    doc.text(`Cotización #: ${quoteCode}    Fecha: ${dateStr}`, pageWidth - margin, 22, { align: "right" });

    y = headerHeight + 8;

    const boxWidth = (contentWidth - 10) / 2;
    // 2. Client & Project Info
    doc.setFillColor(248, 250, 252); // slate-50 fill
    doc.rect(margin, y, boxWidth, 25, "F");
    
    doc.setTextColor(30, 64, 137); // Dark blue header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("INFORMACIÓN DEL CLIENTE", margin + 4, y + 6);
    
    doc.setTextColor(0, 0, 0); // Black values
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${clientNameForPdf.trim() || "-"}`, margin + 4, y + 12);
    doc.text(`Dirección: ${clientAddressForPdf.trim() || "-"}`, margin + 4, y + 17);
    doc.text(`Teléfono: ${clientPhoneForPdf.trim() || "-"}`, margin + 4, y + 22);

    // Right Box (Project Info)
    doc.setFillColor(248, 250, 252); // slate-50 fill
    doc.rect(margin + boxWidth + 10, y, boxWidth, 25, "F");
    
    doc.setTextColor(30, 64, 137);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMACIÓN DEL PROYECTO", margin + boxWidth + 14, y + 6);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Asesor: ${state.businessDetails.name || "Aludev"}`, margin + boxWidth + 14, y + 12);
    doc.text(`Ubicación: ${businessAddressForPdf.trim() || "-"}`, margin + boxWidth + 14, y + 17);
    doc.text(`Método de pago: -`, margin + boxWidth + 14, y + 22);

    y += 33;

    // 3. Table Header
    doc.setFillColor(30, 64, 137); // Dark Blue Header
    doc.rect(margin, y, contentWidth, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    
    // Configura posiciones X
    const colDescX = margin + 2;
    const colMedX = margin + 95;
    const colCantX = margin + 125;
    const colUnitPriceX = margin + 145;
    const colTotalX = margin + 178;

    doc.text("Descripción", colDescX, y + 5.5);
    doc.text("Medidas", colMedX, y + 5.5);
    doc.text("Cant.", colCantX, y + 5.5, { align: "center" });
    doc.text("Precio unit.", colUnitPriceX, y + 5.5);
    doc.text("$ Total", colTotalX, y + 5.5);

    y += 8;

    // Table Content
    state.quotes.forEach((q, index) => {
      let descText = "";
      if (q.customDescription) {
        descText = q.customDescription;
      } else {
        const glassText = q.calculated.glasses[0]?.id === "glass-none" || !q.calculated.glasses[0]
          ? ""
          : ` / ${q.calculated.glasses[0]?.thickness}`;
        descText = `${q.name} - ${q.line} / ${q.color}${glassText}`;
      }
      
      const wrappedDesc = doc.splitTextToSize(descText, 90);
      const textHeight = wrappedDesc.length * 4.5;
      const rowHeight = textHeight + 5;
      
      if (y + rowHeight > 270) {
        doc.addPage();
        y = margin;
        doc.setFillColor(30, 64, 137);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("Descripción", colDescX, y + 5.5);
        doc.text("Medidas", colMedX, y + 5.5);
        doc.text("Cant.", colCantX, y + 5.5, { align: "center" });
        doc.text("Precio unit.", colUnitPriceX, y + 5.5);
        doc.text("$ Total", colTotalX, y + 5.5);
        y += 8;
      }

      // Striping background
      if (index % 2 === 0) {
        doc.setFillColor(250, 251, 253);
        doc.rect(margin, y, contentWidth, rowHeight + 2, "F");
      }
      
      doc.setTextColor(0, 0, 0); // Black text for rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      wrappedDesc.forEach((lineText: string, i: number) => {
        doc.text(lineText, colDescX, y + 6 + (i * 4.5));
      });
      
      const medidasStr = q.widthCm && q.heightCm ? `${q.widthCm}×${q.heightCm} cm` : "-";
      doc.text(medidasStr, colMedX, y + 6);
      doc.text(String(q.quantity), colCantX, y + 6, { align: "center" });
      
      const unitPrice = q.calculated.total / q.quantity;
      doc.text(`$${unitPrice.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colUnitPriceX, y + 6);
      doc.text(`$${q.calculated.total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, colTotalX, y + 6);
      
      y += rowHeight + 2;
    });

    y += 5;

    // 4. SUMMARY (RESUMEN)
    const startTotalsY = y;
    const totalsLeftX = margin + contentWidth - 65;
    doc.setTextColor(30, 64, 137);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("RESUMEN", totalsLeftX, y + 5);

    const totalProjectPriceLocal = state.quotes.reduce((sum, q) => sum + q.calculated.total, 0);
    const sub = totalProjectPriceLocal / (includeIva ? 1.16 : 1);
    const ivaValue = includeIva ? (totalProjectPriceLocal - sub) : 0;
    const finalTot = totalProjectPriceLocal;
    const anticipo = finalTot * 0.60;

    y += 12;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Subtotal:", totalsLeftX, y);
    doc.text(`$${sub.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth, y, { align: "right" });

    y += 6;
    doc.text(`IVA (${includeIva ? "16" : "0"}%):`, totalsLeftX, y);
    doc.text(`$${ivaValue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth, y, { align: "right" });

    y += 8;
    doc.setTextColor(30, 64, 137);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL:", totalsLeftX, y);
    doc.text(`$${finalTot.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth, y, { align: "right" });

    y += 5;
    
    // Pago / Anticipo box
    doc.setFillColor(30, 64, 137);
    doc.roundedRect(totalsLeftX, y, 65, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Anticipo (60%):", totalsLeftX + 4, y + 6.5);
    doc.text(`$${anticipo.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalsLeftX + 61, y + 6.5, { align: "right" });

    let leftY = y + 25;
    if (leftY > 235) {
      doc.addPage();
      leftY = margin;
    } else {
      leftY = y + 25;
    }
    
    doc.setTextColor(30, 64, 137);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("TÉRMINOS Y CONDICIONES", margin, leftY);

    leftY += 6;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    
    let baseTerms = [
      "1. Pago total del 100% al realizarse con Tarjeta de Crédito.",
      "2. Validez: 10 días a partir de la fecha de emisión.",
      "3. Tiempo de entrega estimado: 3 - 15 días según complejidad y cantidad.",
      "4. Garantía: 3 años en aluminio y 1 año en cristal."
    ];
    
    if (notesForPdf.trim()) {
      baseTerms.push(`5. Adicional: ${notesForPdf.trim()}`);
    }

    baseTerms.forEach((line) => {
      const splitLine = doc.splitTextToSize(line, contentWidth);
      doc.text(splitLine, margin, leftY);
      leftY += splitLine.length * 4.5;
    });

    leftY += 8;
    doc.setTextColor(30, 64, 137);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Asesor: ${state.businessDetails.name || "Aludev"}`, margin, leftY);
    
    leftY += 6;
    doc.setFontSize(11);
    doc.text(`Whatsapp: ${businessPhoneForPdf.trim() || "-"}`, margin, leftY);

    // 6. Footer
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Documento generado automáticamente por el sistema de cotización ALUDEV.", pageWidth / 2, pageHeight - 10, { align: "center" });


    // Save
    doc.save(`Cotizacion_${quoteCode}.pdf`);
  };

  // Generate and Download Clients POS Receipt for Thermal Printers
  const handleDownloadTicketPDF = () => {
    if (state.quotes.length === 0) {
      alert("El carro está vacío. Añade piezas al proyecto antes de generar el ticket.");
      return;
    }

    const ticketWidth = 80; // Standard thermal 80mm
    // Height is calculated dynamically based on number of items to make it a continuous ticket!
    const itemRowsCount = state.quotes.length;
    const ticketHeight = Math.max(160, 75 + itemRowsCount * 22 + 55); 

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [ticketWidth, ticketHeight]
    });

    const margin = 5;
    const contentWidth = ticketWidth - (margin * 2);
    let y = 8;

    // Helper: draw dotted line
    const drawDottedLine = (currentY: number) => {
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("------------------------------------------", ticketWidth / 2, currentY, { align: "center" });
      return currentY + 4;
    };

    // Header Branding
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(state.businessDetails.name.split("-")[0] || "ALUDEV CANCELERÍA", ticketWidth / 2, y, { align: "center" });
    y += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(state.businessDetails.address || "Taller de Aluminio y Vidrio", ticketWidth / 2, y, { align: "center" });
    y += 3.5;
    doc.text(`Tel: ${state.businessDetails.phone || "S/N"}`, ticketWidth / 2, y, { align: "center" });
    y += 4.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("TICKET DE COTIZACIÓN", ticketWidth / 2, y, { align: "center" });
    y += 4;

    y = drawDottedLine(y);

    // Client and metadata info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text(`Cliente: ${clientNameForPdf.trim() || "Público General"}`, margin, y);
    y += 3.5;
    
    const dateStr = new Date().toLocaleDateString("es-MX", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    doc.text(`Fecha: ${dateStr}`, margin, y);
    y += 3.5;
    doc.text(`Folio: ${ticketCode}`, margin, y);
    y += 4.5;

    y = drawDottedLine(y);

    // Itemized table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("CANT DESCRIPCIÓN MEDIDAS          IMPORTE", margin, y);
    y += 4;
    
    y = drawDottedLine(y);

    // Items
    doc.setFont("helvetica", "normal");
    state.quotes.forEach((q) => {
      // Formatted single row representation
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      
      const titleText = `${q.quantity} pz x ${q.name}`;
      doc.text(titleText, margin, y);
      
      // Calculate individual item total
      const totalCostFormatted = `$${Math.round(q.calculated.total).toLocaleString("es-MX")}`;
      doc.text(totalCostFormatted, ticketWidth - margin, y, { align: "right" });
      y += 3.5;

      // Dim and glass specifications
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      
      // Handle 0x0 values for manual concepts by omitting dimensions if 0
      const dims = q.widthCm > 0 && q.heightCm > 0 ? `${q.widthCm}x${q.heightCm} cm` : "Concepto Libre/Servicio";
      const dimsText = `Medidas: ${dims} | Línea: ${q.line}`;
      doc.text(dimsText, margin + 2, y);
      y += 3;

      let specText = `Aluminio: ${q.color}`;
      if (q.calculated.glasses[0]) {
        specText += ` | Vidrio: ${q.calculated.glasses[0].thickness}`;
      }
      doc.text(specText, margin + 2, y);
      y += 4.5;
    });

    y = drawDottedLine(y);

    // Totals Section
    const totalProjectPriceLocal = state.quotes.reduce((sum, q) => sum + q.calculated.total, 0);
    const sub = Math.round(totalProjectPriceLocal / (includeIva ? 1.16 : 1));
    const ivaValue = includeIva ? Math.round(totalProjectPriceLocal - sub) : 0;
    const finalTot = Math.round(totalProjectPriceLocal);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    if (includeIva) {
      doc.text("Subtotal:", margin, y);
      doc.text(`$${sub.toLocaleString("es-MX")}`, ticketWidth - margin, y, { align: "right" });
      y += 3.5;
      doc.text("I.V.A. (16%):", margin, y);
      doc.text(`$${ivaValue.toLocaleString("es-MX")}`, ticketWidth - margin, y, { align: "right" });
      y += 4.5;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("TOTAL NETO:", margin, y);
    doc.text(`$${finalTot.toLocaleString("es-MX")} MXN`, ticketWidth - margin, y, { align: "right" });
    y += 5.5;

    y = drawDottedLine(y);

    // Dotted terms & conditions
    if (notesForPdf) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text("CONDICIONES:", margin, y);
      y += 3;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      
      const wrappedNotes = doc.splitTextToSize(notesForPdf, contentWidth);
      wrappedNotes.forEach((lineText: string) => {
        doc.text(lineText, margin, y);
        y += 2.6;
      });
      y += 2;
    }

    y = drawDottedLine(y);

    // Ticket Footer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("¡GRACIAS POR SU PREFERENCIA!", ticketWidth / 2, y, { align: "center" });
    y += 3.5;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("ALUDEV Cancelería & Portones de Aluminio", ticketWidth / 2, y, { align: "center" });

    // Save File
    const sanitizedClientName = (clientNameForPdf.trim() || "Publico_General").replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Ticket_${ticketCode}_${sanitizedClientName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Sistema de Cotización Instantánea
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Calcula piezas individualizadas en segundos y compila proyectos integrales con cálculos de materiales.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={exportCutsToPackage}
            disabled={state.quotes.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 dark:bg-slate-950 hover:bg-slate-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
            id="export-cuts-button"
          >
            <Scissors size={14} />
            Optimizar Cortes ({state.quotes.length})
          </button>
          <button
            onClick={exportToInvoice}
            disabled={state.quotes.length === 0}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
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
          <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Calculator size={15} className="text-blue-600 dark:text-blue-400 dark:text-blue-300" />
                Nueva Pieza o Concepto
              </h2>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                ALUDEV Sistema
              </span>
            </div>

            {/* INTERACTIVE MODE TOGGLE SWITCH SLIDER */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl gap-1">
              <button 
                type="button"
                onClick={() => setIsCalculatedMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 ${isCalculatedMode ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 dark:hover:text-slate-200"}`}
              >
                Calculadora de Fórmulas
              </button>
              <button 
                type="button"
                onClick={() => setIsCalculatedMode(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition duration-200 ${!isCalculatedMode ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100 dark:hover:text-slate-200"}`}
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
                      activeCategory === "barandales" ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" :
                      activeCategory === "rejas" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                      "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {selectedCategoryLabel}
                    </span>
                  )}
                </div>

                {/* Template Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estructura Predeterminada</label>
                    <select
                      value={selectedFormulaId}
                      onChange={(e) => setSelectedFormulaId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                      <optgroup label="🪜 Barandales">
                        {state.formulas.filter(f => f.category === "barandales").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="🛡️ Rejas y Protecciones">
                        {state.formulas.filter(f => f.category === "rejas").map((form) => (
                          <option key={form.id} value={form.id}>
                            {form.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Etiqueta de Pieza (Nombre)</label>
                    <input
                      type="text"
                      placeholder="Ej: Ventana Recámara Principal"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Dimensions (Double Slider & Manual text Inputs) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Ancho (Ancho Vano)</span>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWidth(val);
                        }}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-right font-mono text-xs text-slate-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="1000"
                      value={width === "" ? 30 : width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>30 cm</span>
                      <span>150 cm</span>
                      <span>300 cm</span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Alto (Alto Vano)</span>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeight(val);
                        }}
                        className="w-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-right font-mono text-xs text-slate-800 dark:text-slate-100 font-bold"
                      />
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="1000"
                      value={height === "" ? 30 : height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                  <div className="border-l-4 border-blue-600 pl-3 py-1 mb-2 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase flex items-center gap-1.5">
                      <Sparkles size={13} className="text-blue-600 dark:text-blue-300" />
                      Visualización Técnica Semicad (Plano Activo)
                    </h3>
                    <label className="cursor-pointer text-[10px] bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700/50 font-bold flex items-center gap-1 transition">
                      <ImagePlus size={12} />
                      {designImageUrl ? "Cambiar Diseño" : "Subir Diseño Personalizado"}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDesignImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                  
                  {designImageUrl ? (
                    <div className="relative bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-col items-center justify-center shadow-inner overflow-hidden min-h-[180px]">
                      <img src={designImageUrl} alt="Diseño personalizado" className="max-h-[220px] object-contain rounded-xl" />
                      <button 
                        onClick={() => setDesignImageUrl("")} 
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition"
                        title="Eliminar diseño"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-2 left-2 bg-slate-800 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm uppercase tracking-wider">
                        Diseño / Plano Adjunto
                      </span>
                    </div>
                  ) : (
                    <DynamicWindowPreview
                      category={state.formulas.find(f => f.id === selectedFormulaId)?.category || "ventanas"}
                      width={width as number}
                      height={height as number}
                      color={color}
                      glassType={state.glasses.find(g => g.id === selectedGlassId)?.thickness || "4mm"}
                    />
                  )}
                </div>

                <div className="border-l-4 border-emerald-500 pl-3 py-1 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">2. Especificación de Sistema & Vidrios</h3>
                </div>

                {/* Profile Line & Glass Type selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Línea de Aluminio</label>
                    <select
                      value={line}
                      onChange={(e) => setLine(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Color del Aluminio</label>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">{color}</span>
                    </div>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      {COLORS.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    
                    {/* Visual Round Swatches Grid */}
                    <div className="flex flex-wrap gap-2.5 mt-2.5 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:bg-slate-800">
                      {[
                        { name: "Blanco (Pintado)", hex: "#f8fafc", border: "border-slate-300 dark:border-slate-600", label: "Blanco" },
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
                              isSelected ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900 scale-105 shadow-sm" : "opacity-80"
                            }`}
                            style={{ backgroundColor: sw.hex }}
                            title={sw.name}
                          >
                            {isSelected && (
                              <span className={`w-1 h-1 rounded-full ${color.toLowerCase().includes("negro") || color.toLowerCase().includes("bronce") || color.toLowerCase().includes("duranodick") ? "bg-white dark:bg-slate-900" : "bg-slate-800 dark:bg-slate-950"}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cristal o Material de Relleno</label>
                    <select
                      value={selectedGlassId}
                      onChange={(e) => setSelectedGlassId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cantidad</label>
                      <input
                        type="number"
                        value={qty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQty(val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 leading-tight">Mano Obra<br/>(Minutos)</label>
                      <input
                        type="number"
                        value={laborMinutes}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLaborMinutes(val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-600 dark:text-blue-300 mb-1 font-bold">P. Unitario</label>
                      <input
                        type="number"
                        placeholder="Auto"
                        value={overrideTotal}
                        onChange={(e) => {
                          const val = e.target.value;
                          setOverrideTotal(val);
                        }}
                        className="w-full bg-blue-50/50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-700/50 rounded-xl px-2 py-2 text-blue-800 dark:text-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center font-bold placeholder-blue-300"
                      />
                    </div>
                  </div>
                </div>
                {/* SECTION 3: COSTING AND MARGIN MARKUPS (Aluminio Facil Excel matching) */}
                <div className="border-l-4 border-blue-500 pl-3 py-1 pt-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">3. Parámetros de Utilidad & Merma</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 dark:bg-slate-800 p-4 rounded-xl border border-dashed border-blue-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <Coins size={12} className="text-blue-500 dark:text-blue-300" />
                        Margen de Utilidad
                      </span>
                      <div className="flex items-center text-blue-700 dark:text-blue-300 font-mono font-bold">
                        +<input type="number" value={profitMargin} onChange={(e) => setProfitMargin(e.target.value)} className="w-12 bg-transparent text-right outline-none focus:border-blue-400 border-b border-transparent" />%
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="5"
                      value={profitMargin}
                      onChange={(e) => setProfitMargin(Number(e.target.value))}
                      className="w-full h-1.5 bg-blue-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Costo Neto (0%)</span>
                      <span>50%</span>
                      <span>300%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <TrendingDown size={12} className="text-emerald-500 dark:text-emerald-400" />
                        Factor Desperdicio (Merma)
                      </span>
                      <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                        +<input type="number" value={wastePercentage} onChange={(e) => setWastePercentage(e.target.value)} className="w-12 bg-transparent text-right outline-none focus:border-emerald-400 border-b border-transparent" />%
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={wastePercentage}
                      onChange={(e) => setWastePercentage(Number(e.target.value))}
                      className="w-full h-1.5 bg-emerald-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>0% (Preciso)</span>
                      <span>10% (Taller)</span>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200/60">

                    <div className="flex flex-col text-slate-700 dark:text-slate-200">
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
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                          includeIva ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="sm:col-span-2 flex justify-between items-center pt-2.5 border-t border-dashed border-slate-200/60">
                    <div className="flex flex-col text-slate-700 dark:text-slate-200">
                      <span className="text-xs font-bold leading-tight flex items-center gap-1">
                        Mostrar Desglose y Costo de Material en PDF
                      </span>
                      <span className="text-[10px] text-slate-400 leading-normal">Incluye el costo puro y la lista de materiales visible para el cliente.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMaterialCost(!showMaterialCost)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showMaterialCost ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-750"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                          showMaterialCost ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // MODAL MANUAL / LIBRE FLOW (OLD HERO LAYOUT)
              <>
                <div className="border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 dark:bg-blue-950/60 rounded-r-lg pr-2">
                  <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase">Configuración de Concepto Manual Libre</h3>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">Ingresa los datos del concepto personalizado, reparaciones o servicios de taller.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción del Producto / Servicio</label>
                    <input
                      type="text"
                      placeholder="Ej: Portón automático de aluminio duela 10cm, con instalación y kit de pistones batientes"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Ancho (cm) <span className="text-[9px] font-normal opacity-70">(Opcional)</span></label>
                      <input
                        type="number"
                        placeholder="Ej: 120"
                        value={width}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWidth(val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Alto (cm) <span className="text-[9px] font-normal opacity-70">(Opcional)</span></label>
                      <input
                        type="number"
                        placeholder="Ej: 150"
                        value={height}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHeight(val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Precio Unitario ($ MXN)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={customPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomPrice(val);
                          }}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2 text-slate-800 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cantidad de Unidades</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={qty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQty(val);
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-sans text-center"
                      />
                    </div>
                  </div>

                  {/* Custom manual selections */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3.5">
                    <span className="block text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider font-mono">
                      🛠️ Personalizar Especificaciones de Concepto:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Checkboxes */}
                      <div className="space-y-4 pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={manualHasGlass}
                            onChange={(e) => setManualHasGlass(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-400 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-600 h-4 w-4 mt-0.5"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-100">¿Lleva Cristal / Vidrio?</span>
                            <span className="block text-[9.5px] text-slate-500 dark:text-slate-300">Tildar si el concepto incluye cristal instalado</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={manualMaterialIncluded}
                            onChange={(e) => setManualMaterialIncluded(e.target.checked)}
                            className="rounded text-amber-600 focus:ring-amber-400 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-600 h-4 w-4 mt-0.5"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-700 dark:text-slate-100">¿Con material incluido?</span>
                            <span className="block text-[9.5px] text-slate-500 dark:text-slate-300">Desmarcar para cotizar sólo mano de obra o reparación</span>
                          </div>
                        </label>
                      </div>

                      {/* Select Selectors */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Color / Tono de Aluminio:</label>
                          <select
                            value={manualAluColor}
                            onChange={(e) => setManualAluColor(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="Blanco (Pintado)">Blanco (Pintado)</option>
                            <option value="Natural (Anodizado)">Natural (Anodizado)</option>
                            <option value="Negro">Negro</option>
                            <option value="Bronce">Bronce</option>
                            <option value="Champagne">Champagne</option>
                            <option value="Nogal (Madera)">Nogal (Madera)</option>
                            <option value="Sin Aluminio (Solo Servicio/Reparación)">Sin Aluminio (Solo Servicio)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9.5px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tono de Cristal:</label>
                          <select
                            value={manualGlassTone}
                            onChange={(e) => setManualGlassTone(e.target.value)}
                            disabled={!manualHasGlass}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-slate-100 dark:bg-slate-700 disabled:dark:bg-slate-950 disabled:text-slate-400 disabled:cursor-not-allowed"
                          >
                            <option value="Claro">Claro</option>
                            <option value="Filtrasol">Filtrasol</option>
                            <option value="Tintex">Tintex</option>
                            <option value="Esmerilado">Esmerilado</option>
                            <option value="Reflectivo">Reflectivo</option>
                            <option value="Humo / Satinado">Humo / Satinado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Manual Concept Image Upload */}
                  <div className="mt-3">
                    <label className="cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 flex items-center justify-between transition-all">
                      <div className="flex items-center gap-2">
                        <ImagePlus size={16} className="text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold">{designImageUrl ? "Cambiar Imagen de Referencia / Plano" : "Adjuntar Imagen de Referencia / Plano"}</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setDesignImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                    {designImageUrl && (
                      <div className="mt-2 relative inline-block">
                        <img src={designImageUrl} alt="Referencia" className="h-32 object-contain rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm" />
                        <button 
                          onClick={() => setDesignImageUrl("")} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Optional decorative helper */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 py-2.5 px-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                    <span className="text-blue-500 dark:text-blue-300 font-bold">ℹ️</span>
                    <div>
                      Este concepto se sumará directamente a los subtotales de la cotización actual, respetando los datos de color de aluminio, cristal y tipo de servicio seleccionados para el PDF final.
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* CONFIGURATION VALIDATION MESSAGES */}
            {isCalculatedMode && validationIssues.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <AlertCircle size={14} className="text-blue-500 dark:text-blue-300" />
                  <span>Validación de Aludev ({selectedCategoryLabel})</span>
                </div>
                <div className="space-y-1.5">
                  {validationIssues.map((issue, idx) => (
                    <div 
                      key={idx} 
                      className={`text-xs p-2.5 rounded-lg flex items-start gap-2 border ${
                        issue.type === "error" 
                          ? "bg-red-50 text-red-905 border-red-100 dark:bg-red-950/25 dark:text-red-300 dark:border-red-900/40 font-semibold" 
                          : "bg-amber-50 text-amber-905 border-blue-100 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/40"
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
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-full text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-2">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Cálculo de Cotización</span>
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
                          <strong className="font-mono text-blue-600 dark:text-blue-300">+${Math.round((previewResult.baseCost * (1 + previewResult.profitMarginPercent / 100) * 0.16) / qty).toLocaleString("es-MX")}</strong>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">Concepto manual libre con precio establecido directamente.</p>
                  )}

                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Total Unitario:</span>
                    <span className="text-2xl font-black text-slate-800 dark:text-slate-50">
                      {previewResult.hasManualOverride && <span className="text-xs text-blue-500 dark:text-blue-300 font-bold mr-1 align-middle">(Manual)</span>}
                      ${Math.round(previewResult.total / (qty || 1)).toLocaleString("es-MX")} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">MXN</span>
                    </span>
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
                    className={`mt-3.5 w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold py-2 rounded-lg text-center transition shadow-sm ${isCalculatedMode ? "text-blue-900 dark:text-blue-100" : "text-amber-900"}`}
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
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-indigo-500" />
                Desglose Físico y Descuentos Asociados (Instantáneo)
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {/* Profiles section */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Perfiles de Aluminio</span>
                  {previewResult.profiles.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <div>
                        <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold">{p.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {p.name} - Medidas de corte:{" "}
                          <strong>
                            {p.cuts[0]?.sizeCm}cm ({p.cuts[0]?.qty} piezas, ángulo {p.cuts[0]?.angle})
                          </strong>
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 font-mono">
                        {p.meters.toFixed(1)}m | ${Math.round(p.cost)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Glass section */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Vidriería</span>
                  {previewResult.glasses.map((g: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <div>
                        <p className="text-xs text-slate-800 dark:text-slate-100 font-semibold">Cristal Espesor {g.thickness}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Lámina cortada:{" "}
                          <strong>
                            {g.widthCm} x {g.heightCm}cm ({g.qty} pzas)
                          </strong>
                        </p>
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200 font-mono">
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
                      <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 py-1 px-2.5 rounded border border-slate-100 dark:border-slate-700/50">
                        <span className="text-xs text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{acc.name}</span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
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
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between h-full min-h-[500px]">
            <div>
              {/* Header with Title and Clear Button */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Grid size={16} className="text-blue-600 dark:text-blue-300" />
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
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-4 text-xs font-bold gap-1">
                  <button
                    onClick={() => setBasketTab("venta")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition ${
                      basketTab === "venta"
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    Detalle de Venta
                  </button>
                  <button
                    onClick={() => setBasketTab("taller")}
                    className={`flex-1 py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                      basketTab === "taller"
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <Hammer size={12} className="text-blue-600 dark:text-blue-300" />
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
                      className="p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 rounded-xl relative group hover:border-slate-300 dark:border-slate-600 hover:bg-slate-100 transition"
                    >
                      {editingQuoteId !== q.id ? (
                        <>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingQuoteId(q.id);
                                setEditName(q.name);
                                setEditDescription(q.customDescription || "");
                                setEditQty(q.quantity);
                              }}
                              className="text-slate-400 hover:text-blue-600 dark:text-blue-300 transition"
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
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-xs pr-14 flex items-center gap-1">
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
                                <div className="mt-2 p-2 bg-sky-50/50 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] border border-sky-100/60 leading-relaxed font-sans italic">
                                  <span className="font-bold text-sky-800 not-italic block text-[9px] uppercase tracking-wider mb-0.5">Descripción para cliente:</span>
                                  "{q.customDescription}"
                                </div>
                            ) : (
                              <p className="text-[10px] text-slate-400 mt-1 italic">
                                Usando desglose técnico automático.
                              </p>
                            )}

                            {/* Optional Attached Design Image */}
                            {q.designImageUrl && (
                              <div className="mt-2.5">
                                <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Referencia Adjunta:</span>
                                <img src={q.designImageUrl} alt="Plano o Diseño Adjunto" className="h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm opacity-90 hover:opacity-100 hover:scale-[1.02] cursor-pointer transition-all" onClick={() => window.open(q.designImageUrl, '_blank')} />
                              </div>
                            )}

                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              {/* Quantity Stepper Editor */}
                              <div className="flex items-center bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => changeBasketItemQuantity(q.id, q.quantity - 1)}
                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-extrabold transition font-mono"
                                  title="Disminuir cantidad"
                                >
                                  -
                                </button>
                                <span className="px-2.5 py-0.5 text-xs font-bold font-mono text-slate-800 dark:text-slate-100">
                                  {q.quantity} pz
                                </span>
                                <button
                                  type="button"
                                  onClick={() => changeBasketItemQuantity(q.id, q.quantity + 1)}
                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-[11px] font-extrabold transition font-mono"
                                  title="Aumentar cantidad"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-[9px] bg-blue-105 text-blue-800 dark:text-blue-200 px-1.5 py-1 rounded font-mono font-medium">
                                {q.calculated.glasses[0]?.id === "glass-none" ? "Sin vidrio" : q.calculated.glasses[0]?.thickness}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-slate-200/50">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">Editando Renglón</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  updateQuoteItem(q.id, {
                                    name: editName,
                                    customDescription: editDescription.trim() || undefined
                                  });
                                  changeBasketItemQuantity(q.id, Number(editQty) || 1);
                                  setEditingQuoteId(null);
                                }}
                                className="flex items-center gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/400 text-white py-1 px-2.5 rounded-lg transition font-medium"
                              >
                                <Check size={10} />
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingQuoteId(null)}
                                className="flex items-center gap-1 text-[10px] bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 py-1 px-2.5 rounded-lg transition font-medium"
                              >
                                <X size={10} />
                                Cancelar
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Nombre Corto de Pieza</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Cantidad (pz)</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={editQty}
                                  onChange={(e) => { const val = e.target.value; setEditQty(val); }}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Descripción para el Cliente (Sin Tecniscismos)</label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const gText = q.calculated.glasses[0]?.id === "glass-none" || !q.calculated.glasses[0]
                                      ? "sin incluir vidrio (solo perfilería)"
                                      : `con cristal ${q.calculated.glasses[0]?.thickness.toLowerCase()}`;
                                    setEditDescription(`Cancelería de aluminio en color ${q.color.toLowerCase()} para ${q.name.toLowerCase()} de ${q.widthCm} x ${q.heightCm} cm de alto, ${gText} e instalación premium de taller.`);
                                  }}
                                  className="text-[9px] text-blue-600 dark:text-blue-300 hover:underline font-semibold"
                                >
                                  Sugerir texto simple
                                </button>
                              </div>
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Escribe la descripción simplificada aquí. Esto ocultará los milímetros y perfiles técnicos al cliente en el PDF."
                                className="w-full h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-normal resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Subtotal con Mano Obra:</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
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
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Scissors size={13} className="text-blue-600 dark:text-blue-300" />
                        Progreso de Cortes en Sierra
                      </span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{progressPercent}% ({completedCutsCount}/{totalCutsCount})</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${progressPercent}%` }} 
                        className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={handlePrintWorkshopPlan}
                        className="text-[10px] text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:text-blue-200 font-bold flex items-center gap-1 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700/50 px-2.5 py-1 rounded shadow-sm transition"
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
                          className="text-[9px] text-slate-500 dark:text-slate-400 hover:text-red-500 transition"
                        >
                          Reiniciar Listado
                        </button>
                      )}
                    </div>
                  </div>

                  {/* SECTION 1: CONSOLIDATED MATERIALS LIST */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <ShoppingBag size={10} className="text-slate-500 dark:text-slate-400" />
                      Plan de Compra de Almacén
                    </h4>
                    
                    {/* Raw profiles list with Bar calculation */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block border-b border-slate-200 dark:border-slate-700 pb-1 uppercase font-bold">1. Perfiles de Aluminio (Barras 6.1m)</span>
                      {Object.values(aggregatedProfiles).map((p, i) => (
                        <div key={i} className="flex justify-between items-start text-xs border-b border-dashed border-slate-150 last:border-none pb-1.5 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{p.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">{p.line} | {p.color}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-800 dark:text-slate-100 text-xs">{p.barCount} bar(s)</span>
                            <span className="block text-[9px] text-slate-400 font-mono">({p.meters.toFixed(1)}m req.)</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Consolidated glasses */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block border-b border-slate-200 dark:border-slate-700 pb-1 uppercase font-bold">2. Vidriería</span>
                      {Object.values(aggregatedGlasses).map((g, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{g.thickness}</p>
                            <p className="text-[9px] text-slate-400">{g.count} pzas de cristal necesarias</p>
                          </div>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                            {g.areaM2.toFixed(2)} m²
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Consolidated hardware */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200/60 space-y-2">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block border-b border-slate-200 dark:border-slate-700 pb-1 uppercase font-bold">3. Accesorios / Herrajes</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {Object.values(aggregatedAccessories).map((a, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700/50">
                            <span>{a.name}</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{a.qty} pz</span>
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
                              ? "bg-slate-100 border-slate-300 dark:border-slate-600 opacity-60 line-through text-slate-400"
                              : "bg-white dark:bg-slate-900 border-slate-200/60 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:bg-slate-800"
                          }`}
                        >
                          <button
                            type="button"
                            className={`p-0.5 shrink-0 ${completedCuts[c.stableId] ? "text-blue-600 dark:text-blue-300" : "text-slate-300"}`}
                          >
                            {completedCuts[c.stableId] ? (
                              <CheckSquare size={15} />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="font-bold font-mono text-sm tracking-tight text-blue-700 dark:text-blue-300">
                                {c.sizeCm} cm
                              </span>
                              <span className={`text-[9px] px-1.5 rounded font-bold font-mono ${c.angle.includes("45") ? "bg-cyan-50 text-cyan-700 border border-cyan-100" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                                {c.angle.includes("45") ? "45° Mitra" : "90° Recto"}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
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
                <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/50">
                    <Download size={12} className="text-blue-600 dark:text-blue-300" />
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Exportación PDF Profesional</span>
                  </div>
                  
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Nombre del Cliente</label>
                        <input
                          type="text"
                          value={clientNameForPdf}
                          onChange={(e) => setClientNameForPdf(e.target.value)}
                          placeholder="Ej: Ignacio Martínez"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Teléfono del Cliente</label>
                        <input
                          type="text"
                          value={clientPhoneForPdf}
                          onChange={(e) => setClientPhoneForPdf(e.target.value)}
                          placeholder="Ej: 555-123-4567"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Dirección del Cliente</label>
                      <input
                        type="text"
                        value={clientAddressForPdf}
                        onChange={(e) => setClientAddressForPdf(e.target.value)}
                        placeholder="Ej: Calle Reforma 123"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div className="pt-2 border-t border-slate-200/50">
                      <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-2">Datos de la Empresa (Mostrar en PDF)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Dirección / Sucursal</label>
                          <input
                            type="text"
                            value={businessAddressForPdf}
                            onChange={(e) => setBusinessAddressForPdf(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Teléfono / WhatsApp</label>
                          <input
                            type="text"
                            value={businessPhoneForPdf}
                            onChange={(e) => setBusinessPhoneForPdf(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Condiciones comerciales / Garantías</label>
                      <textarea
                        value={notesForPdf}
                        onChange={(e) => setNotesForPdf(e.target.value)}
                        placeholder="Condiciones de pago..."
                        className="w-full h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 text-[10px] focus:ring-1 focus:ring-blue-500 focus:outline-none leading-normal resize-none"
                      />
                    </div>
                    <div className="pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={simplifyPdf}
                          onChange={(e) => setSimplifyPdf(e.target.checked)}
                          className="rounded border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-300 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold leading-tight">
                          Simplificar PDF (Ocultar cortes y desgloses milimétricos técnicos)
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleDownloadPDF}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold text-[11.5px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98]"
                        title="Cotización formal en PDF tamaño carta"
                      >
                        <FileText size={13} />
                        Formato Carta
                      </button>
                      
                      <button
                        onClick={handleDownloadTicketPDF}
                        className="w-full py-2.5 bg-slate-850 hover:bg-slate-750 text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-750 dark:border-slate-700 font-bold text-[11.5px] rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
                        title="Formato simplificado para ticket térmico de 80mm"
                      >
                        <Printer size={13} className="text-blue-400 dark:text-blue-300" />
                        Ticket Térmico (80mm)
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs font-mono pt-1">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Mano de obra total:</span>
                    <span>${Math.round(totalLaborPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Materia prima (aluminio):</span>
                    <span>${Math.round(totalProfilesPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Materia prima (vidrios):</span>
                    <span>${Math.round(totalGlassesPrice).toLocaleString("es-MX")}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Herrajes totales:</span>
                    <span>${Math.round(totalAccessoriesPrice).toLocaleString("es-MX")}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Importe Proyecto Total:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                      ${Math.round(totalProjectPrice).toLocaleString("es-MX")}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">MXN Neto</span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={exportCutsToPackage}
                    className="py-2.5 bg-slate-800 dark:bg-slate-950 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Scissors size={13} />
                    Extraer Cortes
                  </button>
                  <button
                    onClick={exportToInvoice}
                    className="py-2.5 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
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
