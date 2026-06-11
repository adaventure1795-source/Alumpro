/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { TallerNote } from "../types";
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  Smartphone,
  Sparkles,
  Play,
  CheckCircle,
  Archive,
  Grid,
  ChevronRight,
  Calculator
} from "lucide-react";

export const Notas: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const { state, addNote, updateNote, deleteNote, addQuoteItem } = useWorkshop();

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // "Modo Campo" Toggle - Big buttons & interactive simplified numeric layout
  const [isFieldMode, setIsFieldMode] = useState<boolean>(false);

  // Note form state
  const [client, setClient] = useState<string>("");
  const [project, setProject] = useState<string>("");
  const [noteType, setNoteType] = useState<string>("Ventana Corrediza");
  const [widthStr, setWidthStr] = useState<string>("120");
  const [heightStr, setHeightStr] = useState<string>("100");
  const [observations, setObservations] = useState<string>("");

  // Numpad focus field
  const [activeNumpadField, setActiveNumpadField] = useState<"width" | "height">("width");

  // Simple Numpad Click handler for Modo Campo
  const handleNumpadClick = (num: string) => {
    if (activeNumpadField === "width") {
      setWidthStr((prev) => (prev === "0" ? num : prev + num));
    } else {
      setHeightStr((prev) => (prev === "0" ? num : prev + num));
    }
  };

  const handleNumpadClear = () => {
    if (activeNumpadField === "width") {
      setWidthStr("");
    } else {
      setHeightStr("");
    }
  };

  const handleNumpadBackspace = () => {
    if (activeNumpadField === "width") {
      setWidthStr((prev) => prev.slice(0, -1));
    } else {
      setHeightStr((prev) => prev.slice(0, -1));
    }
  };

  // Submit Note
  const handleSubmitNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!client) {
      alert("Introduce al menos el nombre del cliente para registrar la nota.");
      return;
    }

    const newNote: TallerNote = {
      id: "note-custom-" + Date.now(),
      clientName: client,
      projectName: project || "Trabajo general",
      date: new Date().toISOString().split("T")[0],
      type: noteType,
      measurements: `${widthStr || "0"} x ${heightStr || "0"} cm`,
      text: observations || `Tomado en campo: ${noteType} de ${widthStr}cm de ancho y ${heightStr}cm de alto.`,
      status: "pendiente"
    };

    addNote(newNote);
    
    // Clear form
    setClient("");
    setProject("");
    setWidthStr("120");
    setHeightStr("100");
    setObservations("");
    alert("¡Nota de campo registrada correctamente!");
  };

  // Export note to quote (converts dimensions and redirects to quoting calculator)
  const handleExportToQuote = (note: TallerNote) => {
    // Parse measurements, e.g., "120 x 150 cm"
    let parsedWidth = 120;
    let parsedHeight = 100;
    
    try {
      const parts = note.measurements.replace(/cm/g, "").split("x");
      if (parts.length === 2) {
        parsedWidth = parseFloat(parts[0].trim());
        parsedHeight = parseFloat(parts[1].trim());
      }
    } catch (e) {
      console.error("Error parsing measurements:", note.measurements);
    }

    // Direct adding or setting as active preset
    // Let's create a temporary quote item in state or alert user
    // We add a quote item directly using default Spanish line or Nacional 2"
    // So the user instantly finds it in the cart!
    const defaultGlass = state.glasses[0];
    
    const calculatedSimplePreview = {
      profiles: [],
      glasses: [],
      accessories: [],
      subtotalProfiles: 450,
      subtotalGlasses: 250,
      subtotalAccessories: 120,
      laborMinutes: 120,
      laborCost: state.businessDetails.laborRatePerHour * 2,
      total: 450 + 250 + 120 + state.businessDetails.laborRatePerHour * 2
    };

    const newQuoteItem = {
      id: "quote-" + Date.now(),
      name: `${note.clientName} - ${note.type}`,
      widthCm: parsedWidth,
      heightCm: parsedHeight,
      line: "Nacional 3″",
      color: "Anodizado Natural",
      glassId: defaultGlass.id,
      quantity: 1,
      calculated: {
        profiles: [
          { name: "Cabezal Nacional 3″", label: "Cabezal Superior (Ancho)", meters: parsedWidth / 100 * 2, cost: (parsedWidth / 100 * 2) * 58, cuts: [{ sizeCm: parsedWidth, qty: 2, angle: "90/90" }] },
          { name: "Jamba Nacional 3″", label: "Jambas Laterales (Alto)", meters: parsedHeight / 100 * 2, cost: (parsedHeight / 100 * 2) * 58, cuts: [{ sizeCm: parsedHeight, qty: 2, angle: "90/90" }] }
        ],
        glasses: [
          { thickness: "4mm Sencillo Claro", areaM2: (parsedWidth / 100) * (parsedHeight / 100), cost: ((parsedWidth / 100) * (parsedHeight / 100)) * 140, widthCm: parsedWidth - 4, heightCm: parsedHeight - 4, qty: 1 }
        ],
        accessories: [
          { name: "Rodachillas de Alta Carga (Rodamientos)", qty: 2, cost: 24 },
          { name: "Tornillos Cabeza Plana 4x13 (Bolsa de 50)", qty: 12, cost: 18 }
        ],
        subtotalProfiles: (parsedWidth / 100 * 2) * 58 + (parsedHeight / 100 * 2) * 58,
        subtotalGlasses: ((parsedWidth / 100) * (parsedHeight / 100)) * 140,
        subtotalAccessories: 42,
        subtotalHardware: 42,
        laborMinutes: 120,
        laborCost: state.businessDetails.laborRatePerHour * 2,
        total: ((parsedWidth / 100 * 2) * 58 + (parsedHeight / 100 * 2) * 58) + (((parsedWidth / 100) * (parsedHeight / 100)) * 140) + 42 + (state.businessDetails.laborRatePerHour * 2)
      }
    };

    addQuoteItem(newQuoteItem);
    updateNote(note.id, { status: "cotizado" });
    alert(`¡Medidas exportadas con éxito! Hemos precargado "${note.type}" (${parsedWidth}x${parsedHeight}cm) en tu proyecto cotizado. Te redirigimos al calculador.`);
    setTab("cotizador");
  };

  // Archive note helper
  const handleArchiveNote = (id: string) => {
    updateNote(id, { status: "archivado" });
  };

  // Unarchive / Pendiente note helper
  const handleUnarchiveNote = (id: string) => {
    updateNote(id, { status: "pendiente" });
  };

  // Filtered array list
  const filteredNotes = state.notes.filter((note) => {
    const matchesSearch =
      note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.text.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && note.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight flex items-center gap-2">
            <BookOpen size={22} className="text-blue-600" />
            Libreta de Campo e Historial de Mediciones
          </h1>
          <p className="text-slate-500 text-xs">
            Registra medidas directamente en la obra. Activa el "Modo Campo" para un teclado de números gigantes apto para pantallas táctiles rugosas.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsFieldMode(!isFieldMode)}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm ${
              isFieldMode
                ? "bg-slate-900 border border-slate-800 text-emerald-400"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
            id="toggle-field-mode"
          >
            <Smartphone size={14} />
            {isFieldMode ? "Modo Clásico" : "Activar Modo Campo (Súper Botones)"}
          </button>
        </div>
      </div>

      {/* WORKSPACE DIVIDED */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* ADD NOTE FORM (Col span 3) */}
        <div className="lg:col-span-3">
          {isFieldMode ? (
            /* SPECIAL FIELD MODE: GIANT NUMERICAL PADS */
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone size={14} className="animate-bounce" />
                  Modo Campo Inteligente (Altas Dimensiones)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Presiona los campos para editar</span>
              </div>

              {/* Input targets display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Nombre Cliente</label>
                  <input
                    type="text"
                    required
                    placeholder="Escribe cliente..."
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-705 p-3 text-slate-100 placeholder-slate-500 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase mb-1">Tipo de Estructura</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-705 p-3 text-slate-100 rounded-xl text-sm focus:outline-none"
                  >
                    <option value="Ventana Corrediza">Ventana Corrediza</option>
                    <option value="Puerta Batiente">Puerta Batiente</option>
                    <option value="Cancel Corredizo Baño">Cancel Baño</option>
                    <option value="Fijo con Marco Bolsa">Fijo con Bolsa</option>
                    <option value="Vidrio Templado simple">Templado Directo</option>
                  </select>
                </div>
              </div>

              {/* Display focus size fields */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveNumpadField("width")}
                  className={`p-4 rounded-xl border text-center transition ${
                    activeNumpadField === "width"
                      ? "bg-blue-950 border-blue-500 text-blue-200 ring-2 ring-blue-900"
                      : "bg-slate-800/60 border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="block text-[10px] uppercase text-slate-400">ANCHO (cm)</span>
                  <span className="text-3xl font-black font-mono block mt-1">
                    {widthStr || "—"} <span className="text-sm font-normal text-slate-400">cm</span>
                  </span>
                </button>

                <button
                  onClick={() => setActiveNumpadField("height")}
                  className={`p-4 rounded-xl border text-center transition ${
                    activeNumpadField === "height"
                      ? "bg-blue-950 border-blue-500 text-blue-200 ring-2 ring-blue-900"
                      : "bg-slate-800/60 border-slate-700 text-slate-300"
                  }`}
                >
                  <span className="block text-[10px] uppercase text-slate-400">ALTO (cm)</span>
                  <span className="text-3xl font-black font-mono block mt-1">
                    {heightStr || "—"} <span className="text-sm font-normal text-slate-400">cm</span>
                  </span>
                </button>
              </div>

              {/* INDUSTRIAL GIANT NUMPAD SCREEN COMPONENT */}
              <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto pt-2" id="giant-numpad-container">
                {["7", "8", "9", "4", "5", "6", "1", "2", "3"].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleNumpadClick(digit)}
                    className="h-16 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 text-2xl font-black rounded-xl border border-slate-705 transition flex items-center justify-center shadow"
                  >
                    {digit}
                  </button>
                ))}
                
                {/* Clear Button */}
                <button
                  onClick={handleNumpadClear}
                  className="h-16 bg-rose-955/40 hover:bg-rose-950 text-rose-300 text-xl font-bold rounded-xl border border-rose-900/40 transition flex items-center justify-center shadow"
                >
                  CLR
                </button>
                
                {/* Zero Button */}
                <button
                  onClick={() => handleNumpadClick("0")}
                  className="h-16 bg-slate-800 hover:bg-slate-700 text-slate-100 text-2xl font-black rounded-xl border border-slate-705 transition flex items-center justify-center shadow"
                >
                  0
                </button>
                
                {/* Backspace Button */}
                <button
                  onClick={handleNumpadBackspace}
                  className="h-16 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xl font-bold rounded-xl border border-slate-705 transition flex items-center justify-center shadow"
                >
                  &larr;
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={() => handleSubmitNote()}
                className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-extrabold rounded-2xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/20"
                id="submit-field-note"
              >
                <CheckCircle size={20} />
                Guardar Nota en la Libreta
              </button>
            </div>
          ) : (
            /* CLASSIC FORM LAYOUT */
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} className="text-blue-600" />
                Registrar Nueva Medida clásica
              </h3>

              <form onSubmit={handleSubmitNote} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Nombre del Cliente</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Ignacio Martínez"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Referencia del Proyecto (Opcional)</label>
                    <input
                      type="text"
                      placeholder="ej: Casas Lomas Verdes"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Estructura</label>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="Ventana Corrediza 2 Hojas">Ventana Corrediza</option>
                      <option value="Puerta Batiente Pivotante">Puerta Batiente</option>
                      <option value="Cancel de Baño standard">Cancel de Baño</option>
                      <option value="Fijo con Marco">Fijo de Vidrio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Ancho (cm)</label>
                    <input
                      type="number"
                      value={widthStr}
                      onChange={(e) => setWidthStr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1">Alto (cm)</label>
                    <input
                      type="number"
                      value={heightStr}
                      onChange={(e) => setHeightStr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Observaciones / Comentarios en Obra</label>
                  <textarea
                    rows={3}
                    placeholder="Describir color de aluminio, texturas, si requiere remoción de vidrios viejos, etc..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
                >
                  + Agregar Nota de Medidas
                </button>
              </form>
            </div>
          )}
        </div>

        {/* LIST OF REGISTERED NOTES (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full min-h-[480px]">
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">Mediciones Guardadas</h3>
                
                {/* Search / Filters tools */}
                <div className="flex gap-2 text-xs">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Buscar por cliente/nota..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs"
                  >
                    <option value="all">Filtro Estado</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cotizado">Cotizados</option>
                    <option value="archivado">Archivados</option>
                  </select>
                </div>
              </div>

              {/* Notes map container */}
              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl space-y-3 relative group"
                  >
                    {/* Delete note button */}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition"
                      title="Eliminar nota"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <strong className="text-sm text-slate-800 font-sans">{note.clientName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{note.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase font-mono border border-indigo-100">
                          {note.type}
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold font-mono border border-blue-100">
                          {note.measurements}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-600 text-xs leading-relaxed italic">{note.text}</p>

                    {/* Footer Actions: convert, archive */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold uppercase ${
                        note.status === "pendiente"
                          ? "text-amber-500"
                          : note.status === "cotizado"
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }`}>
                        {note.status}
                      </span>

                      <div className="flex items-center gap-2">
                        {note.status === "pendiente" && (
                          <button
                            onClick={() => handleExportToQuote(note)}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded flex items-center gap-1 cursor-pointer transition shadow"
                          >
                            <Calculator size={11} />
                            Cotizar
                          </button>
                        )}
                        {note.status !== "archivado" ? (
                          <button
                            onClick={() => handleArchiveNote(note.id)}
                            className="text-slate-400 hover:text-slate-600 text-[10px] font-medium"
                          >
                            Archivar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnarchiveNote(note.id)}
                            className="text-slate-400 hover:text-slate-600 text-[10px] font-medium"
                          >
                            Desarchivar
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}

                {filteredNotes.length === 0 && (
                  <div className="text-center py-24 text-slate-400">
                    <p className="text-sm font-semibold">Sin mediciones filtradas</p>
                  </div>
                )}
              </div>
            </div>

            {state.notes.length > 0 && (
              <p className="text-[10px] text-slate-400 font-mono text-center pt-2 border-t border-slate-100">
                Sincronización de mediciones automáticas activa en iCloud/Drive.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
