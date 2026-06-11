/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { WorkshopConfig, ProfileItem, AccessoryItem, GlassItem, FormulaRule, TallerNote, DeliveryInvoice, QuoteItem } from "../types";
import { INITIAL_CONFIG } from "../data/defaultData";

interface WorkshopContextType {
  state: WorkshopConfig;
  addProfile: (item: ProfileItem) => void;
  updateProfile: (id: string, updated: Partial<ProfileItem>) => void;
  deleteProfile: (id: string) => void;
  
  addAccessory: (item: AccessoryItem) => void;
  updateAccessory: (id: string, updated: Partial<AccessoryItem>) => void;
  deleteAccessory: (id: string) => void;

  addGlass: (item: GlassItem) => void;
  updateGlass: (id: string, updated: Partial<GlassItem>) => void;
  deleteGlass: (id: string) => void;

  addFormula: (formula: FormulaRule) => void;
  updateFormula: (id: string, updated: Partial<FormulaRule>) => void;
  deleteFormula: (id: string) => void;

  addNote: (note: TallerNote) => void;
  updateNote: (id: string, updated: Partial<TallerNote>) => void;
  deleteNote: (id: string) => void;

  addInvoice: (invoice: DeliveryInvoice) => void;
  updateInvoice: (id: string, updated: Partial<DeliveryInvoice>) => void;
  deleteInvoice: (id: string) => void;

  addQuoteItem: (item: QuoteItem) => void;
  updateQuoteItem: (id: string, updated: Partial<QuoteItem>) => void;
  deleteQuoteItem: (id: string) => void;
  clearQuotes: () => void;

  updateBusinessDetails: (details: Partial<WorkshopConfig["businessDetails"]>) => void;
  
