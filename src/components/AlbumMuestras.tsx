import React, { useState } from "react";
import { Search, Filter, Camera } from "lucide-react";

const CATEGORIES = [
  "Todos",
  "Ventanas",
  "Canceles",
  "Portones",
  "Puertas",
  "Barandales",
  "Rejas y Protecciones"
];

// Dummy gallery for showcase
const GALLERY = [
  {
    id: 1,
    title: "Ventana Corrediza Cuprum Moderna",
    category: "Ventanas",
    image: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?q=80&w=2613&auto=format&fit=crop",
    desc: "Acabado Negro Mate, Cristal Templado 6mm"
  },
  {
    id: 2,
    title: "Cancel de Baño SemiLujo",
    category: "Canceles",
    image: "https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=2669&auto=format&fit=crop",
    desc: "Cristal Templado Claro, Herrajes de Acero Inoxidable"
  },
  {
    id: 3,
    title: "Portón Ascendente Automático",
    category: "Portones",
    image: "https://images.unsplash.com/photo-1605814046638-316e6d1fed97?q=80&w=2356&auto=format&fit=crop",
    desc: "Duela de aluminio acabado Nogal Madera"
  },
  {
    id: 4,
    title: "Puerta Monumental Pivotante",
    category: "Puertas",
    image: "https://plus.unsplash.com/premium_photo-1678120612668-cb0ffeaacc08?q=80&w=2338&auto=format&fit=crop",
    desc: "Perfil línea pesada Natural Brillante, Jaladera recta"
  },
  {
    id: 5,
    title: "Barandal de Cristal Empotrado",
    category: "Barandales",
    image: "https://images.unsplash.com/photo-1668856699368-4f815041a02b?q=80&w=2574&auto=format&fit=crop",
    desc: "Tubo Perimetral Negro, Cristal 10mm Templado canto pulido"
  },
  {
    id: 6,
    title: "Reja de Seguridad Diseño Moderno",
    category: "Rejas y Protecciones",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=2670&auto=format&fit=crop",
    desc: "Tubular Cuadrado 2\", Color Blanco Electroestático"
  },
  {
    id: 7,
    title: "Ventana Proyectable Española",
    category: "Ventanas",
    image: "https://images.unsplash.com/photo-1534015694297-f5dc81765ad7?q=80&w=2670&auto=format&fit=crop",
    desc: "Proyección Exterior, EuroVent Serie 70, Champagne"
  },
  {
    id: 8,
    title: "Portón de Dos Hojas Batientes",
    category: "Portones",
    image: "https://images.unsplash.com/photo-1498069502758-c09a8f4c02da?q=80&w=2482&auto=format&fit=crop",
    desc: "Acabado Bronce con Motorización Merik"
  }
];

export const AlbumMuestras: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  const filteredGallery = GALLERY.filter(item => {
    const matchCategory = activeCategory === "Todos" || item.category === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3 tracking-tight">
              <span className="bg-blue-600/10 text-blue-600 dark:text-blue-300 p-2 rounded-xl">
                <Camera size={26} />
              </span>
              Álbum de Muestras
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Galería de trabajos realizados para mostrar a los clientes.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar diseño..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-50 shadow-md"
                  : "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800 dark:bg-slate-950"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GALLERY GRID */}
        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredGallery.map((item) => (
              <div key={item.id} className="group bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-blue-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
              <Camera size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No se encontraron diseños</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-sm">
              Intenta con otra palabra clave o selecciona una categoría diferente.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
