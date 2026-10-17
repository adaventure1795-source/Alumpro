/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useWorkshop } from "../context/WorkshopContext";
import { FormulaRule, ProfileItem } from "../types";
import {
  BookOpen,
  Github,
  UploadCloud,
  Sparkles,
  FileText,
  CheckCircle,
  Database,
  ArrowRight,
  Plus,
  HelpCircle,
  Eye,
  Trash2,
  ExternalLink,
  Code,
  Info
} from "lucide-react";

interface CatalogDocument {
  id: string;
  name: string;
  brand: string;
  fileSize: string;
  uploadedAt: string;
  description: string;
  extractedProducts: {
    category: "ventanas" | "puertas" | "canceles" | "fijos";
    name: string;
    description: string;
    profileEquations: {
      profileId: string;
      profileName: string;
      name: string;
      formula: string;
      quantity: number;
      angle: "90/90" | "45/45";
    }[];
    glassEquation: {
      formulaWidth: string;
      formulaHeight: string;
      quantity: number;
    };
  }[];
}

export const DocumentosAludev: React.FC = () => {
  return null; // This is a placeholder or can be kept separate
};

export const BibliotecaCatalogos: React.FC = () => {
  const { state, addFormula, addProfile } = useWorkshop();

  // Selected Brand Filter
  const [selectedBrand, setSelectedBrand] = useState<string>("todos");

  // GitHub configuration view help state
  const [githubTabActive, setGithubTabActive] = useState<boolean>(false);

  // Documents uploaded list
  const [documents, setDocuments] = useState<CatalogDocument[]>([
    {
      id: "doc-1",
      name: "Catalogo_Tecnico_Línea_3_Pulgadas.pdf",
      brand: "Indalum",
      fileSize: "4.2 MB",
      uploadedAt: "2026-06-11 14:24",
      description: "Especificaciones oficiales para cancelería residencial e institucional. Incluye hojas, traslapes, cabezales y rieles de alta resistencia.",
      extractedProducts: [
        {
          category: "ventanas",
          name: "Ventana Deslizable Reforzada 3″ Indalum",
          description: "Sistema hermético deslizable con perfiles reforzados para mayor aislamiento acústico.",
          profileEquations: [
            { profileId: "prof-nat3-riel", profileName: "[9957] Riel Corrediza 3″", name: "Riel Inferior Horizontal", formula: "Ancho", quantity: 1, angle: "90/90" },
            { profileId: "prof-nat3", profileName: "[7836] Cabezal 3″", name: "Cabezal Superior Horizontal", formula: "Ancho", quantity: 1, angle: "90/90" },
            { profileId: "prof-nat3-jamba", profileName: "[7826] Chambrana 3″", name: "Chambranas Jamba Laterales", formula: "Alto - 3.2", quantity: 2, angle: "90/90" },
            { profileId: "prof-nat3-tras", profileName: "[7844] Traslape Ventana 3″", name: "Poste Traslape Hojas", formula: "Alto - 4.5", quantity: 2, angle: "90/90" }
          ],
          glassEquation: {
            formulaWidth: "(Ancho - 18.2) / 2",
            formulaHeight: "Alto - 8.2",
            quantity: 2
          }
        }
      ]
    },
    {
      id: "doc-2",
      name: "Manual_Canceleria_Española_Serie_4000.pdf",
      brand: "EuroAlum",
      fileSize: "8.1 MB",
      uploadedAt: "2026-06-10 11:15",
      description: "Fichas técnicas y planos de cortes exactos para línea de lujo Española con herrajes integrados y esquinas de botón.",
      extractedProducts: [
        {
          category: "ventanas",
          name: "Ventana Abatible Serie Española Lujo",
          description: "Ventana con corte a 45 grados y sello perimetral doble.",
          profileEquations: [
            { profileId: "prof-esp", profileName: "[2314] Riel Doble (EuroAlum 4000)", name: "Marco Perimetral Exterior", formula: "Ancho * 2 + Alto * 2", quantity: 1, angle: "45/45" },
            { profileId: "prof-esp-hoja", profileName: "[2297] Hoja Ventana (EuroAlum 4000)", name: "Hojas Interiores Batientes", formula: "Ancho * 2 + Alto * 2 - 16", quantity: 1, angle: "45/45" }
          ],
          glassEquation: {
            formulaWidth: "Ancho - 14",
            formulaHeight: "Alto - 14",
            quantity: 1
          }
        }
      ]
    }
  ]);

  // Upload/Simulate PDF state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedResult, setExtractedResult] = useState<any | null>(null);
  const [activeAnalysisDocId, setActiveAnalysisDocId] = useState<string | null>(null);

  // Simulation parameters for dragging/selecting custom catalog files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const simulateFileUpload = (name: string, brand: string) => {
    setIsUploading(true);
    setTimeout(() => {
      const newDoc: CatalogDocument = {
        id: "doc-custom-" + Date.now(),
        name,
        brand,
        fileSize: "3.5 MB",
        uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        description: `Especificaciones de perfiles de aluminio línea ${brand}. Contiene datos de descuentos para cancelería estándar y residencial.`,
        extractedProducts: [
          {
            category: "canceles",
            name: `Cancel de Lujo Inteligente Línea ${brand}`,
            description: "Esquema optimizado para cancelería de alta hermeticidad basada en catálogo cargado.",
            profileEquations: [
              { profileId: "prof-nat2-riel", profileName: "Riel Nacional 2″", name: "Riel de Deslice Inferior", formula: "Ancho - 0.5", quantity: 1, angle: "90/90" },
              { profileId: "prof-nat2-jamba", profileName: "Chambrana Nacional 2″", name: "Jamba de Sujeción Lateral", formula: "Alto - 3", quantity: 2, angle: "90/90" }
            ],
            glassEquation: {
              formulaWidth: "(Ancho / 2) + 1.2",
              formulaHeight: "Alto - 5.5",
              quantity: 2
            }
          }
        ]
      };
      setDocuments(prev => [newDoc, ...prev]);
      setIsUploading(false);
    }, 1500);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    simulateFileUpload("Catalogo_Manual_Serie_Eurovent_70.pdf", "EuroVent");
  };

  // Run AI-Extraction analysis (Gemini integration simulation)
  const triggerAIExtract = (doc: CatalogDocument) => {
    setIsExtracting(true);
    setActiveAnalysisDocId(doc.id);
    
    setTimeout(() => {
      setExtractedResult({
        docId: doc.id,
        formulas: doc.extractedProducts,
        profilesCount: doc.extractedProducts[0].profileEquations.length
      });
      setIsExtracting(false);
    }, 2000);
  };

  // Inject extracted rules directly into workshop formulary list
  const saveExtractedFormula = (prod: any) => {
    const freshFormula: FormulaRule = {
      id: "f-extracted-" + Date.now(),
      name: prod.name,
      category: prod.category,
      variables: [
        { name: "Ancho", description: "Ancho perimetral en cm", defaultValue: 120 },
        { name: "Alto", description: "Alto perimetral en cm", defaultValue: 120 }
      ],
      profileEquations: prod.profileEquations.map((pEq: any) => ({
        profileId: pEq.profileId,
        name: pEq.name,
        formula: pEq.formula,
        quantity: pEq.quantity,
        angle: pEq.angle
      })),
      glassEquation: {
        formulaWidth: prod.glassEquation.formulaWidth,
        formulaHeight: prod.glassEquation.formulaHeight,
        quantity: prod.glassEquation.quantity
      },
      accessoryEquations: [
        { accessoryId: "acc-roda", quantityFormula: "2" },
        { accessoryId: "acc-emb", quantityFormula: "Ancho * 2" }
      ]
    };
    
    addFormula(freshFormula);
    alert(`🎉 ¡Fórmula "${prod.name}" añadida con éxito al Cotizador de Cancelería!`);
  };

  // Delete uploaded file
  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (extractedResult?.docId === id) {
      setExtractedResult(null);
    }
  };

  const filteredDocs = selectedBrand === "todos" 
    ? documents 
    : documents.filter(d => d.brand.toLowerCase() === selectedBrand.toLowerCase());

  return (
    <div className="space-y-6" id="biblioteca-catalogos-panel">
      
      {/* Visual Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            Biblioteca Digital & Centro de Distribución Git
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Alimenta tus bases de datos mediante carga de fichas técnicas comerciales y consulta las guías de sincronización del código hacia tu repositorio personal de GitHub.
          </p>
        </div>

        {/* Action selector */}
        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl shrink-0 border border-slate-200 dark:border-slate-700" id="library-tab-nav">
          <button
            onClick={() => setGithubTabActive(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              !githubTabActive ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50"
            }`}
          >
            Bibliotecas & PDFs
          </button>
          <button
            onClick={() => setGithubTabActive(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              githubTabActive ? "bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-50"
            }`}
          >
            Sincronización GitHub
          </button>
        </div>
      </div>

      {!githubTabActive ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT SIDE: DOCUMENT UPLOAD & FILE FEED (Col span 3) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleFileDrop}
              className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-250 p-8 rounded-2xl text-center hover:bg-slate-50 hover:border-blue-400 transition cursor-pointer relative"
              id="pdf-dropzone"
            >
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    simulateFileUpload(e.target.files[0].name, "EuroVent");
                  }
                }}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded-full">
                  <UploadCloud size={30} className={isUploading ? "animate-bounce" : ""} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Carga el PDF Técnico de tu Proveedor</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Arrastra aquí folletos de perfiles (Cuprum, Indalum, etc.) o haz clic para subir archivo. La base de datos extraerá automáticamente los centímetros de descuento.
                  </p>
                </div>
                {isUploading && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-300 animate-pulse bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded">
                    Subiendo archivo y preparando lectura digital...
                  </span>
                )}
              </div>
            </div>

            {/* Catalog List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fichas Técnicas Cargadas (PDF)</h3>
                
                {/* Brand Filter */}
                <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {["todos", "Indalum", "EuroAlum", "EuroVent"].map(b => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        selectedBrand === b ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {b.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="p-4 bg-slate-50 hover:bg-slate-50 dark:bg-slate-800 border border-slate-200/60 rounded-xl flex items-start gap-3 transition">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-700 text-red-500 rounded-xl font-bold shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{doc.name}</h4>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                          {doc.brand}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mt-1 line-clamp-2">{doc.description}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-3 pt-3 border-t border-slate-200/50">
                        <span>Peso: {doc.fileSize}</span>
                        <span>•</span>
                        <span>Sincronizado: {doc.uploadedAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 shrink-0 pl-1">
                      <button
                        onClick={() => triggerAIExtract(doc)}
                        className="p-1 px-2.5 bg-blue-600 hover:bg-blue-50 dark:bg-blue-900/400 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition shadow-sm"
                        title="Extraer fórmulas con IA"
                      >
                        <Sparkles size={11} />
                        Extraer
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:bg-rose-900/30 border border-slate-200 dark:border-slate-700 hover:border-rose-100 dark:border-rose-800/50 text-slate-400 hover:text-rose-600 rounded-lg transition flex items-center justify-center"
                        title="Eliminar documento"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredDocs.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-450">Ningún catálogo coincide con los filtros de marca seleccionados.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: AI ANALYSIS AND EXTRACTION TARGET (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <div className="border-l-4 border-blue-500 pl-2">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  Panel Técnico Extractor (Gemini Smart Engine)
                </h3>
              </div>

              {isExtracting ? (
                <div className="py-16 text-center space-y-4 flex flex-col items-center">
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-105 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="text-blue-500 dark:text-blue-300" size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs text-center animate-pulse">Analizando estructura geométrica...</h4>
                    <p className="text-slate-400 text-[10px] mt-1 max-w-xs mx-auto">
                      Gemini está evaluando los planos técnicos vectoriales del PDF para calcular los coeficientes de reducción de los batientes.
                    </p>
                  </div>
                </div>
              ) : extractedResult ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                    <CheckCircle className="text-emerald-600 mt-0.5 shrink-0" size={15} />
                    <div>
                      <span className="font-bold block">✓ ¡Se han encontrado 1 diseño calificado!</span>
                      <p className="text-emerald-800 mt-0.5">La inteligencia artificial decodificó los descuentos de las piezas a partir de los diagramas.</p>
                    </div>
                  </div>

                  {extractedResult.formulas.map((prod: any, idx: number) => (
                    <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-850 text-xs">{prod.name}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5 leading-normal">{prod.description}</p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Matriz de perfiles de corte:</span>
                        <div className="space-y-1.5 font-mono text-[10px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-150">
                          {prod.profileEquations.map((pEq: any, pIdx: number) => (
                            <div key={pIdx} className="flex justify-between">
                              <span>• {pEq.name}:</span>
                              <strong className="text-slate-900 dark:text-slate-50">{pEq.formula} cm</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Cristal descuento evaluado:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-white dark:bg-slate-900 p-2 border border-slate-150 rounded-lg">
                          <div>Letra Ancho: <strong className="text-blue-700 dark:text-blue-300">{prod.glassEquation.formulaWidth}</strong></div>
                          <div>Letra Alto: <strong className="text-blue-700 dark:text-blue-300">{prod.glassEquation.formulaHeight}</strong></div>
                        </div>
                      </div>

                      <button
                        onClick={() => saveExtractedFormula(prod)}
                        className="w-full py-2 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:bg-slate-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Plus size={13} />
                        Registrar como Fórmula de Taller
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50">
                  <Database size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs max-w-xs mx-auto">Selecciona o presiona el botón "Extraer" a la derecha de un PDF para ver el análisis de planos aquí.</p>
                </div>
              )}
            </div>

            {/* Quick Informational Tip Card */}
            <div className="bg-slate-900 dark:bg-slate-950 text-slate-300 border border-slate-800 p-5 rounded-2xl flex gap-3 shadow-md">
              <Info className="text-amber-400 shrink-0" size={18} />
              <div className="text-xs leading-normal">
                <span className="font-bold text-slate-100 block">Dato de Producción</span>
                <p className="mt-1 text-slate-400">
                  Los perfiles de aluminio para ventanas correderas nacionales comerciales (Generalmente de Cuprum o Indalum) se calculan con barras comerciales normalizadas de <strong>6.10 metros</strong> o <strong>4.20 metros</strong>. Para evitar mermas altas, ejecuta la optimización en el módulo de cortes.
                </p>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* GITHUB REFERENCE SYSTEM BOARD PANEL */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-105 pb-4">
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-2.5 rounded-xl">
              <Github size={24} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
                ¿Por qué no aparece inicialmente mi código en GitHub?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Guía completa sobre el funcionamiento técnico de las exportaciones de código en Google AI Studio.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Visual Guide Walkthrough */}
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
              <div className="flex gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Entorno Virtual Localizado</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    La web app se ejecuta en un servidor de contenedores de Cloud Run aislado. El código de la aplicación se redacta directamente en este workspace interactivo en la nube y no se empuja automáticamente a tu cuenta privada al instante de escribir.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Empuje Directo a Repositorio (Exportar)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Para ver este software en tu perfil personal de GitHub, haz clic en el botón **"Settings" / "Configuración"** que se encuentra en la parte superior derecha de la interfaz de desarrollo de Google AI Studio, y selecciona **"Export to GitHub"**.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Sincronización de Ramas de Desarrollo</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Al presionar exportar, autorizas los permisos de commit para conectar el repositorio que indiques. Se creará una rama segura donde podrás realizar merge de tus cambios y ver el árbol de directorios intacto.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-extrabold h-6 w-6 rounded-full flex items-center justify-center shrink-0">4</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Descarga en ZIP (Alternativa Segura)</h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">
                    También puedes descargar todo el archivo en un paquete comprimido **.ZIP** mediante el menú. Este ZIP contiene tu `package.json`, configuraciones de Vite y Tailwind, para levantar de forma local un servidor de desarrollo llamando a `npm run dev`.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Mock Repository Card */}
            <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 p-5 rounded-2xl text-slate-100 font-mono text-[11px] space-y-4">
              <div className="flex justify-between items-center bg-slate-850 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">git status --short</span>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/400/20 text-emerald-400 font-semibold px-1 py-0.5 rounded uppercase">WORKSPACE LISTO</span>
              </div>

              <div className="space-y-1.5 scrollbar-none overflow-x-auto max-w-full">
                <p className="text-blue-400 dark:text-blue-300"># Configuración de Archivos del Proyecto</p>
                <div className="text-slate-400 pl-4">
                  <p className="text-emerald-400">✓ package.json (Vite v6 + React 19)</p>
                  <p className="text-emerald-400">✓ src/App.tsx (Enrutador de Paneles)</p>
                  <p className="text-emerald-400">✓ src/context/WorkshopContext.tsx (Base de Datos Local)</p>
                  <p className="text-emerald-400">✓ src/components/Cotizador.tsx (Motor de Reglas)</p>
                  <p className="text-emerald-400">✓ src/utils/cutOptimizer.ts (Algoritmo Unidimensional de Cortes)</p>
                </div>
              </div>

              <div className="bg-slate-850 p-3 rounded-xl space-y-2 border border-slate-800">
                <span className="font-bold text-slate-300">¿Deseas descargar el ZIP ahora mismo?</span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                  Puedes hacerlo desde la consola del desarrollador. Alternativamente, pide a este asistente que te redacte cualquier archivo adicional para su descarga.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 animate-pulse font-sans">
                  • Server Ingress Port 3000 Operando •
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