  syncing: boolean;
  lastSynced: string;
  triggerSync: () => Promise<void>;
  resetToDefault: () => void;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkshopConfig>(() => {
    const saved = localStorage.getItem("taller_aluminio_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Fallback for fields introduced later
        if (!parsed.quotes) parsed.quotes = [];
        
        // Auto-merge new profiles
        INITIAL_CONFIG.profiles.forEach(defProf => {
          if (!parsed.profiles.some((p: any) => p.id === defProf.id)) {
            parsed.profiles.push(defProf);
          }
        });

        // Auto-merge new accessories
        INITIAL_CONFIG.accessories.forEach(defAcc => {
          if (!parsed.accessories.some((a: any) => a.id === defAcc.id)) {
            parsed.accessories.push(defAcc);
          }
        });

        // Auto-merge new formulas
        INITIAL_CONFIG.formulas.forEach(defForm => {
          if (!parsed.formulas.some((f: any) => f.id === defForm.id)) {
            parsed.formulas.push(defForm);
          }
        });

        // Auto-merge business details if defaults were Toluca
        if (parsed.businessDetails && (parsed.businessDetails.name.includes("Toluca") || parsed.businessDetails.name === "")) {
          parsed.businessDetails = INITIAL_CONFIG.businessDetails;
        }

        return parsed;
      } catch (e) {
        console.error("Error loading localStorage config:", e);
      }
    }
    return INITIAL_CONFIG;
  });

  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string>(() => {
    return localStorage.getItem("taller_last_synced") || new Date().toLocaleString("es-MX");
  });

  // Save changes automatically to local storage
  useEffect(() => {
    localStorage.setItem("taller_aluminio_config", JSON.stringify(state));
  }, [state]);

  const triggerSync = async () => {
    setSyncing(true);
    // Simulate real cloud sync with latency
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncing(false);
    const timeStr = new Date().toLocaleString("es-MX");
    setLastSynced(timeStr);
    localStorage.setItem("taller_last_synced", timeStr);
  };

  const resetToDefault = () => {
    if (window.confirm("¿Estás seguro de restablecer todos los valores por defecto del taller? Esto eliminará tus cambios en bases de precios, fórmulas e inventario.")) {
      setState(INITIAL_CONFIG);
    }
  };

  // Profile methods
  const addProfile = (item: ProfileItem) => {
    setState((prev) => ({ ...prev, profiles: [...prev.profiles, item] }));
  };
  const updateProfile = (id: string, updated: Partial<ProfileItem>) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, ...updated } : p))
    }));
  };
  const deleteProfile = (id: string) => {
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.filter((p) => p.id !== id)
    }));
  };

  // Accessory methods
  const addAccessory = (item: AccessoryItem) => {
    setState((prev) => ({ ...prev, accessories: [...prev.accessories, item] }));
  };
  const updateAccessory = (id: string, updated: Partial<AccessoryItem>) => {
    setState((prev) => ({
      ...prev,
      accessories: prev.accessories.map((a) => (a.id === id ? { ...a, ...updated } : a))
    }));
  };
  const deleteAccessory = (id: string) => {
    setState((prev) => ({
      ...prev,
      accessories: prev.accessories.filter((a) => a.id !== id)
    }));
  };

  // Glass methods
  const addGlass = (item: GlassItem) => {
    setState((prev) => ({ ...prev, glasses: [...prev.glasses, item] }));
  };
  const updateGlass = (id: string, updated: Partial<GlassItem>) => {
    setState((prev) => ({
      ...prev,
      glasses: prev.glasses.map((g) => (g.id === id ? { ...g, ...updated } : g))
    }));
  };
  const deleteGlass = (id: string) => {
    setState((prev) => ({
      ...prev,
      glasses: prev.glasses.filter((g) => g.id !== id)
    }));
  };

  // Formula/Rules methods
  const addFormula = (formula: FormulaRule) => {
    setState((prev) => ({ ...prev, formulas: [...prev.formulas, formula] }));
  };
  const updateFormula = (id: string, updated: Partial<FormulaRule>) => {
    setState((prev) => ({
      ...prev,
      formulas: prev.formulas.map((f) => (f.id === id ? { ...f, ...updated } : f))
    }));
  };
  const deleteFormula = (id: string) => {
    setState((prev) => ({
      ...prev,
      formulas: prev.formulas.filter((f) => f.id !== id)
    }));
  };

  // Field notes methods
  const addNote = (note: TallerNote) => {
    setState((prev) => ({ ...prev, notes: [note, ...prev.notes] }));
  };
  const updateNote = (id: string, updated: Partial<TallerNote>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updated } : n))
    }));
  };
  const deleteNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id)
    }));
  };

  // Invoices methods
  const addInvoice = (invoice: DeliveryInvoice) => {
    setState((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
  };
  const updateInvoice = (id: string, updated: Partial<DeliveryInvoice>) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) => (inv.id === id ? { ...inv, ...updated } : inv))
    }));
  };
  const deleteInvoice = (id: string) => {
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.filter((inv) => inv.id !== id)
    }));
  };

  // Quotes (shopping cart) methods
  const addQuoteItem = (item: QuoteItem) => {
    setState((prev) => ({ ...prev, quotes: [...prev.quotes, item] }));
  };
  const updateQuoteItem = (id: string, updated: Partial<QuoteItem>) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.map((q) => (q.id === id ? { ...q, ...updated } : q))
    }));
  };
  const deleteQuoteItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== id)
    }));
  };
  const clearQuotes = () => {
    setState((prev) => ({ ...prev, quotes: [] }));
  };

  // Business settings methods
  const updateBusinessDetails = (details: Partial<WorkshopConfig["businessDetails"]>) => {
    setState((prev) => ({
      ...prev,
      businessDetails: { ...prev.businessDetails, ...details }
    }));
  };

  return (
    <WorkshopContext.Provider
      value={{
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
        addFormula,
        updateFormula,
        deleteFormula,
        addNote,
        updateNote,
        deleteNote,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addQuoteItem,
        updateQuoteItem,
        deleteQuoteItem,
        clearQuotes,
        updateBusinessDetails,
        syncing,
        lastSynced,
        triggerSync,
        resetToDefault
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error("useWorkshop must be used within a WorkshopProvider");
  }
  return context;
};
