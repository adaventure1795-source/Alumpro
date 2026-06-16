/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Printer, ArrowLeft, CheckCircle2, Download, Phone, MapPin, Building } from "lucide-react";

interface PublicInvoiceItem {
  d: string; // description
  q: number; // quantity
  u: number; // unitPrice
  t: number; // total
}

interface PublicInvoiceData {
  n: string; // businessName
  p: string; // businessPhone
  a: string; // businessAddress
  r?: string; // businessRFC
  c: string; // clientName
  cp: string; // clientPhone
  ca: string; // clientAddress
  d: string; // date
  dd: string; // dueDate
  no: string; // invoiceNumber
  items: PublicInvoiceItem[];
  s: number; // subtotal
  iv: number; // ivaPercent
  t: number; // total
  adv: number; // advancePayment
  pb: number; // pendingBalance
  not: string; // notes
  st: string; // status
}

interface PublicInvoiceViewerProps {
  encodedData: string;
}

export const PublicInvoiceViewer: React.FC<PublicInvoiceViewerProps> = ({ encodedData }) => {
  const [theme, setTheme] = useState<"blue" | "dark" | "emerald" | "steel">("blue");
  
  let invoice: PublicInvoiceData | null = null;
  try {
    const decodedJson = decodeURIComponent(escape(atob(encodedData)));
    invoice = JSON.parse(decodedJson) as PublicInvoiceData;
  } catch (e) {
    console.error("Error decoding invoice data:", e);
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Enlace de remisión no válido</h2>
          <p className="text-slate-500 text-sm">
            No se pudo decodificar correctamente la información de este recibo. Verifique que el enlace copiado desde WhatsApp esté completo.
          </p>
          <button
            onClick={() => {
              window.location.search = "";
            }}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-705 transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Active theme properties
  const themeClasses = {
    blue: {
      primary: "bg-blue-900 border-blue-950",
      accent: "bg-blue-50 border-blue-200 text-blue-900",
      btn: "bg-blue-600 hover:bg-blue-500",
      text: "text-blue-900"
    },
    dark: {
      primary: "bg-slate-900 border-slate-955",
      accent: "bg-slate-50 border-slate-200 text-slate-900",
      btn: "bg-slate-800 hover:bg-slate-755",
      text: "text-slate-900"
    },
    emerald: {
      primary: "bg-emerald-900 border-emerald-955",
      accent: "bg-emerald-50 border-emerald-200 text-emerald-900",
      btn: "bg-emerald-600 hover:bg-emerald-555",
      text: "text-emerald-900"
    },
    steel: {
      primary: "bg-slate-700 border-slate-755",
      accent: "bg-slate-100 border-slate-300 text-slate-800",
      btn: "bg-slate-700 hover:bg-slate-600",
      text: "text-slate-700"
    }
  };

  const selectedTheme = themeClasses[theme];

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-12 px-4 print:p-0 font-sans text-slate-900">
      
      {/* Dynamic Header Controls Bar (Hidden on print) */}
      <div className="max-w-3xl mx-auto mb-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        
        {/* Leading title and return action */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              window.location.search = ""; // clear query and go back to application
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-500 hover:text-slate-700"
            title="Ir a AluMaster"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-left">
            <h1 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 leading-none">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Nota de Remisión Oficial
            </h1>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              AlMaster Digital Document Viewer
            </p>
          </div>
        </div>

        {/* Style selection and download/print control actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <span className="hidden md:inline">Plantilla:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 text-[11px]"
            >
              <option value="blue">Azul Industrial</option>
              <option value="dark">Negro Cromado</option>
              <option value="emerald">Verde Esmeralda</option>
              <option value="steel">Gris Acero</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className={`flex items-center gap-1.5 px-3.5 py-1.8 text-white rounded-xl text-xs font-bold shadow transition cursor-pointer ${selectedTheme.btn}`}
          >
            <Printer size={13} />
            Imprimir o Guardar PDF
          </button>
        </div>
      </div>

      {/* Printable Paper A4/Letter block mimicking physical documents */}
      <div 
        className="max-w-3xl mx-auto bg-white p-6 sm:p-12 rounded-2xl border border-slate-205 shadow-xl print:border-none print:shadow-none print:p-0 relative overflow-hidden"
        id="public-remision-printable-sheet"
      >
        {/* Top visual theme band */}
        <div className={`h-2.5 w-full absolute top-0 left-0 ${selectedTheme.primary}`} />

        {/* Document header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-150">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Building size={20} className="text-slate-600 inline" />
              {invoice.n}
            </h2>
            <div className="text-[11px] text-slate-500 leading-relaxed space-y-0.5">
              <p className="flex items-center gap-1"><MapPin size={11} /> {invoice.a}</p>
              <p className="flex items-center gap-1 font-semibold"><Phone size={11} /> Tel: {invoice.p}</p>
              {invoice.r && (
                <p className="font-mono text-[10px]">RFC: <strong className="text-slate-600">{invoice.r}</strong></p>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className={`px-2.5 py-0.5 font-mono text-[9px] uppercase font-bold text-white rounded tracking-wide ${selectedTheme.primary}`}>
              Nota de Remisión Digital
            </span>
            <h3 className="text-xl font-bold font-mono text-slate-700 mt-1">
              {invoice.no}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Fecha Emisión: {new Date(invoice.d).toLocaleDateString("es-MX")}
            </p>
          </div>
        </div>

        {/* Recipient details and due dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 text-xs">
          <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-400 block border-b pb-0.5 mb-1.5">
              DATOS DEL CLIENTE
            </span>
            <p className="font-bold text-slate-800 text-sm leading-tight">{invoice.c}</p>
            {invoice.cp && (
              <p className="text-slate-500 font-mono">Celular: {invoice.cp}</p>
            )}
            {invoice.ca && (
              <p className="text-slate-400 leading-tight">Ubicación Obra: {invoice.ca}</p>
            )}
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 md:text-right flex flex-col justify-between">
            <div>
              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-400 block border-b pb-0.5 mb-1.5 md:text-right">
                INFORMACIÓN DE ENTREGA
              </span>
              <p className="text-[11px] text-slate-500">Fecha Límite de Instalación:</p>
              <strong className="text-slate-800 font-mono text-sm block mt-0.5">
                {new Date(invoice.dd).toLocaleDateString("es-MX")}
              </strong>
            </div>
            <div className="pt-2 md:pt-0">
              <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-slate-400 mr-2 md:inline">
                ESTADO:
              </span>
              <span className="text-[10px] bg-red-100 text-red-850 font-mono font-bold px-2.5 py-0.5 rounded border border-red-200 uppercase inline-block leading-tight">
                {invoice.st.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Invoice Concepts Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`text-white text-[10px] uppercase font-mono ${selectedTheme.primary}`}>
                <th className="p-3">Descripción de los Trabajos / Servicios</th>
                <th className="p-3 text-center w-16">Cantidad</th>
                <th className="p-3 text-right w-32">P. Unitario</th>
                <th className="p-3 text-right w-36">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-105">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/20">
                  <td className="p-3 font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {item.d}
                  </td>
                  <td className="p-3 text-center text-slate-700 font-mono font-bold">
                    {item.q}
                  </td>
                  <td className="p-3 text-right text-slate-600 font-mono">
                    ${item.u.toLocaleString("es-MX")}
                  </td>
                  <td className="p-3 text-right text-slate-800 font-bold font-mono">
                    ${item.t.toLocaleString("es-MX")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Agreement conditions and totals balance box */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-150 text-xs">
          
          <div className="max-w-md text-[10px] text-slate-400 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
            <strong className="text-slate-500 block mb-1 uppercase tracking-wide">
              Contrato de Adhesión & Términos:
            </strong>
            <p className="whitespace-pre-line">{invoice.not}</p>
          </div>

          <div className="w-full md:w-64 text-right space-y-2 font-mono text-xs shrink-0 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl border md:border-none border-slate-150">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>${invoice.s.toLocaleString("es-MX")} MXN</span>
            </div>
            <div className="flex justify-between text-slate-500 border-b border-dashed border-slate-200 pb-1.5">
              <span>IVA gravado ({invoice.iv}%):</span>
              <span>${Math.round(invoice.s * (invoice.iv / 100)).toLocaleString("es-MX")} MXN</span>
            </div>
            <div className="flex justify-between text-slate-800 font-black text-sm">
              <span>Importe Total:</span>
              <span>${invoice.t.toLocaleString("es-MX")} MXN</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-medium text-xs">
              <span>Monto Amortizado (Anticipo):</span>
              <span>-${invoice.adv.toLocaleString("es-MX")} MXN</span>
            </div>
            <div className={`flex justify-between font-black text-sm p-2 rounded shadow-sm ${selectedTheme.accent}`}>
              <span>SALDO A LIQUIDAR:</span>
              <span>${invoice.pb.toLocaleString("es-MX")} MXN</span>
            </div>
          </div>
        </div>

        {/* Dual signatures formal validity */}
        <div className="grid grid-cols-2 gap-12 pt-16 text-center text-[10px] text-slate-400 font-mono print:pt-14 shrink-0">
          <div className="border-t border-slate-300 pt-2 max-w-[180px] mx-auto w-full">
            ENTREGÓ CONFORME
            <span className="block text-[8px] text-slate-300 mt-1">Sello Digital AluMaster</span>
          </div>
          <div className="border-t border-slate-300 pt-2 max-w-[180px] mx-auto w-full">
            RECIBIÓ DE CONFORMIDAD
            <span className="block text-[8px] text-slate-300 mt-1">Firma / Aceptación del Cliente</span>
          </div>
        </div>

      </div>

      <div className="text-center mt-8 text-[11px] text-slate-400 font-sans tracking-wide print:hidden">
        Sistema optimizado para talleres de cancelería en aluminio y vidrierías.
      </div>
    </div>
  );
};
