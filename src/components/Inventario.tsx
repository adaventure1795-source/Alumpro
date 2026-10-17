/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { ProfileItem, AccessoryItem, GlassItem } from "../types";
import {
  Settings,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  Database,
  ArrowUpRight,
  Download,
  Upload,
  Layers,
  Sparkles,
  Award
} from "lucide-react";
import { BRANDS } from "../data/defaultData";

export const Inventario: React.FC = () => {
  const {
    state,
    addProfile,
    updateProfile,
    deleteProfile,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    addGlass,
    updateGlass,
    deleteGlass,
    updateBusinessDetails
  } = useWorkshop();

  // Active micro-tab inside Inventario
  const [activeSubTab, setActiveSubTab] = useState<"profiles" | "accessories" | "glasses" | "business">("profiles");

  // Profile Form state
  const [profName, setProfName] = useState<string>("");
  const [profLine, setProfLine] = useState<string>("Nacional 2″");
  const [profBrand, setProfBrand] = useState<string>("Cuprum");
  const [profPrice, setProfPrice] = useState<number>(50);
  const [profStock, setProfStock] = useState<number>(200);
  const [profMin, setProfMin] = useState<number>(50);

  // Accessory Form state
  const [accName, setAccName] = useState<string>("");
  const [accPrice, setAccPrice] = useState<number>(15);
  const [accStock, setAccStock] = useState<number>(100);
  const [accMin, setAccMin] = useState<number>(20);

  // Glass Form state
  const [glassThick, setGlassThick] = useState<string>("");
  const [glassPrice, setGlassPrice] = useState<number>(150);
  const [glassStock, setGlassStock] = useState<number>(50);
  const [glassMin, setGlassMin] = useState<number>(10);

  // Business adjustment states
  const [laborRate, setLaborRate] = useState<number>(state.businessDetails.laborRatePerHour);
  const [barLen, setBarLen] = useState<number>(state.businessDetails.defaultBarLengthCm);
  const [bizName, setBizName] = useState<string>(state.businessDetails.name);
  const [bizPhone, setBizPhone] = useState<string>(state.businessDetails.phone);
  const [bizAddress, setBizAddress] = useState<string>(state.businessDetails.address);
  const [bizRFC, setBizRFC] = useState<string>(state.businessDetails.rfc);

  // Submissions
  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName) return;
    const newItem: ProfileItem = {
      id: "prof-custom-" + Date.now(),
      name: profName,
      line: profLine,
      brand: profBrand,
      pricePerMeter: profPrice,
      stockMeters: profStock,
      minStockMeters: profMin
    };
    addProfile(newItem);
    setProfName("");
    alert("¡Perfil añadido correctamente!");
  };

  const handleAddAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    const newItem: AccessoryItem = {
      id: "acc-custom-" + Date.now(),
      name: accName,
      pricePerUnit: accPrice,
      stockUnits: accStock,
      minStockUnits: accMin
    };
    addAccessory(newItem);
    setAccName("");
    alert("¡Herraje añadido correctamente!");
  };

  const handleAddGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!glassThick) return;
    const newItem: GlassItem = {
      id: "glass-custom-" + Date.now(),
      thickness: glassThick,
      pricePerM2: glassPrice,
      stockM2: glassStock,
      minStockM2: glassMin
    };
    addGlass(newItem);
    setGlassThick("");
    alert("¡Tipo de vidrio añadido correctamente!");
  };

  const handleSaveBusiness = () => {
    updateBusinessDetails({
      name: bizName,
      phone: bizPhone,
      address: bizAddress,
      rfc: bizRFC,
      laborRatePerHour: laborRate,
      defaultBarLengthCm: barLen
    });
    alert("¡Configuraciones del taller actualizadas con éxito!");
  };

  // CSV/JSON Export-Import simulator
  const handleExportCSV = () => {
    let csv = "CATEGORIA,ID,NOMBRE/ESPECIFICACION,LINEA,MARCA,PRECIO,STOCK,STOCK_MINIMO\n";
    
    // Perfiles
    state.profiles.forEach(p => {
      // Escape comillas para CSV
      const name = p.name.replace(/"/g, '""');
      csv += `Perfil,${p.id},"${name}",${p.line},${p.brand},${p.pricePerMeter},${p.stockMeters},${p.minStockMeters}\n`;
    });

    // Accesorios
    state.accessories.forEach(a => {
      const name = a.name.replace(/"/g, '""');
      csv += `Accesorio,${a.id},"${name}",-,-,${a.pricePerUnit},${a.stockUnits},${a.minStockUnits}\n`;
    });

    // Vidrios
    state.glasses.forEach(g => {
      const thickness = g.thickness.replace(/"/g, '""');
      csv += `Vidrio,${g.id},"${thickness}",-,-,${g.pricePerM2},${g.stockM2},${g.minStockM2}\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const exportFileDefaultName = `inventario_precios_${new Date().toISOString().split("T")[0]}.csv`;

    const linkEl = document.createElement("a");
    linkEl.setAttribute("href", url);
    linkEl.setAttribute("download", exportFileDefaultName);
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
  };

  const handleExportDataJson = () => {
    const backupStr = JSON.stringify(state, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(backupStr);
    const exportFileDefaultName = `respaldo_aluminio_${new Date().toISOString().split("T")[0]}.json`;

    const linkEl = document.createElement("a");
    linkEl.setAttribute("href", dataUri);
    linkEl.setAttribute("download", exportFileDefaultName);
    linkEl.click();
  };

  const handleImportDataJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profiles && parsed.accessories && parsed.glasses) {
            // Write it safely
            localStorage.setItem("taller_aluminio_config", JSON.stringify(parsed));
            alert("¡Datos importados con éxito! Por favor recarga la aplicación.");
            window.location.reload();
          } else {
            alert("Formato de archivo inválido. Falta campos obligatorios de taller.");
          }
        } catch (err) {
          alert("Error crítico lleyendo el archivo de respaldo.");
        }
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Control de Precios e Inventario
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-sans">
            Ajusta los costos por metro de aluminio, precios de vidrios y herrajes, o descarga respaldos CSV/JSON.
          </p>
        </div>

        {/* Export Data buttons */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-xl border border-blue-200 dark:border-blue-700/50 flex items-center justify-center gap-1 transition shadow-sm"
          >
            <Download size={13} />
            Exportar CSV
          </button>
          
          <button
            onClick={handleExportDataJson}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 transition"
          >
            <Database size={13} />
            Respaldo JSON
          </button>
          
          <label className="flex-1 sm:flex-none px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center justify-center gap-1 transition">
            <Upload size={13} />
            Importar
            <input
              type="file"
              accept=".json"
              onChange={handleImportDataJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Internal Material sub-tabs */}
      <div className="flex border-b border-slate-250 gap-2 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveSubTab("profiles")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeSubTab === "profiles"
              ? "border-blue-600 text-blue-700 dark:text-blue-300"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
          }`}
        >
          Perfiles de Aluminio
        </button>
        <button
          onClick={() => setActiveSubTab("accessories")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeSubTab === "accessories"
              ? "border-blue-600 text-blue-700 dark:text-blue-300"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
          }`}
        >
          Herrajes y Accesorios
        </button>
        <button
          onClick={() => setActiveSubTab("glasses")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeSubTab === "glasses"
              ? "border-blue-600 text-blue-700 dark:text-blue-300"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
          }`}
        >
          Vidrios y Cristales
        </button>
        <button
          onClick={() => setActiveSubTab("business")}
          className={`px-4 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeSubTab === "business"
              ? "border-blue-600 text-blue-700 dark:text-blue-300"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
          }`}
        >
          Ajustes del Negocio
        </button>
      </div>

      {/* SUB-TAB 1: PROFILES MANAGEMENT */}
      {activeSubTab === "profiles" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Líneas de Perfiles Activas ({state.profiles.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono border-b border-slate-155">
                    <th className="p-3">Nombre del Perfil</th>
                    <th className="p-3">Línea</th>
                    <th className="p-3">Marca</th>
                    <th className="p-3 text-right">Precio/m (MXN)</th>
                    <th className="p-3 text-center">Disponible</th>
                    <th className="p-3 text-center">Mínimo</th>
                    <th className="p-3 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.profiles.map((p) => {
                    const isLow = p.stockMeters <= p.minStockMeters;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50 ${isLow ? "bg-red-50/20" : ""}`}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {isLow && <AlertCircle className="text-red-500 shrink-0" size={14} />}
                          {p.name}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{p.line}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{p.brand}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          <input
                            type="number"
                            value={p.pricePerMeter}
                            onChange={(e) => updateProfile(p.id, { pricePerMeter: Number(e.target.value) })}
                            className="w-16 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-right text-xs"
                          />
                        </td>
                        <td className="p-3 text-center font-mono">
                          <input
                            type="number"
                            value={p.stockMeters}
                            onChange={(e) => updateProfile(p.id, { stockMeters: Number(e.target.value) })}
                            className="w-16 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-center text-xs"
                          />
                          m
                        </td>
                        <td className="p-3 text-center font-mono text-slate-400">
                          <input
                            type="number"
                            value={p.minStockMeters}
                            onChange={(e) => updateProfile(p.id, { minStockMeters: Number(e.target.value) })}
                            className="w-12 bg-transparent border-b border-slate-100 dark:border-slate-700/50 text-center text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteProfile(p.id)}
                            className="text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form to add Aluminum profile */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-blue-600 dark:text-blue-300" />
              Nuevo Perfil Comercial
            </h3>

            <form onSubmit={handleAddProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nombre Completo (ej: Cabezal o Traslape)</label>
                <input
                  type="text"
                  required
                  placeholder="Cabezal Nacional de 3″"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Línea de Perfil</label>
                  <select
                    value={profLine}
                    onChange={(e) => setProfLine(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Nacional 2″">Nacional 2″</option>
                    <option value="Nacional 3″">Nacional 3″</option>
                    <option value="Española">Línea Española</option>
                    <option value="Serie 50">Serie 50</option>
                    <option value="EuroVent">EuroVent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Marca Extrusora</label>
                  <select
                    value={profBrand}
                    onChange={(e) => setProfBrand(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Costo ($ / m)</label>
                  <input
                    type="number"
                    value={profPrice}
                    onChange={(e) => setProfPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Stock (Meters)</label>
                  <input
                    type="number"
                    value={profStock}
                    onChange={(e) => setProfStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={profMin}
                    onChange={(e) => setProfMin(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-800 dark:text-slate-100 text-slate-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold rounded-lg transition"
              >
                + Registrar en Catálogo perfiles
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ACCESSORIES MANAGEMENT */}
      {activeSubTab === "accessories" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Herrajes de Montaje en Stock ({state.accessories.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono border-b">
                    <th className="p-3">Nombre del Inserto</th>
                    <th className="p-3 text-right">Precio unitario ($)</th>
                    <th className="p-3 text-center">En Stock</th>
                    <th className="p-3 text-center">Stock de Alarma</th>
                    <th className="p-3 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.accessories.map((a) => {
                    const isLow = a.stockUnits <= a.minStockUnits;
                    return (
                      <tr key={a.id} className={`hover:bg-slate-50 ${isLow ? "bg-amber-50/25" : ""}`}>
                        <td className="p-3 font-semibold text-slate-850 flex items-center gap-1">
                          {isLow && <AlertCircle className="text-blue-500 dark:text-blue-300 shrink-0" size={14} />}
                          {a.name}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          $
                          <input
                            type="number"
                            value={a.pricePerUnit}
                            onChange={(e) => updateAccessory(a.id, { pricePerUnit: Number(e.target.value) })}
                            className="w-12 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-right text-xs"
                          />
                        </td>
                        <td className="p-3 text-center font-mono">
                          <input
                            type="number"
                            value={a.stockUnits}
                            onChange={(e) => updateAccessory(a.id, { stockUnits: Number(e.target.value) })}
                            className="w-16 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-center text-xs"
                          />
                          pz
                        </td>
                        <td className="p-3 text-center font-mono text-slate-400">
                          <input
                            type="number"
                            value={a.minStockUnits}
                            onChange={(e) => updateAccessory(a.id, { minStockUnits: Number(e.target.value) })}
                            className="w-12 bg-transparent border-b border-slate-100 dark:border-slate-700/50 text-center text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteAccessory(a.id)}
                            className="text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-blue-600 dark:text-blue-300" />
              Nuevo Herraje o Sello
            </h3>

            <form onSubmit={handleAddAccessory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Nombre Comercial de Accesorio</label>
                <input
                  type="text"
                  required
                  placeholder="Bisagra española o Felpa"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Costo Unitario</label>
                  <input
                    type="number"
                    value={accPrice}
                    onChange={(e) => setAccPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-850 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">En Stock (pz)</label>
                  <input
                    type="number"
                    value={accStock}
                    onChange={(e) => setAccStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Mínimo Alerta</label>
                  <input
                    type="number"
                    value={accMin}
                    onChange={(e) => setAccMin(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold rounded-lg transition"
              >
                + Incluir Herraje
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GLASSES MANAGEMENT */}
      {activeSubTab === "glasses" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Láminas de Cristal en Talleres ({state.glasses.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-mono border-b">
                    <th className="p-3">Grosor / Tipo de Cristal</th>
                    <th className="p-3 text-right">Precio por m² (MXN)</th>
                    <th className="p-3 text-center">Disponible (m²)</th>
                    <th className="p-3 text-center">Stock de Seguridad</th>
                    <th className="p-3 text-center">Eliminar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.glasses.map((g) => {
                    const isLow = g.stockM2 <= g.minStockM2;
                    return (
                      <tr key={g.id} className={`hover:bg-slate-50 ${isLow ? "bg-amber-50/25" : ""}`}>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                          {isLow && <AlertCircle className="text-blue-500 dark:text-blue-300 shrink-0" size={14} />}
                          {g.thickness}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          $
                          <input
                            type="number"
                            value={g.pricePerM2}
                            onChange={(e) => updateGlass(g.id, { pricePerM2: Number(e.target.value) })}
                            className="w-16 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-right text-xs"
                          />
                        </td>
                        <td className="p-3 text-center font-mono">
                          <input
                            type="number"
                            value={g.stockM2}
                            onChange={(e) => updateGlass(g.id, { stockM2: Number(e.target.value) })}
                            className="w-16 bg-transparent border-b border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 focus:border-blue-500 text-center text-xs"
                          />
                          m²
                        </td>
                        <td className="p-3 text-center font-mono text-slate-400">
                          <input
                            type="number"
                            value={g.minStockM2}
                            onChange={(e) => updateGlass(g.id, { minStockM2: Number(e.target.value) })}
                            className="w-12 bg-transparent border-b border-slate-100 dark:border-slate-700/50 text-center text-xs"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteGlass(g.id)}
                            className="text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Plus size={16} className="text-blue-600 dark:text-blue-300" />
              Nuevo Tipo de Vidrio
            </h3>

            <form onSubmit={handleAddGlass} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Detalle de Espesor / Textura</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 6mm Templado Sanblasteado o Opaco"
                  value={glassThick}
                  onChange={(e) => setGlassThick(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Costo m²</label>
                  <input
                    type="number"
                    value={glassPrice}
                    onChange={(e) => setGlassPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-800 dark:text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">En Stock (m²)</label>
                  <input
                    type="number"
                    value={glassStock}
                    onChange={(e) => setGlassStock(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Mínimo Alerta</label>
                  <input
                    type="number"
                    value={glassMin}
                    onChange={(e) => setGlassMin(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-2 text-center text-slate-400 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold rounded-lg transition"
              >
                + Incluir Vidrio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: GENERAL BUSINESS SETTINGS */}
      {activeSubTab === "business" && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700/50 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Configuraciones del Taller e Identidad de Impresión</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Registra tus marcas, tasas por hora de operario y datos para notas de remisión fiscales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Business settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Identidad Física de Facturación</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Nombre Comercial del Taller</label>
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 mb-1">Teléfono Directo de Atención</label>
                  <input
                    type="text"
                    value={bizPhone}
                    onChange={(e) => setBizPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Dirección de Taller / Tienda</label>
                <input
                  type="text"
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">RFC / Registros Tributarios (Opcional)</label>
                <input
                  type="text"
                  value={bizRFC}
                  onChange={(e) => setBizRFC(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* General rates and bars */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Costos Indirectos y Taller Mecánico</h4>
              
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Costo de Mano de Obra ($ Pesos / Hora de Trabajo)</label>
                <input
                  type="number"
                  value={laborRate}
                  onChange={(e) => setLaborRate(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono font-bold focus:outline-none"
                  title="Costo de fabricación por hora. Se utiliza para calcular el precio total incluyendo armado de ventana."
                />
                <p className="text-[10px] text-slate-400 mt-1">Este concepto evalúa el tiempo asignado en minutos por pieza y lo multiplica por la tasa horaria.</p>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1">Barra de Fábrica predeterminada (cm)</label>
                <input
                  type="number"
                  value={barLen}
                  onChange={(e) => setBarLen(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-100 font-mono focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Tamaño estándar de perfiles comerciales para el cálculo inteligente de barras.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
            <button
              onClick={handleSaveBusiness}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
              id="save-business-details"
            >
              <Award size={14} />
              Guardar Configuración Negocio
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
