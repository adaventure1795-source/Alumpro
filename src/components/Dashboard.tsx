/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useWorkshop } from "../context/WorkshopContext";
import {
  Activity,
  Scissors,
  DollarSign,
  Layers,
  BookOpen,
  FileText,
  AlertCircle,
  Hammer,
  TrendingUp,
  Settings,
  RefreshCw
} from "lucide-react";

export const Dashboard: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const { state, syncing, lastSynced, triggerSync, resetToDefault } = useWorkshop();

  // Stock and inventory valuations
  const totalProfilesStock = state.profiles.reduce((sum, p) => sum + p.stockMeters, 0);
  const totalAccessoriesStock = state.accessories.reduce((sum, a) => sum + a.stockUnits, 0);
  const totalGlassesStock = state.glasses.reduce((sum, g) => sum + g.stockM2, 0);

  const profilesValue = state.profiles.reduce((sum, p) => sum + p.stockMeters * p.pricePerMeter, 0);
  const accessoriesValue = state.accessories.reduce((sum, a) => sum + a.stockUnits * a.pricePerUnit, 0);
  const glassesValue = state.glasses.reduce((sum, g) => sum + g.stockM2 * g.pricePerM2, 0);
  const totalStockValue = profilesValue + accessoriesValue + glassesValue;

  // Invoice calculations
  const totalInvoicesValue = state.invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoicesCollect = state.invoices.reduce((sum, inv) => sum + inv.pendingBalance, 0);
  const advancePaymentsReceived = state.invoices.reduce((sum, inv) => sum + inv.advancePayment, 0);

  // Active items
  const activeQuotesCount = state.quotes.length;
  const activeNotesCount = state.notes.filter((n) => n.status === "pendiente").length;

  // Stock warnings: below minimum limits
  const lowProfileAlerts = state.profiles.filter((p) => p.stockMeters <= p.minStockMeters);
  const lowAccessoryAlerts = state.accessories.filter((a) => a.stockUnits <= a.minStockUnits);
  const lowGlassAlerts = state.glasses.filter((g) => g.stockM2 <= g.minStockM2);
  const totalAlertsCount = lowProfileAlerts.length + lowAccessoryAlerts.length + lowGlassAlerts.length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-12 -translate-y-6 pointer-events-none">
          <Activity size={240} className="text-blue-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-sans">
              {state.businessDetails.name || "Taller de Cancelaría & Aluminio"}
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl font-sans text-sm">
              Control total en campo y taller: Formula cotizaciones exactas, optimiza perfiles y administra stock desde un solo panel inteligente.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition"
              id="sync-button"
            >
              <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Sincronizando..." : "Respaldar en la Nube"}
            </button>
            <button
              onClick={() => setTab("campo")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition"
              id="field-mode-shortcut"
            >
              <Activity size={14} />
              Modo Campo
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Último respaldo seguro en la nube: <strong className="text-slate-300">{lastSynced}</strong></span>
          <span className="hidden sm:inline text-emerald-400">● Sistema 100% Autonómo (Offline Listo)</span>
        </div>
      </div>

      {/* Critical Stock Alerts */}
      {totalAlertsCount > 0 && (
        <div className="bg-red-50/90 border border-red-200 p-4 rounded-xl flex items-start gap-3 text-red-900 shadow-sm transition-all animate-pulse">
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">¡Alarma de Inventario Crítico! ({totalAlertsCount} Alertas)</h4>
            <p className="text-xs text-red-700 mt-1">
              Los siguientes materiales han alcanzado el stock mínimo de seguridad. Repone el material para evitar retrasos en fabricación:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowProfileAlerts.slice(0, 3).map((p) => (
                <span key={p.id} className="text-[10px] bg-red-100 text-red-800 font-mono font-medium px-2 py-0.5 rounded border border-red-200">
                  {p.name}: {p.stockMeters}m (Min: {p.minStockMeters}m)
                </span>
              ))}
              {lowAccessoryAlerts.slice(0, 3).map((a) => (
                <span key={a.id} className="text-[10px] bg-amber-100 text-amber-800 font-mono font-medium px-2 py-0.5 rounded border border-amber-200">
                  {a.name}: {a.stockUnits} pz (Min: {a.minStockUnits} pz)
                </span>
              ))}
              {lowGlassAlerts.slice(0, 3).map((g) => (
                <span key={g.id} className="text-[10px] bg-amber-100 text-amber-800 font-mono font-medium px-2 py-0.5 rounded border border-amber-200">
                  Vidrio {g.thickness}: {g.stockM2}m² (Min: {g.minStockM2}m²)
                </span>
              ))}
              {(lowProfileAlerts.length + lowAccessoryAlerts.length + lowGlassAlerts.length) > 6 && (
                <span className="text-[10px] text-red-600 font-mono font-medium self-center">
                  y {totalAlertsCount - 6} más...
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setTab("inventario")}
            className="text-xs bg-white text-red-800 hover:bg-red-100 border border-red-200 rounded-lg px-2.5 py-1 font-medium transition"
          >
            Surtir Stock
          </button>
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs text-slate-500 font-medium">Cotizaciones en Curso</span>
            <h3 className="text-2xl font-bold font-sans text-slate-800 mt-1">{activeQuotesCount} pzas</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono font-medium">
                En Pre-Optimizado
              </span>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Hammer size={24} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs text-slate-500 font-medium">Valor Estimado del Stock</span>
            <h3 className="text-2xl font-bold font-sans text-slate-800 mt-1">
              ${totalStockValue.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
              <span>{Math.round(totalProfilesStock)}m perfiles en tienda</span>
            </div>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
            <DollarSign size={24} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs text-slate-500 font-medium">Notas de Remisión Totales</span>
            <h3 className="text-2xl font-bold font-sans text-slate-800 mt-1">
              ${totalInvoicesValue.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-mono font-medium">
                {state.invoices.length} Remisiones generadas
              </span>
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
            <FileText size={24} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pendiente por Cobrar</span>
            <h3 className="text-2xl font-bold font-sans text-amber-600 mt-1">
              ${pendingInvoicesCollect.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h3>
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
              <span>Anticipos cobrados: ${advancePaymentsReceived.toLocaleString("es-MX")}</span>
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Grid: Shortcut Actions & Quick Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Menu Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 font-sans mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded"></span>
              Herramientas de Trabajo Rápido
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard-shortcuts">
              <button
                onClick={() => setTab("cotizador")}
                className="p-5 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-blue-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Cotizar Pieza</h4>
                  <p className="text-slate-500 text-xs mt-1">Calcula precios al instante con vidrio y herrajes.</p>
                </div>
              </button>

              <button
                onClick={() => setTab("optimizador")}
                className="p-5 bg-slate-50 hover:bg-violet-50/50 border border-slate-100 hover:border-violet-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-violet-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <Scissors size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Optimizar Cortes</h4>
                  <p className="text-slate-500 text-xs mt-1">Minimiza desperdicios de tus perfiles comerciales.</p>
                </div>
              </button>

              <button
                onClick={() => setTab("remisiones")}
                className="p-5 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-amber-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Remisiones / PDF</h4>
                  <p className="text-slate-500 text-xs mt-1">Genera notas listas para imprimir o enviar.</p>
                </div>
              </button>

              <button
                onClick={() => setTab("campo")}
                className="p-5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-emerald-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Libreta de Campo</h4>
                  <p className="text-slate-500 text-xs mt-1">Apunta medidas rápidamente con teclado móvil.</p>
                </div>
              </button>

              <button
                onClick={() => setTab("formulas")}
                className="p-5 bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-rose-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <Layers size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Fórmulas Cancelería</h4>
                  <p className="text-slate-500 text-xs mt-1">Configura descuentos automáticos de corte.</p>
                </div>
              </button>

              <button
                onClick={() => setTab("inventario")}
                className="p-5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-xl text-left flex flex-col justify-between h-40 transition group"
              >
                <div className="bg-indigo-600 text-white p-2.5 rounded-lg w-fit group-hover:scale-110 transition">
                  <Settings size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Inventario de Precios</h4>
                  <p className="text-slate-500 text-xs mt-1">Modifica costos por metro lineal, herraje y vidrios.</p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Database Catalog Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:flex justify-between items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Marcas Oficiales Configuradas</h3>
              <p className="text-slate-500 text-xs mt-0.5">Integración preestablecida de catálogos y perfiles comerciales.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Cuprum", "Indalum", "Extrusiones Metálicas", "EuroVent", "Panorama", "EuroAlum", "Línea Española"].map((brand) => (
                  <span key={brand} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center shrink-0">
              <span className="text-2xl font-extrabold text-blue-600">{state.profiles.length}</span>
              <p className="text-[10px] text-slate-500 font-mono">Perfiles en Catálogo</p>
            </div>
          </div>
        </div>

        {/* Status Activity Feed Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-sans mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-indigo-600 rounded"></span>
                  Notas Recientes del Campo
                </span>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 font-medium rounded-full font-mono">
                  {state.notes.length} Total
                </span>
              </h2>

              <div className="space-y-3" id="quick-notes-feed">
                {state.notes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-xl space-y-2 transition cursor-pointer"
                    onClick={() => setTab("campo")}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-xs text-slate-800 hover:underline">{note.clientName}</strong>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 rounded font-bold px-1.5 py-0.5 font-mono">
                        {note.measurements}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2">{note.text}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>{note.type}</span>
                      <span className={note.status === "pendiente" ? "text-amber-500 font-semibold" : "text-slate-400"}>
                        {note.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
                {state.notes.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-sm">Sin notas de campo guardadas.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setTab("campo")}
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl text-center transition"
            >
              Ver e Importar Libreta de Campo
            </button>
          </div>

          {/* System Control Settings / Reset */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-700 font-sans">Ajustes de Fábrica</h4>
                <p className="text-[10px] text-slate-500">¿Deseas restablecer los datos de demostración?</p>
              </div>
              <button
                onClick={resetToDefault}
                className="text-[10px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 px-2 py-1 rounded font-medium transition"
              >
                Restablecer Todo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
