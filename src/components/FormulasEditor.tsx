/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FormulaRule, FormulaVariable } from "../types";
import { useWorkshop } from "../context/WorkshopContext";
import { evaluateEquation } from "../utils/cutOptimizer";
import {
  Layers,
  Save,
  Trash2,
  Plus,
  RefreshCw,
  Dna,
  Settings,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sliders
} from "lucide-react";

export const FormulasEditor: React.FC = () => {
  const { state, addFormula, updateFormula, deleteFormula } = useWorkshop();

  // Selected active formula template
  const [activeFormulaId, setActiveFormulaId] = useState<string>(
    state.formulas[0]?.id || ""
  );

  const activeFormula = state.formulas.find((f) => f.id === activeFormulaId) || state.formulas[0];

  // Manual values to test the formulas live
  const [testWidth, setTestWidth] = useState<number>(120);
  const [testHeight, setTestHeight] = useState<number>(150);

  // Editing state for new/editing formula
  const [editingName, setEditingName] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<"ventanas" | "puertas" | "canceles" | "fijos">("ventanas");

  // Create empty new formula template
  const handleCreateNewFormula = () => {
    const id = "f-custom-" + Date.now();
    const newFormula: FormulaRule = {
      id,
      name: "Nueva Fórmula de Cancel",
      category: "ventanas",
      variables: [
        { name: "Ancho", description: "Ancho total del vano en cm", defaultValue: 100 },
        { name: "Alto", description: "Alto total del vano en cm", defaultValue: 100 }
      ],
      profileEquations: [
        { profileId: state.profiles[0]?.id || "prof-nat2", name: "Cabezal Superior", formula: "Ancho", quantity: 2, angle: "90/90" },
        { profileId: state.profiles[1]?.id || "prof-nat2-jamba", name: "Jambas Laterales", formula: "Alto - 2", quantity: 2, angle: "90/90" }
      ],
      glassEquation: {
        formulaWidth: "Ancho - 4.5",
        formulaHeight: "Alto - 4.5",
        quantity: 1
      },
      accessoryEquations: [
        { accessoryId: state.accessories[0].id, quantityFormula: "2" }
      ]
    };

    addFormula(newFormula);
    setActiveFormulaId(id);
    alert("¡Fórmula personalizada creada! Puedes configurarla en el panel derecho.");
  };

  const handleDeleteFormula = (id: string) => {
    if (state.formulas.length <= 1) {
      alert("Es necesario mantener al menos una fórmula en la base de datos.");
      return;
    }
    if (window.confirm("¿Estás completamente seguro de eliminar esta fórmula de cálculo de forma permanente?")) {
      deleteFormula(id);
      setActiveFormulaId(state.formulas[0].id);
    }
  };

  // Profile Cut equation modifiers
  const handleUpdateProfileEq = (eqIdx: number, field: string, value: any) => {
    if (!activeFormula) return;
    const profileEquations = [...activeFormula.profileEquations];
    profileEquations[eqIdx] = { ...profileEquations[eqIdx], [field]: value };
    updateFormula(activeFormula.id, { profileEquations });
  };

  const handleAddProfileEq = () => {
    if (!activeFormula) return;
    const profileEquations = [
      ...activeFormula.profileEquations,
      {
        profileId: state.profiles[0]?.id || "prof-nat2",
        name: "Nuevo perfil de corte",
        formula: "Ancho",
        quantity: 2,
        angle: "90/90" as const
      }
    ];
    updateFormula(activeFormula.id, { profileEquations });
  };

  const handleRemoveProfileEq = (idx: number) => {
    if (!activeFormula) return;
    const profileEquations = activeFormula.profileEquations.filter((_, i) => i !== idx);
    updateFormula(activeFormula.id, { profileEquations });
  };

  // Glass equation modifiers
  const handleUpdateGlassEq = (field: string, value: any) => {
    if (!activeFormula) return;
    const glassEquation = { ...activeFormula.glassEquation, [field]: value };
    updateFormula(activeFormula.id, { glassEquation });
  };

  // Accessory equation modifiers
  const handleUpdateAccEq = (idx: number, field: string, value: any) => {
    if (!activeFormula) return;
    const accessoryEquations = [...activeFormula.accessoryEquations];
    accessoryEquations[idx] = { ...accessoryEquations[idx], [field]: value };
    updateFormula(activeFormula.id, { accessoryEquations });
  };

  const handleAddAccEq = () => {
    if (!activeFormula) return;
    const accessoryEquations = [
      ...activeFormula.accessoryEquations,
      {
        accessoryId: state.accessories[0]?.id || "acc-roda",
        quantityFormula: "2"
      }
    ];
    updateFormula(activeFormula.id, { accessoryEquations });
  };

  const handleRemoveAccEq = (idx: number) => {
    if (!activeFormula) return;
    const accessoryEquations = activeFormula.accessoryEquations.filter((_, i) => i !== idx);
    updateFormula(activeFormula.id, { accessoryEquations });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">
          Creador y Editor de Fórmulas Inteligentes
        </h1>
        <p className="text-slate-500 text-xs">
          Personaliza los algoritmos de corte e ingresa descuentos matemáticos de hojas, traslapes, vidrios y tornillería según tus líneas favoritas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: FORMULA LIST (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[360px]">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Plantillas Registradas
                </h3>
                <button
                  onClick={handleCreateNewFormula}
                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded"
                >
                  + Nueva
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
                {state.formulas.map((form) => (
                  <div
                    key={form.id}
                    onClick={() => setActiveFormulaId(form.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                      activeFormulaId === form.id
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-xs">{form.name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize font-mono mt-0.5">{form.category}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFormula(form.id);
                      }}
                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition"
                      title="Eliminar plantilla"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE SIMULATOR CONTROLS */}
            {activeFormula && (
              <div className="pt-3 border-t border-slate-150 bg-slate-50 p-3 rounded-xl">
                <h4 className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                  <Sliders size={12} className="text-blue-500" />
                  Simulador de Fórmulas en Vivo (cm)
                </h4>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Ancho:</span>
                    <input
                      type="number"
                      value={testWidth}
                      onChange={(e) => setTestWidth(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-250 text-slate-800 text-xs px-1.5 py-0.5 text-center font-mono font-bold rounded"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500">Alto:</span>
                    <input
                      type="number"
                      value={testHeight}
                      onChange={(e) => setTestHeight(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-250 text-slate-800 text-xs px-1.5 py-0.5 text-center font-mono font-bold rounded"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIMULATED IN-FIELD OUTPUT VIEW CARD */}
          {activeFormula && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-100 shadow-xl space-y-3 font-mono">
              <h4 className="text-[10px] text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <Dna size={12} />
                Planilla de cálculo evaluada para ({testWidth} x {testHeight} cm)
              </h4>
              <div className="space-y-2 text-xs">
                {/* Visual equations evaluation */}
                <div className="space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 max-h-40 overflow-y-auto">
                  {activeFormula.profileEquations.map((eq, i) => {
                    const result = evaluateEquation(eq.formula, { Ancho: testWidth, Alto: testHeight });
                    return (
                      <div key={i} className="flex justify-between border-b border-slate-800 py-1 last:border-none">
                        <span className="text-slate-400 text-[11px]">{eq.name}:</span>
                        <strong className="text-emerald-400">
                          {eq.quantity} pz de {result.toFixed(1)} cm
                        </strong>
                      </div>
                    );
                  })}
                  
                  {/* Glass evaluation */}
                  <div className="flex justify-between border-t border-dashed border-slate-800 pt-2 text-blue-300">
                    <span>Área Vidrio Total:</span>
                    <strong>
                      {(
                        (evaluateEquation(activeFormula.glassEquation.formulaWidth, { Ancho: testWidth, Alto: testHeight }) / 100) *
                        (evaluateEquation(activeFormula.glassEquation.formulaHeight, { Ancho: testWidth, Alto: testHeight }) / 100) *
                        activeFormula.glassEquation.quantity
                      ).toFixed(2)}
                      m²
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: WORKSPACE STAGE FOR SELECTED FORMULA (Col span 3) */}
        <div className="lg:col-span-3">
          {activeFormula ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Configuración de Ecuaciones: {activeFormula.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define las variables y multiplicadores de cada pieza del cancel.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 border text-slate-600 px-2 py-0.5 rounded uppercase font-mono">
                    ID: {activeFormula.id}
                  </span>
                </div>
              </div>

              {/* Edit core Formula profile attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nombre Comercial de la Fórmula</label>
                  <input
                    type="text"
                    value={activeFormula.name}
                    onChange={(e) => updateFormula(activeFormula.id, { name: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Categoría General</label>
                  <select
                    value={activeFormula.category}
                    onChange={(e) => updateFormula(activeFormula.id, { category: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="ventanas">Ventanas</option>
                    <option value="puertas">Puertas</option>
                    <option value="canceles">Cancel de Baño</option>
                    <option value="fijos">Fijos / Guillotinas</option>
                  </select>
                </div>
              </div>

              {/* 1. Profile Cuts Equations Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Ecuaciones de Cortes en Perfiles
                  </h4>
                  <button
                    onClick={handleAddProfileEq}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold"
                  >
                    + Agregar Perfil Corte
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono">
                        <th className="p-2">Perfil Base</th>
                        <th className="p-2">Etiqueta de Pieza</th>
                        <th className="p-2">Ecuación (Invariable/Variable)</th>
                        <th className="p-2 text-center">Cortes por pz</th>
                        <th className="p-2 text-center">Ángulo</th>
                        <th className="p-2 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeFormula.profileEquations.map((eq, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-1">
                            <select
                              value={eq.profileId}
                              onChange={(e) => handleUpdateProfileEq(i, "profileId", e.target.value)}
                              className="bg-transparent border border-slate-200 text-slate-700 p-1 rounded font-mono text-[10px] max-w-[110px]"
                            >
                              {state.profiles.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name.substring(0, 18)}...
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={eq.name}
                              onChange={(e) => handleUpdateProfileEq(i, "name", e.target.value)}
                              className="border border-slate-200 rounded p-1 w-full text-[11px]"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={eq.formula}
                              onChange={(e) => handleUpdateProfileEq(i, "formula", e.target.value)}
                              className="border border-slate-200 rounded p-1 font-mono font-bold text-indigo-700 w-full"
                              title="Escriba expresiones matemáticas como 'Ancho', 'Alto - 3.2', 'Ancho / 2'"
                            />
                          </td>
                          <td className="p-1 text-center">
                            <input
                              type="number"
                              min="1"
                              value={eq.quantity}
                              onChange={(e) => handleUpdateProfileEq(i, "quantity", Number(e.target.value))}
                              className="border border-slate-200 rounded p-1 text-center w-12 font-bold"
                            />
                          </td>
                          <td className="p-1">
                            <select
                              value={eq.angle}
                              onChange={(e) => handleUpdateProfileEq(i, "angle", e.target.value)}
                              className="border border-slate-200 rounded p-1 text-[10px]"
                            >
                              <option value="90/90">90° / 90°</option>
                              <option value="45/45">45° / 45°</option>
                              <option value="45/90">45° / 90°</option>
                            </select>
                          </td>
                          <td className="p-1 text-center">
                            <button
                              onClick={() => handleRemoveProfileEq(i)}
                              className="text-slate-300 hover:text-red-500 p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Glass Dimension Equations Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Descuentos para Cristaleria
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <label className="block text-slate-500 mb-1">Fórmula Ancho Hojas Vidrio</label>
                    <input
                      type="text"
                      value={activeFormula.glassEquation.formulaWidth}
                      onChange={(e) => handleUpdateGlassEq("formulaWidth", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-indigo-700 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Fórmula Alto Hojas Vidrio</label>
                    <input
                      type="text"
                      value={activeFormula.glassEquation.formulaHeight}
                      onChange={(e) => handleUpdateGlassEq("formulaHeight", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs text-indigo-700 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Hojas de Vidrio necesarias</label>
                    <input
                      type="number"
                      min="1"
                      value={activeFormula.glassEquation.quantity}
                      onChange={(e) => handleUpdateGlassEq("quantity", Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Accessory / Hardware Formulas Section */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Fórmulas de Herrajes y Consumibles
                  </h4>
                  <button
                    onClick={handleAddAccEq}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold"
                  >
                    + Agregar Fórmula Accesorios
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-mono">
                        <th className="p-2">Herraje / Consumible</th>
                        <th className="p-2">Fórmula de Cantidad</th>
                        <th className="p-2 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {activeFormula.accessoryEquations.map((eq, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-2">
                            <select
                              value={eq.accessoryId}
                              onChange={(e) => handleUpdateAccEq(i, "accessoryId", e.target.value)}
                              className="bg-transparent border border-slate-250 text-slate-700 p-1 rounded text-xs"
                            >
                              {state.accessories.map((acc) => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.name} (${acc.pricePerUnit}/pz)
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={eq.quantityFormula}
                              onChange={(e) => handleUpdateAccEq(i, "quantityFormula", e.target.value)}
                              className="border border-slate-200 px-2 py-1 rounded w-full font-bold text-rose-700"
                              title="Escriba cantidad fija como '4', o dinámica como 'Vidrios * 2'"
                            />
                          </td>
                          <td className="p-2 text-center font-sans">
                            <button
                              onClick={() => handleRemoveAccEq(i)}
                              className="text-slate-300 hover:text-red-500 p-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 text-slate-400">
              <span className="text-sm">Selecciona una plantilla de fórmulas del listado izquierdo para configurar.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
