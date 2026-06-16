/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { FileText, Award, Calendar, ShieldCheck, Printer, Save, BadgeDollarSign, User, MapPin, Tag } from "lucide-react";

export const DocumentosAludev: React.FC = () => {
  const { state } = useWorkshop();
  const [activeDocTab, setActiveDocTab] = useState<"contrato" | "garantia" | "recibo">("contrato");

  // State for Contract (Contrato)
  const [contratoData, setContratoData] = useState({
    folio: "CONTR-2026-001",
    clientName: state.quotes.length > 0 ? "Cliente en Proyecto Activo" : "Alejandro Ruiz Estrada",
    clientPhone: "229-915-4321",
    clientAddress: "Av. Ruiz Cortines #102, Veracruz, Ver.",
    projectName: "Suministro e Instalación de Cancelería de Aluminio Española",
    totalAmount: state.quotes.length > 0 ? state.quotes.reduce((sum, q) => sum + q.calculated.total, 0) : 18500,
    advancePayment: state.quotes.length > 0 ? Math.round(state.quotes.reduce((sum, q) => sum + q.calculated.total, 0) * 0.5) : 9250,
    executionDays: "12",
    startDate: new Date().toISOString().split("T")[0],
    terms: "DECLARACIONES Y CLÁUSULAS:\n1. EL PRESTADOR se compromete a realizar el suministro, ensamble e instalación de las piezas de aluminio y cristal detalladas en las notas de remisión correspondientes.\n2. EL CLIENTE abonará el 50% en concepto de anticipo previo al inicio de fabricación, y el 50% restante concluir la instalación física de la obra.\n3. Cualquier adición de cancelería posterior a este documento incrementará el costo original de la obra.\n4. Se otorga una garantía estructural por vicios ocultos de hasta un año posterior a la instalación física."
  });

  // State for Warranty (Garantía)
  const [garantiaData, setGarantiaData] = useState({
    folio: "GAR-2602-001",
    clientName: "Alejandro Ruiz Estrada",
    projectName: "Residencial Las Palmas - Portón Abatible y Ventanas",
    instalationDate: new Date().toISOString().split("T")[0],
    alumWarrantyYears: "5",
    glassWarrantyYears: "2",
    accWarrantyYears: "1",
    terms: "CONDICIONES DE LA POLIZA DE GARANTÍA:\n- Esta garantía cubre defectos de fábrica en perfiles de aluminio (decoloración o deformaciones estructurales) y herrajes defectuosos bajos condiciones normales de uso.\n- No cubre roturas mecánicas accidentales de cristales posteriores a la entrega e instalación.\n- La garantía quedará sin validez por modificaciones o reparaciones por personal ajeno a ALUDEV."
  });

  // State for Payment Receipt (Recibo de Pago)
  const [reciboData, setReciboData] = useState({
    folio: "REC-2603-045",
    clientName: "Alejandro Ruiz Estrada",
    amountNumeric: 9250,
    amountText: "Nueve mil doscientos cincuenta pesos 00/100 M.N.",
    concept: "Anticipo de 50% para portón abatible inteligente de duela de 10cm y ventana proyección.",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "Transferencia Electrónica SPEI",
    reference: "REF-PROYECTO-ALUDEV",
    notes: "Agradecemos su confianza en ALUDEV. Este recibo sirve como comprobante del pago parcial para dar inicio al ensamble."
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 font-sans tracking-tight">
            Documentación Comercial & Legal ALUDEV
          </h1>
          <p className="text-slate-500 text-xs">
            Genera al instante contratos legales de obra, recibos de pago formales y pólizas de garantía de materiales con formatos listos para imprimir.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
          id="print-document-button"
        >
          <Printer size={15} />
          Imprimir / Descargar PDF
        </button>
      </div>

      {/* Tabs navigation for document types */}
      <div className="grid grid-cols-3 bg-slate-100 p-1.5 rounded-2xl gap-1 max-w-2xl">
        <button
          onClick={() => setActiveDocTab("contrato")}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 ${
            activeDocTab === "contrato" ? "bg-white text-blue-900 shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={14} />
          Contrato de Obra
        </button>
        <button
          onClick={() => setActiveDocTab("garantia")}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 ${
            activeDocTab === "garantia" ? "bg-white text-emerald-900 shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award size={14} />
          Póliza de Garantía
        </button>
        <button
          onClick={() => setActiveDocTab("recibo")}
          className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition duration-200 ${
            activeDocTab === "recibo" ? "bg-white text-amber-900 shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <BadgeDollarSign size={14} />
          Recibo de Pago
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* INTERACTIVE FORM CONTROLS (Left side 2 cols) */}
        <div className="lg:col-span-2 space-y-4 print:hidden">
          
          {/* CONTRATO FORMULARIO */}
          {activeDocTab === "contrato" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-l-4 border-blue-500 pl-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Datos del Contrato</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Clave Folio</label>
                  <input
                    type="text"
                    value={contratoData.folio}
                    onChange={(e) => setContratoData({ ...contratoData, folio: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={contratoData.clientName}
                    onChange={(e) => setContratoData({ ...contratoData, clientName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Teléfono Cliente</label>
                    <input
                      type="text"
                      value={contratoData.clientPhone}
                      onChange={(e) => setContratoData({ ...contratoData, clientPhone: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Fecha Inicio</label>
                    <input
                      type="date"
                      value={contratoData.startDate}
                      onChange={(e) => setContratoData({ ...contratoData, startDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Domicilio de Obra</label>
                  <input
                    type="text"
                    value={contratoData.clientAddress}
                    onChange={(e) => setContratoData({ ...contratoData, clientAddress: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Objeto del Contrato (Proyecto)</label>
                  <textarea
                    rows={2}
                    value={contratoData.projectName}
                    onChange={(e) => setContratoData({ ...contratoData, projectName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Plazo Días</label>
                    <input
                      type="text"
                      value={contratoData.executionDays}
                      onChange={(e) => setContratoData({ ...contratoData, executionDays: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-center"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Total Obra $</label>
                    <input
                      type="number"
                      value={contratoData.totalAmount}
                      onChange={(e) => setContratoData({ ...contratoData, totalAmount: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-right font-bold"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Anticipo $</label>
                    <input
                      type="number"
                      value={contratoData.advancePayment}
                      onChange={(e) => setContratoData({ ...contratoData, advancePayment: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Declaraciones y Cláusulas</label>
                  <textarea
                    rows={4}
                    value={contratoData.terms}
                    onChange={(e) => setContratoData({ ...contratoData, terms: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-[11px] font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GARANTIA FORMULARIO */}
          {activeDocTab === "garantia" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-l-4 border-emerald-500 pl-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Datos de la Garantía</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Registro Folio</label>
                  <input
                    type="text"
                    value={garantiaData.folio}
                    onChange={(e) => setGarantiaData({ ...garantiaData, folio: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={garantiaData.clientName}
                    onChange={(e) => setGarantiaData({ ...garantiaData, clientName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Descripción de la Obra</label>
                  <input
                    type="text"
                    value={garantiaData.projectName}
                    onChange={(e) => setGarantiaData({ ...garantiaData, projectName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Fecha Instalación</label>
                    <input
                      type="date"
                      value={garantiaData.instalationDate}
                      onChange={(e) => setGarantiaData({ ...garantiaData, instalationDate: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Garantía Alum. (Años)</label>
                    <input
                      type="text"
                      value={garantiaData.alumWarrantyYears}
                      onChange={(e) => setGarantiaData({ ...garantiaData, alumWarrantyYears: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Garantía Vidrios (Años)</label>
                    <input
                      type="text"
                      value={garantiaData.glassWarrantyYears}
                      onChange={(e) => setGarantiaData({ ...garantiaData, glassWarrantyYears: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Garantía Accesorios (Años)</label>
                    <input
                      type="text"
                      value={garantiaData.accWarrantyYears}
                      onChange={(e) => setGarantiaData({ ...garantiaData, accWarrantyYears: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Cláusulas de Cobertura</label>
                  <textarea
                    rows={5}
                    value={garantiaData.terms}
                    onChange={(e) => setGarantiaData({ ...garantiaData, terms: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-[11px] font-mono leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* RECIBO FORMULARIO */}
          {activeDocTab === "recibo" && (
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-l-4 border-amber-500 pl-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Datos del Recibo</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">No. Recibo</label>
                    <input
                      type="text"
                      value={reciboData.folio}
                      onChange={(e) => setReciboData({ ...reciboData, folio: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Fecha Recibo</label>
                    <input
                      type="date"
                      value={reciboData.date}
                      onChange={(e) => setReciboData({ ...reciboData, date: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Recibido del Cliente</label>
                  <input
                    type="text"
                    value={reciboData.clientName}
                    onChange={(e) => setReciboData({ ...reciboData, clientName: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Monto ($)</label>
                    <input
                      type="number"
                      value={reciboData.amountNumeric}
                      onChange={(e) => setReciboData({ ...reciboData, amountNumeric: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs text-right font-bold text-amber-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Método Pago</label>
                    <input
                      type="text"
                      value={reciboData.paymentMethod}
                      onChange={(e) => setReciboData({ ...reciboData, paymentMethod: e.target.value })}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Cantidad con Letra</label>
                  <input
                    type="text"
                    value={reciboData.amountText}
                    onChange={(e) => setReciboData({ ...reciboData, amountText: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Concepto del Pago</label>
                  <textarea
                    rows={2}
                    value={reciboData.concept}
                    onChange={(e) => setReciboData({ ...reciboData, concept: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Referencia / No. Operación</label>
                  <input
                    type="text"
                    value={reciboData.reference}
                    onChange={(e) => setReciboData({ ...reciboData, reference: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nota Adicional / Recordtorio</label>
                  <textarea
                    rows={2}
                    value={reciboData.notes}
                    onChange={(e) => setReciboData({ ...reciboData, notes: e.target.value })}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PRINTABLE SHEET DUPLEX PREVIEW (Right side 3 cols) */}
        <div className="lg:col-span-3">
          <div className="bg-slate-50 p-1 sm:p-5 rounded-2xl border border-slate-100 flex justify-center print:p-0 print:border-none print:bg-white min-h-[750px] shadow-inner">
            
            {/* PHYSICAL PAPER CONTAINER SHEET */}
            <div className="w-full max-w-2xl bg-white p-6 sm:p-10 border border-slate-200 rounded-xl shadow-xl flex flex-col justify-between print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-850 font-sans tracking-wide">
              
              {/* TOP HEADER BRANDING */}
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-double border-slate-305 pb-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">ALUDEV</h1>
                    <p className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                      Cancelería y Portones Automáticos
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 max-w-sm">
                      Francisco Javier mina 50, Veracruz, Veracruz
                      <br />
                      Cel: 229-684-6549 | Email: contacto@aludev.mx
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="inline-block bg-slate-900 text-white py-1 px-3 rounded font-mono text-[11px] font-bold">
                      {activeDocTab === "contrato" && "CONTRATO DE OBRA"}
                      {activeDocTab === "garantia" && "POLIZA DE GARANTÍA"}
                      {activeDocTab === "recibo" && "RECIBO DE PAGO"}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500">
                      <strong>FOLIO:</strong>{" "}
                      {activeDocTab === "contrato" && contratoData.folio}
                      {activeDocTab === "garantia" && garantiaData.folio}
                      {activeDocTab === "recibo" && reciboData.folio}
                      <br />
                      <strong>FECHA:</strong>{" "}
                      {activeDocTab === "contrato" && contratoData.startDate}
                      {activeDocTab === "garantia" && garantiaData.instalationDate}
                      {activeDocTab === "recibo" && reciboData.date}
                    </div>
                  </div>
                </div>

                {/* CONTENT COMPILER BY DOC TYPE */}
                {activeDocTab === "contrato" && (
                  <div className="space-y-4 text-xs">
                    
                    {/* Clientes Metadatos */}
                    <div className="bg-slate-100/50 p-4 rounded-xl grid grid-cols-2 gap-3 border border-slate-200">
                      <div>
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contratante (Cliente)</h4>
                        <p className="font-bold text-slate-800 text-[13px] mt-0.5">{contratoData.clientName}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">📍 {contratoData.clientAddress}</p>
                        <p className="text-slate-500 text-[11px]">📞 {contratoData.clientPhone}</p>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contratista (Fabricante)</h4>
                        <p className="font-bold text-slate-800 text-[13px] mt-0.5">ALUDEV Representaciones</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">📍 Veracruz, Veracruz</p>
                        <p className="text-slate-500 text-[11px]">📞 229-684-6549</p>
                      </div>
                    </div>

                    {/* Especificaciones Obra */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">PRIMERA. OBJETO DE CONTRATACIÓN</h4>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        El contratante encomienda al contratista la fabricación integral y la instalación en campo de lo siguiente:
                        <br />
                        <strong className="text-slate-900 text-xs inline-block mt-0.5">Obra: {contratoData.projectName}</strong>
                      </p>
                    </div>

                    {/* Costos y Fechas */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Importe Acordado</span>
                        <p className="text-[15px] font-black text-slate-900 mt-0.5">${contratoData.totalAmount.toLocaleString("es-MX")} MXN</p>
                      </div>
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-center">
                        <span className="text-[10px] text-blue-500 font-bold uppercase">Anticipo de Obra (50%)</span>
                        <p className="text-[15px] font-black text-blue-900 mt-0.5">${contratoData.advancePayment.toLocaleString("es-MX")} MXN</p>
                      </div>
                      <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-center">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase">Plazo Entrega</span>
                        <p className="text-[15px] font-black text-emerald-900 mt-0.5">{contratoData.executionDays} Días Hábiles</p>
                      </div>
                    </div>

                    {/* Cláusulas legal compactas */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">SEGUNDA. DISPOSICIONES CONTRACTUALES</h4>
                      <p className="text-slate-600 font-mono leading-relaxed text-[10px] bg-slate-50 p-3.5 rounded-xl border border-dashed border-slate-200 whitespace-pre-wrap">
                        {contratoData.terms}
                      </p>
                    </div>

                    <p className="text-[9px] text-slate-400 italic text-center pt-2">
                      Estando conformes ambas partes en las condiciones de este contrato, firman debidamente al calce del mismo.
                    </p>
                  </div>
                )}

                {activeDocTab === "garantia" && (
                  <div className="space-y-5 text-xs">
                    <div className="text-center py-2 space-y-1">
                      <h2 className="text-lg font-black tracking-tight text-slate-800">CARTA CONTROL DE CALIDAD Y PÓLIZA</h2>
                      <p className="text-[10px] text-slate-500 italic">Sección de confianza respaldada por ALUDEV S.A.</p>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong>CLIENTE RECEPTOR:</strong>
                          <p className="text-slate-800 font-bold text-xs mt-0.5">{garantiaData.clientName}</p>
                        </div>
                        <div>
                          <strong>PROYECTO:</strong>
                          <p className="text-slate-800 text-xs mt-0.5">{garantiaData.projectName}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/60 pt-2.5 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Perfiles Aluminio</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{garantiaData.alumWarrantyYears} AÑOS</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Cristal Templado</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{garantiaData.glassWarrantyYears} AÑOS</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">Herrajes y Rodajas</span>
                          <p className="text-sm font-black text-slate-800 mt-0.5">{garantiaData.accWarrantyYears} AÑO</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-900 tracking-wider text-[11px] uppercase">Cláusulas Cobertura de Garantía</h4>
                      <p className="text-slate-650 font-mono leading-relaxed text-[10px] bg-white border border-slate-150 p-3.5 rounded-xl whitespace-pre-wrap">
                        {garantiaData.terms}
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 p-3 rounded-lg text-[10px] space-y-1">
                      <strong>✓ Respaldo de Reparaciones Tecnicas:</strong>
                      <p className="text-emerald-800">
                        Nuestra garantía le ampara ajustes técnicos de bisagras de fricción, fallas en carretillas metálicas inferiores y sellado perimetral contra lluvias. Comunícate al 229-684-6549.
                      </p>
                    </div>
                  </div>
                )}

                {activeDocTab === "recibo" && (
                  <div className="space-y-5 text-xs">
                    
                    {/* Visual Voucher Frame */}
                    <div className="border-2 border-slate-800 rounded-2xl p-4 sm:p-6 bg-amber-50/20 shadow-inner relative overflow-hidden">
                      <span className="absolute right-0 top-0 text-9xl font-black text-slate-100 select-none pointer-events-none -mr-4 -mt-10 font-mono">$</span>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <strong>RECIBIDO DE:</strong>
                            <p className="text-slate-800 font-black text-base uppercase mt-0.5">{reciboData.clientName}</p>
                          </div>
                          <div className="bg-slate-900 text-white font-mono font-bold px-3 py-1.5 rounded text-lg">
                            ${reciboData.amountNumeric.toLocaleString("es-MX")}.00
                          </div>
                        </div>

                        <div className="border-t border-slate-200 pt-3">
                          <strong>CANTIDAD CON LETRA:</strong>
                          <p className="text-slate-800 font-serif italic text-xs mt-0.5 font-bold border-b border-dashed border-slate-300 pb-1">
                            ({reciboData.amountText})
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>POR CONCEPTO DE:</strong>
                            <p className="text-slate-700 text-[11px] mt-0.5 bg-white p-2 rounded-lg border border-slate-100 whitespace-pre-line leading-normal">
                              {reciboData.concept}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <strong>MÉTODO DE LIQUIDACIÓN:</strong>
                              <p className="text-slate-800 font-mono font-bold text-xs mt-0.5">💳 {reciboData.paymentMethod}</p>
                            </div>
                            <div>
                              <strong>CLAVE REF:</strong>
                              <p className="text-slate-800 font-mono text-xs">⛓️ {reciboData.reference}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Anotaciones de Caja Adicional</h4>
                      <p className="text-slate-500 text-[11px] bg-slate-50 p-2.5 rounded-lg border leading-relaxed">
                        {reciboData.notes}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* BOTTOM SIGNATURE FOOTER */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-12 border-t border-slate-200">
                <div className="text-center space-y-1">
                  <div className="h-10"></div>
                  <div className="border-t border-slate-400 w-44 mx-auto pb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">FIRMA DEL RECEPTOR</p>
                  <p className="text-[9px] text-slate-400">Cliente de Conformidad</p>
                </div>

                <div className="text-center space-y-1">
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-serif italic text-slate-300 font-bold select-none text-xl">ALUDEV</span>
                  </div>
                  <div className="border-t border-slate-400 w-44 mx-auto pb-1"></div>
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">ALUDEV AUTORIZADO</p>
                  <p className="text-[9px] text-slate-400">Antonio Alfonso Advisor</p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
