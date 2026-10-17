import React, { useState, useEffect, useRef } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { 
  Search, 
  X, 
  User, 
  Folder, 
  Package, 
  FileText, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ClipboardList
} from "lucide-react";

interface GlobalSearchProps {
  onTabChange: (tabId: string) => void;
}

interface SearchResult {
  id: string;
  type: "quote" | "client_invoice" | "client_note" | "profile" | "accessory" | "glass";
  title: string;
  subtitle: string;
  extraInfo?: string;
  badge?: {
    text: string;
    variant: "blue" | "emerald" | "amber" | "slate" | "rose" | "purple";
  };
  originalItem: any;
}

export function GlobalSearch({ onTabChange }: GlobalSearchProps) {
  const { state } = useWorkshop();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle searching logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const tempResults: SearchResult[] = [];

    // 1. Search Active Quotes / Canceles
    state.quotes.forEach((q) => {
      if (
        q.name.toLowerCase().includes(cleanQuery) ||
        q.line.toLowerCase().includes(cleanQuery) ||
        q.color.toLowerCase().includes(cleanQuery)
      ) {
        tempResults.push({
          id: `quote-${q.id}`,
          type: "quote",
          title: q.name,
          subtitle: `${q.widthCm}x${q.heightCm} cm | ${q.line} | ${q.color}`,
          extraInfo: `$${Math.round(q.calculated.total).toLocaleString("es-MX")} MXN`,
          badge: { text: "Proyecto / Cancel", variant: "blue" },
          originalItem: q
        });
      }
    });

    // 2. Search Clients in Notes (Libreta de campo)
    state.notes.forEach((n) => {
      if (
        n.clientName.toLowerCase().includes(cleanQuery) ||
        n.projectName.toLowerCase().includes(cleanQuery) ||
        n.text.toLowerCase().includes(cleanQuery) ||
        n.type.toLowerCase().includes(cleanQuery)
      ) {
        tempResults.push({
          id: `note-${n.id}`,
          type: "client_note",
          title: `${n.clientName} (${n.projectName})`,
          subtitle: `Nota técnica: ${n.type} | "${n.text.substring(0, 45)}..."`,
          extraInfo: `Estado: ${n.status}`,
          badge: { text: "Nota Campo", variant: "emerald" },
          originalItem: n
        });
      }
    });

    // 3. Search Clients in Invoices (Notas de remisión)
    state.invoices.forEach((inv) => {
      if (
        inv.clientName.toLowerCase().includes(cleanQuery) ||
        inv.invoiceNumber.toLowerCase().includes(cleanQuery) ||
        inv.clientPhone.includes(cleanQuery) ||
        inv.items.some(item => item.description.toLowerCase().includes(cleanQuery))
      ) {
        tempResults.push({
          id: `invoice-${inv.id}`,
          type: "client_invoice",
          title: `Remisión #${inv.invoiceNumber} - ${inv.clientName}`,
          subtitle: `Deuda: $${Math.round(inv.pendingBalance).toLocaleString("es-MX")} de $${Math.round(inv.total).toLocaleString("es-MX")}`,
          extraInfo: `Estado: ${inv.status}`,
          badge: { text: "Remisión", variant: "purple" },
          originalItem: inv
        });
      }
    });

    // 4. Search Inventory - Profiles (Perfiles de Aluminio)
    state.profiles.forEach((p) => {
      if (
        p.name.toLowerCase().includes(cleanQuery) ||
        p.line.toLowerCase().includes(cleanQuery) ||
        p.brand.toLowerCase().includes(cleanQuery)
      ) {
        const isLow = p.stockMeters <= p.minStockMeters;
        tempResults.push({
          id: `profile-${p.id}`,
          type: "profile",
          title: p.name,
          subtitle: `Material: ${p.line} | Marca: ${p.brand} | $${p.pricePerMeter}/m`,
          extraInfo: `Stock: ${p.stockMeters}m (Mín: ${p.minStockMeters}m)`,
          badge: { 
            text: isLow ? "Perfil (Bajo Stock)" : "Perfil", 
            variant: isLow ? "rose" : "slate" 
          },
          originalItem: p
        });
      }
    });

    // 5. Search Inventory - Accessories (Accesorios)
    state.accessories.forEach((a) => {
      if (a.name.toLowerCase().includes(cleanQuery)) {
        const isLow = a.stockUnits <= a.minStockUnits;
        tempResults.push({
          id: `acc-${a.id}`,
          type: "accessory",
          title: a.name,
          subtitle: `Accesorio | Precio: $${a.pricePerUnit} p/u`,
          extraInfo: `Stock: ${a.stockUnits} pz (Mín: ${a.minStockUnits})`,
          badge: { 
            text: isLow ? "Herraje (Bajo Stock)" : "Herraje", 
            variant: isLow ? "amber" : "slate" 
          },
          originalItem: a
        });
      }
    });

    // 6. Search Inventory - Glasses (Corte de vidrio)
    state.glasses.forEach((g) => {
      if (g.thickness.toLowerCase().includes(cleanQuery)) {
        const isLow = g.stockM2 <= g.minStockM2;
        tempResults.push({
          id: `glass-${g.id}`,
          type: "glass",
          title: g.thickness,
          subtitle: `Vidrio Templado/Sencillo | Precio: $${g.pricePerM2}/m²`,
          extraInfo: `Stock: ${g.stockM2} m² (Mín: ${g.minStockM2} m²)`,
          badge: { 
            text: isLow ? "Vidrio (Bajo Stock)" : "Vidrio", 
            variant: isLow ? "rose" : "slate" 
          },
          originalItem: g
        });
      }
    });

    setResults(tempResults.slice(0, 10)); // Limit to top 10 matches for neatness
  }, [query, state]);

  const handleSelectItem = (item: SearchResult) => {
    setSelectedItem(item);
    setIsOpen(false);
  };

  const handleNavigateToResult = (item: SearchResult) => {
    setSelectedItem(null);
    setQuery("");
    
    // Switch to corresponding tab
    switch (item.type) {
      case "quote":
        onTabChange("cotizador");
        break;
      case "client_note":
        onTabChange("campo");
        break;
      case "client_invoice":
        onTabChange("remisiones");
        break;
      case "profile":
      case "accessory":
      case "glass":
        onTabChange("inventario");
        break;
    }
  };

  // Badge styles utility mapping
  const getBadgeStyle = (variant: string) => {
    switch (variant) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-150";
      case "emerald":
        return "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 border border-emerald-150";
      case "amber":
        return "bg-amber-50 text-amber-700 border border-amber-150";
      case "rose":
        return "bg-rose-50 dark:bg-rose-900/30 text-rose-700 border border-rose-150 font-semibold";
      case "purple":
        return "bg-purple-50 text-purple-700 border border-purple-150";
      case "slate":
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "quote":
        return <Folder size={14} className="text-blue-600 dark:text-blue-300" />;
      case "client_note":
        return <ClipboardList size={14} className="text-emerald-600" />;
      case "client_invoice":
        return <FileText size={14} className="text-purple-600" />;
      case "profile":
      case "accessory":
      case "glass":
      default:
        return <Package size={14} className="text-slate-600 dark:text-slate-300" />;
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef} id="global-search-container">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar canceles, clientes, remisiones, stock..."
          className="w-full bg-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-9 py-2 text-xs font-medium placeholder-slate-400 focus:bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Instant Matches Dropdown Popover */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 rounded-xl shadow-xl z-50 max-h-[350px] overflow-y-auto divide-y divide-slate-100">
          {results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="p-3 hover:bg-slate-50 dark:bg-slate-800 cursor-pointer flex justify-between items-start gap-4 transition"
              >
                <div className="flex gap-2.5 items-start min-w-0">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-lg shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs block leading-tight truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5 min-w-[100px]">
                  {item.badge && (
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${getBadgeStyle(item.badge.variant)}`}>
                      {item.badge.text}
                    </span>
                  )}
                  <span className="text-[9px] font-mono font-bold text-slate-700 dark:text-slate-200">
                    {item.extraInfo}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs space-y-1">
              <p className="font-bold text-slate-700 dark:text-slate-200">Sin coincidencias</p>
              <p className="text-[10px]">Verifique el nombre, clave, número de remisión o descripción.</p>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL OVERLAY FOR SELECTED SEARCH RESULT */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-150 shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-slate-300 transition"
            >
              <X size={16} />
            </button>

            {/* Header Badge */}
            {selectedItem.badge && (
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-black ${getBadgeStyle(selectedItem.badge.variant)}`}>
                {selectedItem.badge.text}
              </span>
            )}

            {/* Title */}
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mt-2.5">
              {selectedItem.title}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {selectedItem.subtitle}
            </p>

            {/* Body Content based on Item Type */}
            <div className="my-5 border-t border-b border-slate-100 dark:border-slate-700/50 py-4 text-xs space-y-2.5">
              {/* Active Cancel Details */}
              {selectedItem.type === "quote" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Esquema / Línea:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.line}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Color Solicitado:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.color}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cantidad Solicitada:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">{selectedItem.originalItem.quantity} piezas</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal Presupuestado:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">
                      ${Math.round(selectedItem.originalItem.calculated.total).toLocaleString("es-MX")}
                    </strong>
                  </div>
                </>
              )}

              {/* Technical Libreta Note Details */}
              {selectedItem.type === "client_note" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliente contratado:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Proyecto asignado:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.projectName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fecha de captura:</span>
                    <strong className="text-slate-500 dark:text-slate-400 font-mono">{selectedItem.originalItem.date}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estatus:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      selectedItem.originalItem.status === "pendiente" ? "bg-amber-100 text-amber-800" :
                      selectedItem.originalItem.status === "cotizado" ? "bg-blue-100 text-blue-800 dark:text-blue-200" : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    }`}>
                      {selectedItem.originalItem.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150 mt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Descripción de Obra:</span>
                    <p className="text-slate-600 dark:text-slate-300 font-mono">{selectedItem.originalItem.text}</p>
                    {selectedItem.originalItem.measurements && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-mono text-[11px]">
                        <span className="text-slate-400">Medida de campo:</span>
                        <strong className="text-rose-600">{selectedItem.originalItem.measurements}</strong>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Delivery Invoice / Remisión details */}
              {selectedItem.type === "client_invoice" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cliente solicitante:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.clientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Teléfono:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">{selectedItem.originalItem.clientPhone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estatus de entrega:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedItem.originalItem.status === "fabricando" ? "bg-yellow-100 text-yellow-800" :
                      selectedItem.originalItem.status === "atrasado" ? "bg-rose-100 text-rose-800" :
                      selectedItem.originalItem.status === "entregado" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800 dark:text-blue-200"
                    }`}>
                      {selectedItem.originalItem.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Anticipo realizado:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">${Math.round(selectedItem.originalItem.advancePayment).toLocaleString("es-MX")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saldo pendiente:</span>
                    <strong className="text-rose-600 font-mono">${Math.round(selectedItem.originalItem.pendingBalance).toLocaleString("es-MX")}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-150">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Conceptos en remisión:</span>
                    <div className="space-y-1">
                      {selectedItem.originalItem.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between font-mono text-[10px] text-slate-600 dark:text-slate-300">
                          <span>{it.quantity}x {it.description}</span>
                          <span>${Math.round(it.total).toLocaleString("es-MX")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Profile inventory details */}
              {selectedItem.type === "profile" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Marca / Extrusora:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.brand}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Línea del catálogo:</span>
                    <strong className="text-slate-700 dark:text-slate-200">{selectedItem.originalItem.line}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio de venta por metro:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">${selectedItem.originalItem.pricePerMeter} MXN/m</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Disponibilidad en almacén:</span>
                    <strong className={`font-mono text-sm ${selectedItem.originalItem.stockMeters <= selectedItem.originalItem.minStockMeters ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedItem.originalItem.stockMeters} metros
                    </strong>
                  </div>
                  {selectedItem.originalItem.stockMeters <= selectedItem.originalItem.minStockMeters && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-lg text-rose-700 flex items-center gap-1.5 text-[10px]">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>Alarma de Reabastecimiento activada. El inventario se encuentra por debajo de {selectedItem.originalItem.minStockMeters}m.</span>
                    </div>
                  )}
                </>
              )}

              {/* Accessory inventory details */}
              {selectedItem.type === "accessory" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio unitario:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">${selectedItem.originalItem.pricePerUnit} MXN/pz</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Piezas utilizables:</span>
                    <strong className={`font-mono text-sm ${selectedItem.originalItem.stockUnits <= selectedItem.originalItem.minStockUnits ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedItem.originalItem.stockUnits} piezas
                    </strong>
                  </div>
                  {selectedItem.originalItem.stockUnits <= selectedItem.originalItem.minStockUnits && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/50 rounded-lg text-rose-700 flex items-center gap-1.5 text-[10px]">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>Stock inferior al mínimo de seguridad ({selectedItem.originalItem.minStockUnits} pzas). Considere realizar una orden de compra.</span>
                    </div>
                  )}
                </>
              )}

              {/* Glass inventory details */}
              {selectedItem.type === "glass" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio comercial m²:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">${selectedItem.originalItem.pricePerM2} MXN/m²</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Área disponible:</span>
                    <strong className={`font-mono text-sm ${selectedItem.originalItem.stockM2 <= selectedItem.originalItem.minStockM2 ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedItem.originalItem.stockM2} m²
                    </strong>
                  </div>
                  {selectedItem.originalItem.stockM2 <= selectedItem.originalItem.minStockM2 && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 border border-rose-150 rounded-lg text-rose-700 flex items-center gap-1.5 text-[10px]">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span>El inventario de vidriería se encuentra por debajo de las tolerancias mínimas globales ({selectedItem.originalItem.minStockM2} m²).</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleNavigateToResult(selectedItem)}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                Ir a Catálogo
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
