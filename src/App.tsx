/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { WorkshopProvider, useWorkshop } from "./context/WorkshopContext";
import { CutRequest } from "./types";

// Component imports
import { Dashboard } from "./components/Dashboard";
import { Cotizador } from "./components/Cotizador";
import { Optimizador } from "./components/Optimizador";
import { FormulasEditor } from "./components/FormulasEditor";
import { Inventario } from "./components/Inventario";
import { Notas } from "./components/Notas";
import { Remision } from "./components/Remision";
import { PublicInvoiceViewer } from "./components/PublicInvoiceViewer";
import { DocumentosAludev } from "./components/DocumentosAludev";
import { GlobalSearch } from "./components/GlobalSearch";
import { BibliotecaCatalogos } from "./components/BibliotecaCatalogos";

import {
  Wrench,
  Grid,
  DollarSign,
  Scissors,
  Layers,
  Settings,
  BookOpen,
  FileText,
  Activity,
  LogOut,
  Sparkles,
  Award,
  Sun,
  Moon,
  CloudOff,
  Cloud,
  Download
} from "lucide-react";

function MainAppContent() {
  const { state, syncing } = useWorkshop();
  
  // Custom navigation router
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Shared state for cuts to be optimized
  const [cutsToOptimize, setCutsToOptimize] = useState<CutRequest[]>([]);
  
  // UI States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("aludev_darkmode") === "true";
    } catch {
      return false;
    }
  });
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("aludev_offline") === "true";
    } catch {
      return false;
    }
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA install accepted");
      }
      setDeferredPrompt(null);
    } else {
      alert("¡AluMaster ya está listo para trabajar sin conexión! Puedes guardarlo cómodamente en tu pantalla de inicio desde el menú de opciones de tu navegador web o presionando la opción 'Agregar a pantalla principal'.");
    }
  };

  React.useEffect(() => {
    localStorage.setItem("aludev_darkmode", String(isDarkMode));
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark-theme");
      document.body.classList.add("dark-theme");
      document.body.style.backgroundColor = "#030712";
      document.body.style.color = "#f1f5f9";
    } else {
      root.classList.remove("dark-theme");
      document.body.classList.remove("dark-theme");
      document.body.style.backgroundColor = "#f8fafc";
      document.body.style.color = "#0f172a";
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem("aludev_offline", String(isOfflineMode));
  }, [isOfflineMode]);

  React.useEffect(() => {
    (window as any).installPwa = handleInstallApp;
    (window as any).isOfflineMode = isOfflineMode;
    (window as any).toggleOfflineMode = () => setIsOfflineMode(!isOfflineMode);
    (window as any).isDarkMode = isDarkMode;
    (window as any).toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    (window as any).pwaInstallable = deferredPrompt !== null;
  }, [deferredPrompt, isOfflineMode, isDarkMode]);

  // Intercept and render public shareable document view if requested
  const urlParams = new URLSearchParams(window.location.search);
  const viewInvoiceB64 = urlParams.get("viewInvoice");

  if (viewInvoiceB64) {
    return <PublicInvoiceViewer encodedData={viewInvoiceB64} />;
  }

  // Render correct panel
  const renderActiveScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard setTab={setActiveTab} setCutsToOptimize={setCutsToOptimize} />;
      case "cotizador":
        return <Cotizador setTab={setActiveTab} setCutsToOptimize={setCutsToOptimize} />;
      case "optimizador":
        return <Optimizador cutsToOptimize={cutsToOptimize} setCutsToOptimize={setCutsToOptimize} />;
      case "formulas":
        return <FormulasEditor />;
      case "inventario":
        return <Inventario />;
      case "campo":
        return <Notas setTab={setActiveTab} />;
      case "remisiones":
        return <Remision />;
      case "documentos":
        return <DocumentosAludev />;
      case "biblioteca":
        return <BibliotecaCatalogos />;
      default:
        return <Dashboard setTab={setActiveTab} />;
    }
  };

  // Sidebar item helper
  const sidebarNavItems = [
    { id: "dashboard", label: "Dashboard", icon: Grid },
    { id: "cotizador", label: "Cotizador Rápido", icon: DollarSign },
    { id: "optimizador", label: "Optimizar Cortes", icon: Scissors },
    { id: "formulas", label: "Fórmulas Cancelería", icon: Layers },
    { id: "inventario", label: "Inventario & Precios", icon: Settings },
    { id: "campo", label: "Libreta de Campo", icon: BookOpen },
    { id: "remisiones", label: "Notas de Remisión", icon: FileText },
    { id: "documentos", label: "Contratos & Recibos", icon: Award },
    { id: "biblioteca", label: "Biblioteca & Git Sync", icon: Sparkles }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100 dark-theme' : 'bg-slate-50 text-slate-900'}`} id="main-app-container">
      
      {/* DESKTOP SIDEBAR PANEL (Hidden on mobile) */}
      <aside className="w-64 bg-slate-900 border-r border-slate-850 text-slate-300 flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo Brand Brand */}
          <div className="p-6 border-b border-slate-850 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/40">
              <Grid size={20} />
            </div>
            <div>
              <span className="font-extrabold text-white text-base block tracking-tight">ALUDEV</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold font-sans uppercase">Aluminios de Veracruz</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1" id="sidebar-navigation">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "hover:bg-slate-800 hover:text-slate-100"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon size={16} />
                  {item.label}
                  {item.id === "cotizador" && state.quotes.length > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {state.quotes.length}
                    </span>
                  )}
                  {item.id === "campo" && state.notes.filter(n => n.status === "pendiente").length > 0 && (
                    <span className="ml-auto bg-emerald-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {state.notes.filter(n => n.status === "pendiente").length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User identification section at bottom */}
        <div className="p-4 border-t border-slate-850 mt-auto bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-blue-950 border border-blue-900 rounded-full flex items-center justify-center text-xs font-bold text-blue-300">
              U
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-slate-300 block leading-none">Administrador</span>
              <span className="text-[9px] text-slate-500 font-mono">Taller Profesional</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER BAR (Hidden on desktop) */}
      <header className="bg-slate-900 border-b border-slate-850 px-4 py-3 flex items-center justify-between text-white shrink-0 md:hidden animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-md">
            <Grid size={16} />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase font-sans">Aludev</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`p-1.5 rounded-lg flex items-center gap-1 transition ${isOfflineMode ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/25 text-emerald-400'}`}
            title={isOfflineMode ? "Modo Offline Activo" : "Modo Online Activo"}
          >
            {isOfflineMode ? <CloudOff size={14} /> : <Cloud size={14} />}
          </button>
          
          <button
            onClick={handleInstallApp}
            className="p-1.5 rounded-lg text-blue-400 hover:bg-slate-800 transition"
            title="Descargar Aplicación"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-1.5 rounded-lg transition ${isDarkMode ? 'text-amber-400' : 'text-slate-400'}`}
            title="Alternar Tema"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* PRIMARY VIEWS CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Global Action Bar with search and business quick details */}
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between text-xs shrink-0 shadow-sm transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-500'}`}>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <span>Taller: <strong className={isDarkMode ? 'text-white' : 'text-slate-700'}>{state.businessDetails.name || "Aludev"}</strong></span>
            <span className="hidden md:inline opacity-30">|</span>
            <span className="hidden sm:inline">Unidad: <strong>Métrico</strong></span>
          </div>
          
          <div className="w-full md:w-96 flex justify-center z-30">
            <GlobalSearch onTabChange={setActiveTab} />
          </div>

          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px]">
            {/* Toggles */}
            <button onClick={() => setIsOfflineMode(!isOfflineMode)} className={`p-1.5 rounded-lg flex items-center gap-1 transition ${isOfflineMode ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`} title={isOfflineMode ? "Modo Offline Activo" : "Conectado a la nube"}>
              {isOfflineMode ? <CloudOff size={14} /> : <Cloud size={14} />}
              <span className="font-semibold">{isOfflineMode ? 'Desconectado' : 'Conectado'}</span>
            </button>
            <button onClick={handleInstallApp} className={`p-1.5 rounded-lg flex items-center gap-1 transition hover:bg-blue-500/20 text-blue-500`} title="Descargar App / Instalar PWA">
              <Download size={14} />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 rounded-lg flex items-center gap-1 transition hover:bg-slate-500/20 ${isDarkMode ? 'text-amber-400' : 'text-slate-500'}`} title="Cambiar Tema">
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* View Frame */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">
          {renderActiveScreen()}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV DOCK (Hidden on desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-850 px-2 py-1.5 flex justify-around items-center text-slate-400 text-[10px] font-medium z-40 md:hidden" id="mobile-dock-nav">
        {sidebarNavItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive ? "text-blue-400 scale-105" : "hover:text-slate-200"
              }`}
            >
              <Icon size={18} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
        {/* Field Notes and Remisión shortcut icons for mobile footer */}
        {sidebarNavItems.slice(5, 8).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition ${
                isActive ? "text-blue-400 scale-105" : "hover:text-slate-200"
              }`}
            >
              <Icon size={18} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

export default function App() {
  return (
    <WorkshopProvider>
      <MainAppContent />
    </WorkshopProvider>
  );
}
