import { useState } from "react";

export enum SortOption {
  TITLE_ASC = 'title-asc',
  TITLE_DESC = 'title-desc',
  YEAR_ASC = 'year-asc',
  YEAR_DESC = 'year-desc',
  RATING_DESC = 'rating-desc',
}

export default function SortComponent({
  currentSort,
  onChange,
}: {
  currentSort: SortOption;
  onChange: (sort: SortOption) => void;
}) {
  const [isSortOpen, setIsSortOpen] = useState(false);

  const options = [
    { id: SortOption.TITLE_ASC, label: 'Título (A-Z)', icon: '🔤' },
    { id: SortOption.TITLE_DESC, label: 'Título (Z-A)', icon: '🔠' },
    { id: SortOption.YEAR_DESC, label: 'Más recientes', icon: '📅' },
    { id: SortOption.YEAR_ASC, label: 'Más antiguas', icon: '⏳' },
    { id: SortOption.RATING_DESC, label: 'Mejor valoradas', icon: '⭐' },
  ];

  return (
    <>
      {/* floating buttons container */}
      <div className="fixed bottom-6 right-20 z-40 flex flex-col gap-3">

        {/* sort button */}
        <button
          onClick={() => setIsSortOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-950 relative"
        >
          <span className="text-xl">📊</span>
          {currentSort !== SortOption.TITLE_ASC && (
            <span className="absolute -top-1 -right-1 bg-sky-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-slate-950 font-bold">!</span>
          )}
        </button>
      </div>

      {/* sort menu (DRAWER) */}
      {isSortOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSortOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full shadow-2xl border-l border-slate-800 p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Ordenar</h3>
              <button onClick={() => setIsSortOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-widest">Opciones de orden</h4>
              
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id as SortOption);
                    setIsSortOpen(false);
                  }}
                  className={`
                    w-full px-4 py-4 rounded-xl text-sm font-bold transition-all flex justify-between items-center
                    ${currentSort === option.id 
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-900/20' 
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span>{option.icon}</span>
                    <span>{option.label}</span>
                  </div>
                  {currentSort === option.id && <span className="text-xs">●</span>}
                </button>
              ))}
            </div>

            <div className="absolute bottom-8 left-0 w-full px-6 text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-tighter">
                Cambiando el orden de la biblioteca
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}