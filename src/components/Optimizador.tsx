/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CutRequest, ProfileOptimizationResult } from "../types";
import { optimizeCuts } from "../utils/cutOptimizer";
import { useWorkshop } from "../context/WorkshopContext";
import {
  Scissors,
  Plus,
  Trash2,
  RefreshCw,
  TrendingDown,
  Info,
  Download,
  Database,
  Printer,
  Grid
} from "lucide-react";

export const Optimizador: React.FC<{
  cutsToOptimize: CutRequest[];
  setCutsToOptimize: React.Dispatch<React.SetStateAction<CutRequest[]>>;
}> = ({ cutsToOptimize, setCutsToOptimize }) => {
  const { state } = useWorkshop();

  // Settings
  const [barLength, setBarLength] = useState<number>(610); // Default commercial length is 6.1m (610 cm)
  const [kerf, setKerf] = useState<number>(0.4); // Saw blade kerf: 4mm (0.4 cm)

  // Quick inputs for manual cuts
  const [newCutName, setNewCutName] = useState<string>("");
  const [newCutLength, setNewCutLength] = useState<number>(120);
  const [newCutQty, setNewCutQty] = useState<number>(2);
  const [newCutAngle, setNewCutAngle] = useState<"90°" | "45°">("90°");
  const [newCutProfile, setNewCutProfile] = useState<string>("Perfil Nacional 2″");

  // Multi-profile optimization results
  const [optimizedResults, setOptimizedResults] = useState<ProfileOptimizationResult[]>([]);

  // Add custom manual cut
  const handleAddCut = () => {
    if (newCutLength <= 0 || newCutLength > barLength) {
      alert(`La longitud de corte debe ser mayor a 0 y menor a la barra comercial (${barLength}cm).`);
      return;
    }
    const newCut: CutRequest = {
      id: "cut-manual-" + Date.now(),
      name: newCutName || "Corte Auxiliar",
      lengthCm: newCutLength,
      quantity: newCutQty,
      angle: newCutAngle,
      profileName: newCutProfile
    };

    setCutsToOptimize((prev) => [...prev, newCut]);
    // reset brief inputs
    setNewCutName("");
  };

  const handleDeleteCut = (id: string) => {
    setCutsToOptimize((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearCuts = () => {
    if (window.confirm("¿Estás seguro de vaciar el paquete de cortes actual?")) {
      setCutsToOptimize([]);
      setOptimizedResults([]);
    }
  };

  // Run the multi-profile optimization
  const handleOptimize = () => {
    if (cutsToOptimize.length === 0) {
      alert("No hay piezas de aluminio en la lista de corte para optimizar.");
      return;
    }

    // Group cuts by profile name
    const groupedCuts: { [profile: string]: CutRequest[] } = {};
    cutsToOptimize.forEach((cut) => {
      if (!groupedCuts[cut.profileName]) {
        groupedCuts[cut.profileName] = [];
      }
      groupedCuts[cut.profileName].push(cut);
    });

    // Run solver for each profile group
    const results: ProfileOptimizationResult[] = [];
    Object.keys(groupedCuts).forEach((profileName) => {
      const solverResult = optimizeCuts(
        groupedCuts[profileName],
        barLength,
        kerf,
        profileName
      );
      results.push(solverResult);
    });

    setOptimizedResults(results);
  };

  // Run automatically when cuts are changes asynchronously
  useEffect(() => {
    if (cutsToOptimize.length > 0) {
      handleOptimize();
    } else {
      setOptimizedResults([]);
    }
  }, [cutsToOptimize, barLength, kerf]);

  // Quick preset loading helper: test datasets
  const loadDemoCuts = () => {
    const demoCutsDataset: CutRequest[] = [
      { id: "dem-1", name: "Cabezal Sup - Ventana A", lengthCm: 125.4, quantity: 4, angle: "90°", profileName: "Cabezal Nacional 2″" },
      { id: "dem-2", name: "Jamba Lat - Ventana A", lengthCm: 153.2, quantity: 4, angle: "90°", profileName: "Jamba Nacional 2″" },
      { id: "dem-3", name: "Traslape - Ventana B", lengthCm: 180.5, quantity: 2, angle: "90°", profileName: "Traslape Nacional 2″" },
      { id: "dem-4", name: "Cabezal - Ventana B", lengthCm: 90.0, quantity: 3, angle: "90°", profileName: "Cabezal Nacional 2″" },
      { id: "dem-5", name: "Cerco Vertical - Portón", lengthCm: 210.0, quantity: 4, angle: "45°", profileName: "Cerco Nacional 3″" }
    ];
    setCutsToOptimize(demoCutsDataset);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Optimización Inteligente de Perfiles
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Resuelve el desperdicio agrupando múltiples cortes de aluminio para barras comerciales de mermas mínimas.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {cutsToOptimize.length === 0 && (
            <button
              onClick={loadDemoCuts}
              className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              Cargar Paquete de Prueba
            </button>
          )}
          {cutsToOptimize.length > 0 && (
            <button
              onClick={handleClearCuts}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl border border-red-200 transition"
            >
              Vaciar Cortes
            </button>
          )}
          <button
            onClick={() => window.print()}
            disabled={optimizedResults.length === 0}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white disabled:opacity-40 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
          >
            <Printer size={13} />
            Imprimir Guía de Corte
          </button>
        </div>
      </div>

      {/* Grid: Global Settings & Manual inputs on left, Results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* INPUT PANEL (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-blue-500 dark:text-blue-300" />
              1. Configuración de Sierras y Barras
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Barra de Fábrica (cm)</label>
                <select
                  value={barLength}
                  onChange={(e) => setBarLength(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="610">610 cm (Estándar 6.1m)</option>
                  <option value="420">420 cm (Estándar 4.2m)</option>
                  <option value="300">300 cm (Sobrante 3.0m)</option>
                  <option value="500">500 cm (Medida 5m)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Grosor de Disco-Sierra (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1.5"
                  value={kerf}
                  onChange={(e) => setKerf(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-100 text-xs font-mono font-bold"
                  title="Saw cut loss per cut (kerf)"
                />
              </div>
            </div>
          </div>

          {/* ADD CUT MANUAL INPUTS */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <Plus size={14} className="text-blue-500 dark:text-blue-300" />
              Agregar Cortes Adicionales
            </h3>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400">Tipo de Perfil / Línea</label>
                  <select
                    value={newCutProfile}
                    onChange={(e) => setNewCutProfile(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    {Array.from(new Set(state.profiles.map((p) => p.name))).map((pName) => (
                      <option key={pName} value={pName}>
                        {pName}
                      </option>
                    ))}
                    <option value="Perfil Nacional 2″">Cabezal 2″ genérico</option>
                    <option value="Perfil Nacional 3″">Cabezal 3″ genérico</option>
                    <option value="Vidrio Templado Auxiliar">Bisel Espesores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Descripción / No. pieza</label>
                  <input
                    type="text"
                    placeholder="Ej: Marco Cocina"
                    value={newCutName}
                    onChange={(e) => setNewCutName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400">Longitud (cm)</label>
                  <input
                    type="number"
                    value={newCutLength}
                    onChange={(e) => setNewCutLength(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs font-mono font-bold text-center focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Cantidad (pz)</label>
                  <input
                    type="number"
                    min="1"
                    value={newCutQty}
                    onChange={(e) => setNewCutQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs text-center font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400">Ángulo de inglete</label>
                  <select
                    value={newCutAngle}
                    onChange={(e) => setNewCutAngle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="90°">90° Recto</option>
                    <option value="45°">45° Sesgado</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleAddCut}
                className="w-full mt-2.5 py-2 bg-slate-800 dark:bg-slate-950 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                + Incluir a la Planificación
              </button>
            </div>
          </div>

          {/* ACTIVE QUEUED CUTS LIST */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between h-96">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest pb-2 border-b border-slate-100 dark:border-slate-700/50 mb-2 flex justify-between items-center">
                <span>Lista Escaneada de Cortes ({cutsToOptimize.length})</span>
                {cutsToOptimize.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">Más grande a más chico</span>
                )}
              </h3>

              <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
                {cutsToOptimize.map((cut) => (
                  <div
                    key={cut.id}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl relative group flex justify-between items-center transition"
                  >
                    <div className="max-w-[150px] truncate">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">{cut.lengthCm} cm</p>
                      <p className="text-[9px] text-slate-400 truncate tracking-tight">{cut.profileName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded font-bold font-mono">
                        {cut.quantity} pz
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">{cut.angle}</span>
                      <button
                        onClick={() => handleDeleteCut(cut.id)}
                        className="text-slate-300 hover:text-red-500 transition shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}

                {cutsToOptimize.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <p className="text-xs">Sin cortes activos.</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                      Añade cortes manuales arriba, o presiona "Optimizar Cortes" en el Cotizador.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {cutsToOptimize.length > 0 && (
              <button
                onClick={handleOptimize}
                className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <RefreshCw size={13} />
                Optimizar Todo ({cutsToOptimize.length} Cuts)
              </button>
            )}
          </div>
        </div>

        {/* METICULOUS DEEP OPTIMIZATION RESULTS PANEL (Col span 3) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest pb-3 border-b border-slate-100 dark:border-slate-700/50 mb-4 flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Scissors size={15} className="text-violet-600" />
                2. Planos de Corte y Despiece Óptimo
              </span>
              {optimizedResults.length > 0 && (
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                  Soluble con Máximo Rendimiento
                </span>
              )}
            </h3>

            {/* Loop through each group solution */}
            <div className="space-y-8" id="opt-results-container">
              {optimizedResults.map((profRes, profIndex) => {
                // Total bars buying cost simulation if prices are found
                const matchInvProf = state.profiles.find((p) => p.name === profRes.profileName);
                const pricePerMeter = matchInvProf ? matchInvProf.pricePerMeter : 45;
                const costOfOneBar = (barLength / 100) * pricePerMeter;
                const totalMetersWanted = profRes.bars.reduce((sum, b) => sum + b.usedLengthCm, 0) / 100;
                const totalCostNeeded = profRes.totalBarsNeeded * costOfOneBar;

                return (
                  <div key={profIndex} className="space-y-4 border-b border-slate-100 dark:border-slate-700/50 pb-6 last:border-none">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm font-sans">
                          {profRes.profileName}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Barras comerciales de {barLength}cm | Pérdida de sierra: {kerf}cm (grosor disco)
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-1 rounded font-bold font-mono">
                          Comprar: {profRes.totalBarsNeeded} barras de {barLength / 100}m
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          Desperdicio Promedio: <strong className="text-rose-500">{profRes.averageWastePercent}%</strong>
                        </p>
                      </div>
                    </div>

                    {/* PHYSICAL VISUAL RENDER OF EACH BAR */}
                    <div className="space-y-4">
                      {profRes.bars.map((bar) => {
                        let accumulatedPositionCm = 0;

                        return (
                          <div key={bar.barIndex} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              <span><strong>Barra #{bar.barIndex}</strong></span>
                              <span>Pérdida/Sobra: <strong className="text-rose-600 font-bold">{bar.wasteCm.toFixed(1)} cm ({bar.wastePercent}%)</strong></span>
                            </div>

                            {/* BAR SEGMENTS VISUAL COMPONENT */}
                            <div className="h-6 w-full bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden flex border border-slate-300 dark:border-slate-600 relative">
                              {bar.cuts.map((cut, cutIdx) => {
                                const widthPercent = (cut.lengthCm / barLength) * 100;
                                const kerfWidthPercent = (kerf / barLength) * 100;
                                accumulatedPositionCm += cut.lengthCm;
                                
                                return (
                                  <React.Fragment key={cutIdx}>
                                    {/* Real Cut Block */}
                                    <div
                                      style={{ width: `${widthPercent}%` }}
                                      className="bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 h-full border-r border-slate-900/30 flex items-center justify-center text-[9px] text-white font-mono font-bold truncate px-1 transition relative group cursor-help"
                                      title={`Pieza: ${cut.name} | Medida: ${cut.lengthCm}cm | Ángulo: ${cut.angle}`}
                                    >
                                      <span>{cut.lengthCm}cm</span>
                                      
                                      {/* Minimal Tooltip hover info */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 dark:bg-slate-950 text-white text-[9px] p-2 rounded hidden group-hover:block z-20 whitespace-normal border border-slate-705 shadow-xl w-32 font-sans font-normal leading-tight">
                                        <p className="font-semibold">{cut.name}</p>
                                        <p className="text-blue-300 mt-0.5 font-mono">{cut.lengthCm} cm</p>
                                        <p className="text-slate-400">Mitra: {cut.angle}</p>
                                      </div>
                                    </div>

                                    {/* Saw kerf loss block */}
                                    {cutIdx < bar.cuts.length - 1 && (
                                      <div
                                        style={{ width: `${kerfWidthPercent}%` }}
                                        className="bg-slate-800 dark:bg-slate-950 h-full shrink-0"
                                        title={`Corte disco sierra: ${kerf}cm`}
                                      />
                                    )}
                                  </React.Fragment>
                                );
                              })}

                              {/* Wastage (merma/sobra) Block in Red */}
                              {bar.wasteCm > 0 && (
                                <div
                                  style={{ width: `${(bar.wasteCm / barLength) * 100}%` }}
                                  className="bg-rose-100 hover:bg-rose-200 text-rose-800 h-full flex items-center justify-center text-[8px] font-mono font-semibold uppercase shrink-0 transition"
                                  title={`Sobrante no utilizado: ${bar.wasteCm.toFixed(1)}cm`}
                                >
                                  <span>{bar.wasteCm.toFixed(0)}cm merma</span>
                                </div>
                              )}
                            </div>

                            {/* TEXT LIST OF CUTS FOR THE MANUAL CUTTER WORKER */}
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                              <span className="text-slate-400">Guía de Cortes:</span>
                              {bar.cuts.map((cut, cutIdx) => (
                                <span key={cutIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-200 font-bold">
                                  {cutIdx + 1}° Cortar <span className="text-blue-600 dark:text-blue-300 font-serif">{cut.lengthCm} cm</span> ({cut.angle}) &rarr; <span className="text-[9px] text-slate-400 italic font-sans font-normal">{cut.name}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Financial summary for this profile group */}
                    <div className="grid grid-cols-3 gap-2 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 text-slate-600 dark:text-slate-300 text-xs font-mono">
                      <div>
                        <span className="block text-[8px] text-slate-400">Metraje de Cortes:</span>
                        <strong className="text-slate-800 dark:text-slate-100">{(totalMetersWanted).toFixed(1)}m</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400">Mermas Netas:</span>
                        <strong className="text-rose-600">{profRes.totalWasteCm} cm</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-400 font-sans">Costo aproximado material:</span>
                        <strong className="text-slate-800 dark:text-slate-100">${Math.round(totalCostNeeded)} MXN</strong>
                      </div>
                    </div>
                  </div>
                );
              })}

              {optimizedResults.length === 0 && (
                <div className="text-center py-24 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                  <Scissors size={44} className="mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Planificador de Corte Listo</p>
                  <p className="text-xs text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                    Añade perfiles de aluminio y haz clic en "Optimizar Todo" para desplegar la secuencia física de cortes industriales con mínimos remanentes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
