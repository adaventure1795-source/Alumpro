/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { DeliveryInvoice } from "../types";
import {
  Printer,
  Share2,
  Trash2,
  Plus,
  DollarSign,
  FileText,
  Smartphone,
  CheckCircle,
  Calendar,
  Layers,
  Palette,
  X
} from "lucide-react";

export const Remision: React.FC = () => {
  const { state, addInvoice, updateInvoice, deleteInvoice } = useWorkshop();

  // Active viewing/printing invoice state
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    state.invoices[0]?.id || ""
  );

  const activeInvoice = state.invoices.find((inv) => inv.id === selectedInvoiceId);

  // Form toggles
  const [showInvoiceForm, setShowInvoiceForm] = useState<boolean>(false);
  
  // Custom print theme setting
  const [invoiceTheme, setInvoiceTheme] = useState<"blue" | "dark" | "emerald" | "steel">("blue");

  // Thermal tickets print toggle
  const [isThermalTicket, setIsThermalTicket] = useState<boolean>(false);

  // Form inputs for new invoice item
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientAddress, setClientAddress] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [itemText, setItemText] = useState<string>("");
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(1500);
  const [invoiceItemsList, setInvoiceItemsList] = useState<{ description: string; quantity: number; unitPrice: number; total: number }[]>([]);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [ivaPercent, setIvaPercent] = useState<number>(16);
  const [remNote, setRemNote] = useState<string>("");

  // Add sub-item to list helper
  const handleAddSubItem = () => {
    if (!itemText) return;
    const total = itemQty * itemPrice;
    setInvoiceItemsList((prev) => [
      ...prev,
      { description: itemText, quantity: itemQty, unitPrice: itemPrice, total }
    ]);
    setItemText("");
    setItemQty(1);
    setItemPrice(1500);
  };

  const handleRemoveSubItem = (idx: number) => {
    setInvoiceItemsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit invoice form
  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoiceItemsList.length === 0) {
      alert("Introduce al menos un artículo o servicio a la nota de remisión.");
      return;
    }

    const subtotal = invoiceItemsList.reduce((sum, item) => sum + item.total, 0);
    const calculatedTotal = subtotal * (1 + ivaPercent / 100);
    const pendingBalance = calculatedTotal - advancePayment;

    const newInv: DeliveryInvoice = {
      id: "inv-custom-" + Date.now(),
      invoiceNumber: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
      businessName: state.businessDetails.name,
      businessPhone: state.businessDetails.phone,
      businessAddress: state.businessDetails.address,
      businessRFC: state.businessDetails.rfc || undefined,
      clientName,
      clientPhone,
      clientAddress,
      date: new Date().toISOString().split("T")[0],
      dueDate: dueDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 100).toISOString().split("T")[0],
      items: invoiceItemsList,
      subtotal: Math.round(subtotal),
      ivaPercent,
      total: Math.round(calculatedTotal),
      advancePayment: Math.round(advancePayment),
      pendingBalance: Math.round(pendingBalance),
      notes: remNote || "Entregas sujetas a condiciones de obra limpia. Requiere anclaje nivelado realizado por albañiles asociados.",
      status: "pendiente"
    };

    addInvoice(newInv);
    setSelectedInvoiceId(newInv.id);
    
    // reset form
    setClientName("");
    setClientPhone("");
    setClientAddress("");
    setDueDate("");
    setInvoiceItemsList([]);
    setAdvancePayment(0);
    setRemNote("");
    setShowInvoiceForm(false);
    alert("¡Nota de Remisión digital emitida!");
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar permanentemente esta remisión?")) {
      deleteInvoice(id);
      setSelectedInvoiceId(state.invoices[0]?.id || "");
    }
  };

  // WhatsApp formatted string generator other users can click
  const handleWhatsAppShare = (inv: DeliveryInvoice) => {
    const formattedDate = new Date(inv.date).toLocaleDateString("es-MX");
    const formattedDue = new Date(inv.dueDate).toLocaleDateString("es-MX");
    
    // Generate clean self-contained base64 data link pointing back to the dynamic application origin
    let pdfLink = "";
    try {
      const sharedData = {
        n: inv.businessName,
        p: inv.businessPhone,
        a: inv.businessAddress,
        r: inv.businessRFC || "",
        c: inv.clientName,
        cp: inv.clientPhone,
        ca: inv.clientAddress,
        d: inv.date,
        dd: inv.dueDate,
        no: inv.invoiceNumber,
        items: inv.items.map(i => ({ d: i.description, q: i.quantity, u: i.unitPrice, t: i.total })),
        s: inv.subtotal,
        iv: inv.ivaPercent,
        t: inv.total,
        adv: inv.advancePayment,
        pb: inv.pendingBalance,
        not: inv.notes,
        st: inv.status
      };
      const jsonStr = JSON.stringify(sharedData);
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
      const basePath = window.location.origin + window.location.pathname;
      pdfLink = `${basePath}?viewInvoice=${b64}`;
    } catch (e) {
      console.error("Error creating shared invoice link:", e);
    }

    let text = `*${inv.businessName}* 📜\n`;
    text += `*NOTA DE REMISIÓN:* ${inv.invoiceNumber}\n`;
    text += `Fecha: ${formattedDate} | Vence: ${formattedDue}\n`;
    text += `Cliente: *${inv.clientName}*\n\n`;
    
    text += `*🛠️ RESUMEN DEL PROYECTO:*\n`;
    inv.items.forEach((item, i) => {
      text += `• (${item.quantity} pz) ${item.description} - $${item.total.toLocaleString("es-MX")} MXN\n`;
    });
    text += `\n`;

    text += `*💵 RESUMEN DE COSTOS:*\n`;
    text += `• *SUBTOTAL:* $${inv.subtotal.toLocaleString("es-MX")} MXN\n`;
    text += `• *TOTAL (IVA ${inv.ivaPercent}%):* $${inv.total.toLocaleString("es-MX")} MXN\n`;
    text += `• *ANTICIPO PAGADO:* $${inv.advancePayment.toLocaleString("es-MX")} MXN\n`;
    text += `• *SALDO RESTANTE:* *$${inv.pendingBalance.toLocaleString("es-MX")} MXN*\n\n`;

    text += `📋 *REMISIÓN Y PDF DIGITAL EN LÍNEA:*\n`;
    text += `Acceda y guarde como PDF o imprima su nota formalizada desde aquí:\n`;
    text += `🔗 ${pdfLink}\n\n`;
    text += `_¡Agradecemos su preferencia y confianza en nuestra cancelería!_`;

    const encoded = encodeURIComponent(text);
    const cleanPhone = inv.clientPhone.replace(/[^0-9]/g, "");
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone ? "52" + cleanPhone : ""}&text=${encoded}`;
    
    window.open(url, "_blank");
  };

  // Thermal Portables 58mm/80mm Print handler
  const handlePrintThermalTicket = (inv: DeliveryInvoice) => {
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (!printWindow) {
      alert("Por favor habilita las ventanas emergentes (popups) para poder imprimir la nota de remisión en tu terminal térmica.");
      return;
    }

    const formattedDate = new Date(inv.date).toLocaleDateString("es-MX");
    const formattedDue = new Date(inv.dueDate).toLocaleDateString("es-MX");

    const itemsRows = inv.items.map(item => `
      <tr>
        <td colspan="2" style="font-weight: bold; padding-top: 6px;">${item.description}</td>
      </tr>
      <tr style="border-bottom: 1px dashed #ddd;">
        <td style="padding-bottom: 4px;">${item.quantity} pz x $${item.unitPrice.toLocaleString("es-MX")}</td>
        <td style="text-align: right; font-weight: bold; padding-bottom: 4px;">$${item.total.toLocaleString("es-MX")}</td>
      </tr>
    `).join("");

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket ${inv.invoiceNumber}</title>
  <style>
    @gpage { margin: 0; }
    body {
      width: 260px;
      margin: 0 auto;
      padding: 10px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      color: #000;
      background: #fff;
      line-height: 1.35;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .header-title {
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .subtitle {
      font-size: 9px;
      margin-top: 3px;
      margin-bottom: 6px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 8px 0;
    }
    .table-totals {
      width: 100%;
      font-size: 11px;
      margin-top: 6px;
    }
    .table-totals td {
      padding: 2px 0;
    }
    .signature-box {
      margin-top: 35px;
      text-align: center;
      font-size: 9px;
    }
    .signature-line {
      border-top: 1px solid #000;
      width: 140px;
      margin: 30px auto 3px auto;
    }
  </style>
</head>
<body onload="window.print(); setTimeout(function(){ window.close(); }, 800);">
  <div class="text-center">
    <div class="header-title">${inv.businessName.toUpperCase()}</div>
    <div style="font-size: 9px; margin-top: 1px; font-weight: bold;">ALUMINIOS DE VERACRUZ</div>
    <div class="subtitle">
      ${inv.businessAddress}<br>
      Tel: ${inv.businessPhone}<br>
      RFC: ${inv.businessRFC || "S/R"}
    </div>
  </div>

  <div class="divider"></div>

  <div style="font-size: 10.5px;">
    <strong>Nº TICKET :</strong> ${inv.invoiceNumber}<br/>
    <strong>FECHA    :</strong> ${formattedDate}<br/>
    <strong>CLIENTE  :</strong> ${inv.clientName}<br/>
    ${inv.clientPhone ? `<strong>TELÉFONO :</strong> ${inv.clientPhone}<br/>` : ''}
    <strong>ENTREGA  :</strong> ${formattedDue}
  </div>

  <div class="divider"></div>
  <div class="text-center" style="font-size: 9px; font-weight: bold; letter-spacing: 1px;">[[ CONCEPTOS COTIZADOS ]]</div>

  <table style="width: 100%; font-size: 10.5px; border-collapse: collapse;">
    ${itemsRows}
  </table>

  <div class="divider"></div>

  <table class="table-totals">
    <tr>
      <td>SUBTOTAL:</td>
      <td style="text-align: right;">$${inv.subtotal.toLocaleString("es-MX")}</td>
    </tr>
    <tr>
      <td>IVA (${inv.ivaPercent}%):</td>
      <td style="text-align: right;">$${Math.round(inv.subtotal * (inv.ivaPercent / 100)).toLocaleString("es-MX")}</td>
    </tr>
    <tr style="font-weight: bold; font-size: 11.5px;">
      <td>TOTAL GENERAL:</td>
      <td style="text-align: right;">$${inv.total.toLocaleString("es-MX")} MXN</td>
    </tr>
    <tr style="color: #000; font-style: italic;">
      <td>ANTICIPO RECIBIDO:</td>
      <td style="text-align: right;">-$${inv.advancePayment.toLocaleString("es-MX")}</td>
    </tr>
    <tr style="font-weight: bold; font-size: 12px; border-top: 1px solid #000; border-bottom: 2px double #000; background-color: #eee;">
      <td>SALDO PENDIENTE:</td>
      <td style="text-align: right; padding: 2px;">$${inv.pendingBalance.toLocaleString("es-MX")} MXN</td>
    </tr>
  </table>

  <div style="margin-top: 12px; font-size: 8.5px; line-height: 1.35; border: 1px solid #000; padding: 5px;">
    <strong>Condiciones y Garantía:</strong><br/>
    ${inv.notes || "Garantía de fábrica en perfiles de aluminio y herrajes defectuosos. No cubre roturas accidentales de cristales."}
  </div>

  <div class="signature-box">
    <div class="signature-line"></div>
    RECIBÍ DE CONFORMIDAD<br/>
    Firma del Cliente
  </div>

  <div class="divider" style="margin-top: 20px;"></div>
  <div class="text-center" style="font-size: 8px; margin-top: 4px;">
    ¡Gracias por su preferencia!<br>
    Soporte Técnico de Impresión Aludev
  </div>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Quick helper to change status lists
  const handleToggleStatus = (inv: DeliveryInvoice, status: DeliveryInvoice["status"]) => {
    updateInvoice(inv.id, { status });
  };

  // Class styles for active theme colors
  const themeClasses = {
    blue: {
      primary: "bg-blue-900",
      text: "text-blue-900 dark:text-blue-100 border-blue-900",
      accent: "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700/50"
    },
    dark: {
      primary: "bg-slate-900 dark:bg-slate-950",
      text: "text-slate-900 dark:text-slate-50 border-slate-900",
      accent: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
    },
    emerald: {
      primary: "bg-emerald-900",
      text: "text-emerald-900 dark:text-emerald-100 border-emerald-900",
      accent: "bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200"
    },
    steel: {
      primary: "bg-slate-700",
      text: "text-slate-700 dark:text-slate-200 border-slate-700",
      accent: "bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
    }
  };

  const selectedTheme = themeClasses[invoiceTheme];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Gestión de Notas de Remisión y Recibos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Imprime comprobantes detallados con anticipos amortizados y saldo liquidable por cobrar al cliente.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {!showInvoiceForm ? (
            <button
              onClick={() => setShowInvoiceForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus size={14} />
              Crear Nueva Remisión
            </button>
          ) : (
            <button
              onClick={() => setShowInvoiceForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition"
            >
              <X size={14} />
              Cancelar Formulario
            </button>
          )}
        </div>
      </div>

      {showInvoiceForm ? (
        /* ISSUING NEW NOTE DE REMISIÓN FORM stage */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-md space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-700/50 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Formulario de Facturación Rápida</h3>
            <span className="text-xs text-slate-400">Las notas creadas se guardan en el historial del taller</span>
          </div>

          <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs font-sans">
            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Nombre Completo del Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Ignacio Martínez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Celular / Teléfono Cliente</label>
                <input
                  type="text"
                  placeholder="ej: 5539124021"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Fecha Estimada de Entrega</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Dirección de Instalación</label>
              <input
                type="text"
                placeholder="ej: Calle Del Río 24, Int 4, San Angel, CDMX"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Sub-items list generator */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wide">
                Agregar Conceptos de Ensamblaje / Materiales a la Nota
              </h4>
              
              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider block mr-1 font-mono">⚡ Servicios Rápidos:</span>
                <button
                  type="button"
                  onClick={() => {
                    setItemText("Servicio de Mantenimiento Preventivo de Portón Automático. El control depende la marca y modelo.");
                    setItemPrice(1500);
                    setItemQty(1);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-250/80 text-[10px] font-bold py-1 px-2.5 rounded-lg transition"
                >
                  🔧 Mantenimiento Portón ($1,500)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemText("Servicio de Diagnóstico y Reparación de Pistones / Automatismo de Portón Eléctrico.");
                    setItemPrice(1800);
                    setItemQty(1);
                  }}
                  className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition"
                >
                  ⚙️ Reparación Automatismo ($1,800)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemText("Programación de Control Remoto Inalámbrico para Portón Eléctrico (Suministro y mano de obra).");
                    setItemPrice(600);
                    setItemQty(1);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition"
                >
                  🎮 Programar Control ($600)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemText("Servicio de Cambio de Carretillas, Alineación y Sellado Hermético de Cancelería de Aluminio.");
                    setItemPrice(1200);
                    setItemQty(1);
                  }}
                  className="bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold py-1 px-2.5 rounded-lg transition"
                >
                  🪜 Servicio Reparación Cancel ($1,200)
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 text-[10px] mb-1">Descripción del Cancél / Servicio</label>
                  <input
                    type="text"
                    placeholder="ej: Ventana Corrediza 2 hojas (1.2 x 1.5m) de 3 pulgadas"
                    value={itemText}
                    onChange={(e) => setItemText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1 text-center">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQty}
                    onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-center text-xs text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1 text-right">Precio Unit ($)</label>
                  <input
                    type="number"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-right font-mono text-xs text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddSubItem}
                    className="w-full bg-slate-800 dark:bg-slate-950 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded text-center transition cursor-pointer"
                  >
                    + Añadir
                  </button>
                </div>
              </div>

              {/* Items Table inside Form */}
              <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg overflow-hidden mt-3 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] uppercase border-b border-slate-200 dark:border-slate-700">
                      <th className="p-2">Concepto Detallado</th>
                      <th className="p-2 text-center">Cant</th>
                      <th className="p-2 text-right">P. Unitario</th>
                      <th className="p-2 text-right">Importe</th>
                      <th className="p-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {invoiceItemsList.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-sans font-medium text-slate-800 dark:text-slate-100">{item.description}</td>
                        <td className="p-2 text-center text-slate-700 dark:text-slate-200 font-bold">{item.quantity}</td>
                        <td className="p-2 text-right text-slate-600 dark:text-slate-300">${item.unitPrice.toLocaleString()}</td>
                        <td className="p-2 text-right text-slate-800 dark:text-slate-100 font-bold">${item.total.toLocaleString()}</td>
                        <td className="p-2 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoiceItemsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400 font-sans italic">
                          No has añadido ningún concepto al recibo todavía. Usa los selectores de arriba.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals & Advance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-100 dark:bg-slate-700 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">IVA (%)</label>
                <select
                  value={ivaPercent}
                  onChange={(e) => setIvaPercent(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 font-bold"
                >
                  <option value="16">16% (IVA Regular)</option>
                  <option value="8">8% (Fronterizo)</option>
                  <option value="0">0% (Sin gravamen)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Anticipo Recibido ($ Pesos)</label>
                <input
                  type="number"
                  placeholder="ej: 3000"
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 rounded p-1.5 font-mono font-black text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 mb-1 font-semibold">Términos Especiales / Notas de entrega</label>
                <input
                  type="text"
                  placeholder="ej: Se requiere anticipo del 50%. Pago en efectivo."
                  value={remNote}
                  onChange={(e) => setRemNote(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white font-bold text-sm rounded-xl transition shadow-sm"
            >
              Completar y Guardar Nota de Remisión
            </button>
          </form>
        </div>
      ) : (
        /* REGULAR LAYOUT: LIST OF ISSUED NOTES ON LEFT, VIEWING/PRINT PANEL ON RIGHT */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* INVOICES DIRECTORY TREE (Col span 2) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between h-[520px]">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-widest pb-2 border-b border-slate-100 dark:border-slate-700/50 mb-4 flex justify-between items-center">
                <span>Historial de Remisiones</span>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold font-mono">
                  {state.invoices.length} Total
                </span>
              </h3>

              <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                {state.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                      selectedInvoiceId === inv.id
                        ? "bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700/50 text-blue-900 dark:text-blue-100"
                        : "bg-slate-50 border-slate-150 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {/* Delete handler */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInvoice(inv.id);
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"
                      title="Borrar Nota"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div>
                      <div className="flex justify-between items-center pr-5">
                        <strong className="text-xs font-mono font-bold">{inv.invoiceNumber}</strong>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono border ${
                          inv.status === "pendiente"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : inv.status === "fabricando"
                            ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{inv.clientName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.date} &bull; {inv.items.length} items</p>
                    </div>

                    <div className="mt-2 text-right border-t border-dashed border-slate-200/80 pt-1.5 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-slate-400">Saldo Restante:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-100 font-bold">
                        ${inv.pendingBalance.toLocaleString()} MXN
                      </strong>
                    </div>
                  </div>
                ))}

                {state.invoices.length === 0 && (
                  <div className="text-center py-20 text-slate-400">
                    <p className="text-sm">Sin notas de remisiones emitidas.</p>
                  </div>
                )}
              </div>
            </div>

            {state.invoices.length > 0 && (
              <p className="text-[9px] text-slate-400 font-mono text-center">
                Selecciona una remisión del menú para abrir su visualizador de impresión fiscal.
              </p>
            )}
          </div>

          {/* PRINTABLE NOTA DE REMISIÓN PREVIEWER SHEET (Col span 3) */}
          <div className="lg:col-span-3">
            {activeInvoice ? (
              <div className="space-y-4">
                {/* Visual control settings bar */}
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Diseño Nota:</span>
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
                      <button
                        type="button"
                        onClick={() => setIsThermalTicket(false)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                          !isThermalTicket
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-150"
                        }`}
                      >
                        📄 Carta / PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsThermalTicket(true)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                          isThermalTicket
                            ? "bg-slate-800 dark:bg-slate-950 text-white shadow-sm dark:bg-slate-700"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-150"
                        }`}
                      >
                        📟 Ticket Térmico
                      </button>
                    </div>

                    {!isThermalTicket && (
                      <div className="flex items-center gap-1 ml-2 border-l pl-3 border-slate-205">
                        <Palette size={13} className="text-slate-400" />
                        <span>Color:</span>
                        <select
                          value={invoiceTheme}
                          onChange={(e) => setInvoiceTheme(e.target.value as any)}
                          className="bg-white dark:bg-slate-900 border text-xs px-1.5 py-0.5 rounded font-semibold"
                        >
                          <option value="blue">Azul</option>
                          <option value="dark">Negro</option>
                          <option value="emerald">Verde</option>
                          <option value="steel">Gris</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status manager dropdown */}
                    <select
                      value={activeInvoice.status}
                      onChange={(e) => handleToggleStatus(activeInvoice, e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border text-xs px-2 py-0.5 rounded font-bold uppercase font-mono"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="fabricando">Fabricando</option>
                      <option value="entregado">Entregado</option>
                      <option value="atrasado">Atrasado</option>
                    </select>

                    <button
                      onClick={() => handleWhatsAppShare(activeInvoice)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-50 dark:bg-emerald-900/400 text-white text-xs font-semibold rounded flex items-center gap-1 transition"
                      title="Enviar resumen por WhatsApp"
                    >
                      <Share2 size={12} />
                      WhatsApp
                    </button>
                    
                    <button
                      onClick={() => isThermalTicket ? handlePrintThermalTicket(activeInvoice) : window.print()}
                      className={`px-2.5 py-1 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm font-mono ${
                        isThermalTicket ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/10" : "bg-slate-800 dark:bg-slate-950 hover:bg-slate-700"
                      }`}
                    >
                      <Printer size={12} />
                      {isThermalTicket ? "Imprimir Ticket" : "Imprimir Carta"}
                    </button>
                  </div>
                </div>

                {/* THE PHYSICALLY RENDERED COMPLETED INVOICE SLIP PAPER */}
                {isThermalTicket ? (
                  /* SIMULATED THERMAL TICKET (58mm/80mm Style) */
                  <div 
                    className="max-w-[325px] mx-auto bg-zinc-50 border border-zinc-200 dark:bg-zinc-100 p-5 rounded-md shadow-xl font-mono text-zinc-900 overflow-hidden relative select-none animate-fade-in"
                    id="printable-remision-sheet"
                  >
                    {/* Top Torn/Serrated Roll paper effect */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 flex justify-between overflow-hidden opacity-30 pointer-events-none">
                      {Array.from({ length: 32 }).map((_, i) => (
                        <span key={i} className="w-2 h-2 bg-slate-400 rounded-full -mt-2 shrink-0 -mx-0.5"></span>
                      ))}
                    </div>

                    <div className="text-center pt-3">
                      <h3 className="text-xs font-black tracking-wider text-zinc-950 uppercase">{activeInvoice.businessName}</h3>
                      <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-tight">ALUMINIOS DE VERACRUZ</p>
                      <p className="text-[9px] text-zinc-500">{activeInvoice.businessAddress}</p>
                      <p className="text-[9px] text-zinc-500">Tel: {activeInvoice.businessPhone}</p>
                      <p className="text-[9px] text-zinc-500">RFC: {activeInvoice.businessRFC || "Sin RFC"}</p>
                    </div>

                    <div className="text-[10px] my-3 border-t border-b border-dashed border-zinc-400 py-2 space-y-0.5 text-zinc-800 leading-tight">
                      <div><strong>Nº TICKET :</strong> {activeInvoice.invoiceNumber}</div>
                      <div><strong>EMISIÓN   :</strong> {new Date(activeInvoice.date).toLocaleDateString("es-MX")}</div>
                      <div><strong>CLIENTE   :</strong> {activeInvoice.clientName}</div>
                      {activeInvoice.clientPhone && <div><strong>CEL      :</strong> {activeInvoice.clientPhone}</div>}
                      <div><strong>ENTREGA   :</strong> {new Date(activeInvoice.dueDate).toLocaleDateString("es-MX")}</div>
                    </div>

                    <div className="text-[9px] font-bold text-center tracking-wider text-zinc-500 mb-2">== DETALLE DE CONCEPTOS ==</div>
                    
                    <div className="divide-y divide-dashed divide-zinc-200 text-[10px] space-y-1.5 font-mono">
                      {activeInvoice.items.map((item, idx) => (
                        <div key={idx} className="pt-2">
                          <div className="font-bold text-zinc-900 leading-tight">{item.description}</div>
                          <div className="flex justify-between text-zinc-600 mt-0.5">
                            <span>{item.quantity} pz x ${item.unitPrice.toLocaleString("es-MX")}</span>
                            <span className="font-bold text-zinc-900">${item.total.toLocaleString("es-MX")}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="my-3 border-t border-dashed border-zinc-400 pt-2 space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-zinc-700">
                        <span>SUBTOTAL:</span>
                        <span>${activeInvoice.subtotal.toLocaleString("es-MX")}</span>
                      </div>
                      <div className="flex justify-between text-zinc-700">
                        <span>IVA ({activeInvoice.ivaPercent}%):</span>
                        <span>${Math.round(activeInvoice.subtotal * (activeInvoice.ivaPercent / 100)).toLocaleString("es-MX")}</span>
                      </div>
                      <div className="flex justify-between text-zinc-950 font-black text-[11px] pt-1 border-t border-dashed border-zinc-350">
                        <span>TOTAL GENERAL:</span>
                        <span>${activeInvoice.total.toLocaleString("es-MX")} MXN</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 italic font-bold">
                        <span>ANTICIPO RECIBIDO:</span>
                        <span>-${activeInvoice.advancePayment.toLocaleString("es-MX")}</span>
                      </div>
                      <div className="flex justify-between text-red-700 font-bold bg-amber-100 p-1.5 rounded mt-1 border border-amber-205 text-[10.5px]">
                        <span>SALDO PENDIENTE:</span>
                        <span>${activeInvoice.pendingBalance.toLocaleString("es-MX")} MXN</span>
                      </div>
                    </div>

                    {activeInvoice.notes && (
                      <div className="text-[9px] text-zinc-650 leading-normal bg-zinc-200/50 p-2 rounded border border-zinc-250 my-4">
                        <span className="font-bold block uppercase text-zinc-600 tracking-wider mb-0.5">Condiciones:</span>
                        {activeInvoice.notes}
                      </div>
                    )}

                    <div className="text-center pt-4 my-3 text-zinc-400">
                      <div className="border-t border-zinc-300 w-32 mx-auto pt-1 text-[8px] uppercase">
                        Firma del Cliente
                      </div>
                    </div>

                    <div className="text-center text-[9px] text-zinc-400 mt-6 border-t border-dashed border-zinc-205 pt-3">
                      ¡Agradecemos su preferencia!<br />
                      Aludev Aluminios de Veracruz
                    </div>
                  </div>
                ) : (
                  <div
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-205 shadow-lg print:border-none print:shadow-none font-sans relative overflow-hidden"
                    id="printable-remision-sheet"
                  >
                    {/* Watermark theme accent line */}
                    <div className={`h-2.5 w-full absolute top-0 left-0 ${selectedTheme.primary}`} />

                    {/* Header Title block */}
                    <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-150">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                          {activeInvoice.businessName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight max-w-sm">
                          {activeInvoice.businessAddress}
                          <br />
                          Atención: <strong>{activeInvoice.businessPhone}</strong>
                          {activeInvoice.businessRFC && (
                            <> | RFC: <strong className="font-mono">{activeInvoice.businessRFC}</strong></>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`px-3 py-1 font-mono text-[10px] uppercase font-black text-white rounded shrink-0 ${selectedTheme.primary}`}>
                          Nota de Remisión
                        </span>
                        <h3 className="text-xl font-bold font-mono text-slate-700 dark:text-slate-200 mt-1.5">
                          {activeInvoice.invoiceNumber}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Emisión: {new Date(activeInvoice.date).toLocaleDateString("es-MX")}
                        </p>
                      </div>
                    </div>

                    {/* Customer and Due date info */}
                    <div className="grid grid-cols-2 gap-4 py-4 text-xs">
                      <div className="space-y-1 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">DENTINATARIO (CLIENTE):</span>
                        <p className="font-bold text-slate-850 text-sm leading-tight">{activeInvoice.clientName}</p>
                        {activeInvoice.clientPhone && (
                          <p className="text-slate-500 dark:text-slate-400 font-mono">Cel: {activeInvoice.clientPhone}</p>
                        )}
                        {activeInvoice.clientAddress && (
                          <p className="text-slate-400 leading-tight">{activeInvoice.clientAddress}</p>
                        )}
                      </div>

                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/50 text-right">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">VENCIMIENTO DE ENTREGA:</span>
                          <strong className="text-slate-800 dark:text-slate-100 font-mono text-sm block mt-0.5">
                            {new Date(activeInvoice.dueDate).toLocaleDateString("es-MX")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">SALDO ESTADO:</span>
                          <span className="text-xs bg-red-100 text-red-800 font-mono font-black px-2 py-0.5 rounded border border-red-200 uppercase inline-block">
                            {activeInvoice.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Items list Table */}
                    <table className="w-full text-left border-collapse text-xs my-3">
                      <thead>
                        <tr className={`text-white text-[10px] uppercase font-mono ${selectedTheme.primary}`}>
                          <th className="p-2.5 rounded-l">Descripción del Cancél / Ventana</th>
                          <th className="p-2.5 text-center">Cant</th>
                          <th className="p-2.5 text-right flex-nowrap">Precio Unit.</th>
                          <th className="p-2.5 text-right rounded-r">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeInvoice.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-medium text-slate-800 dark:text-slate-100">{item.description}</td>
                            <td className="p-2.5 text-center text-slate-700 dark:text-slate-200 font-mono font-bold">{item.quantity}</td>
                            <td className="p-2.5 text-right text-slate-600 dark:text-slate-300 font-mono">${item.unitPrice.toLocaleString()}</td>
                            <td className="p-2.5 text-right text-slate-800 dark:text-slate-100 font-bold font-mono">${item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Calculations breakdown block */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-4 border-t border-slate-150 text-xs">
                      
                      {/* Legal Notes / Conditions */}
                      <div className="max-w-sm text-[10px] text-slate-400 leading-normal bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <strong className="text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wide">Acuerdo de Servicio:</strong>
                        {activeInvoice.notes}
                      </div>

                      {/* Numeric values box */}
                      <div className="w-full sm:w-60 text-right space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Subtotal:</span>
                          <span>${activeInvoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400 border-b border-dashed border-slate-200 dark:border-slate-700 pb-1">
                          <span>IVA gravado ({activeInvoice.ivaPercent}%):</span>
                          <span>${Math.round(activeInvoice.subtotal * (activeInvoice.ivaPercent / 100)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-800 dark:text-slate-100 font-bold text-sm">
                          <span>Importe Total:</span>
                          <span>${activeInvoice.total.toLocaleString()} MXN</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-serif text-xs">
                          <span>Anticipo liquidado:</span>
                          <span>-${activeInvoice.advancePayment.toLocaleString()}</span>
                        </div>
                        <div className={`flex justify-between font-black text-sm p-1.5 rounded ${selectedTheme.accent} ${selectedTheme.text}`}>
                          <span>PAGO PENDIENTE:</span>
                          <span>${activeInvoice.pendingBalance.toLocaleString()} MXN</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual signature lines for formal validity */}
                    <div className="grid grid-cols-2 gap-12 pt-16 text-center text-[10px] text-slate-400 font-mono print:pt-14">
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-1.5 max-w-[180px] mx-auto">
                        ENTREGÓ CONFORME
                        <span className="block text-[8px] text-slate-300 mt-1">Sello del Taller</span>
                      </div>
                      <div className="border-t border-slate-300 dark:border-slate-600 pt-1.5 max-w-[180px] mx-auto">
                        RECIBIÓ DE CONFORMIDAD
                        <span className="block text-[8px] text-slate-300 mt-1">Firma del Cliente</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 leading-relaxed max-w-sm mx-auto space-y-3">
                <FileText size={44} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Recibo de Remisión Digital</p>
                <p className="text-xs text-slate-400">
                  Selecciona una nota del panel lateral para abrir su plantilla imprimible formalizada para el cliente.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
