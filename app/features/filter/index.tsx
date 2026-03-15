import { useCallback, useEffect, useState } from "react";
import { Filter } from '../../types/types';
import AutocompleteSelector from "../autocomplete";

export default function FilterComponent({
  genres,
  directors,
  actors,
  onChange,
}: {
  genres: string[],
  directors: string[],
  actors: string[],
  onChange: (filter: Filter) => void,
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [qualityFilter, setQualityFilter] = useState<string | null>(null);
  const [searchTitle, setSearchTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState<boolean>(null);
  const [showBroken, setShowBroken] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>(null);
  const [selectedDirector, setSelectedDirector] = useState<string>(null);
  const [selectedActor, setSelectedActor] = useState<string>(null);

  // blocks background scroll
  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);

  useEffect(() => {
    onChange({
      quality: qualityFilter,
      title: searchTitle?.trim(),
      showCompleted: showCompleted,
      showBroken: showBroken,
      genre: selectedGenre?.trim(),
      director: selectedDirector?.trim(),
      actor: selectedActor?.trim(),
    });
  }, [qualityFilter, searchTitle, showCompleted, showBroken, selectedGenre, selectedDirector, selectedActor, onChange]);

  const resetFilter = useCallback(() => {
    setQualityFilter(null);
    setSearchTitle("");
    setShowCompleted(null);
    setShowBroken(false);
    setSelectedGenre(null);
    setSelectedDirector(null);
    setSelectedActor(null);
  }, []);

  return (
    <>
      {/* floating buttons container */}
      <div className="fixed bottom-6 right-3 z-40 flex flex-col gap-3">
        
        {/* clean filter button */}
        {(qualityFilter || searchTitle || showCompleted !== null || showBroken || selectedGenre || selectedDirector || selectedActor) && (
          <button
            onClick={() => {
              resetFilter();
            }}
            className="bg-rose-600 hover:bg-rose-500 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-950 animate-in zoom-in duration-200"
            title="Limpiar filtros"
          >
            <span className="text-lg">🧹</span>
          </button>
        )}

        {/* floating filter button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="bg-sky-600 hover:bg-sky-500 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-950 relative"
        >
          <span className="text-xl">🔍</span>
          {(qualityFilter || searchTitle || showCompleted !== null || showBroken || selectedGenre || selectedDirector || selectedActor) && (
            <span className="absolute -top-1 -right-1 bg-amber-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-slate-950 font-bold">!</span>
          )}
        </button>
      </div>

      {/* side filter menu (DRAWER) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-800 p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">Filtros</h3>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-8 overflow-y-auto">
              {/* title search section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Buscar película</h4>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="Ej: Die hard..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                  {searchTitle && (
                    <button 
                      onClick={() => setSearchTitle("")}
                      className="absolute right-3 top-3 text-slate-500 hover:text-white"
                    >✕</button>
                  )}
                </div>
              </div>

              {/* genre section */}
              <AutocompleteSelector
                label="Género"
                options={genres.map(genre => ({ id: genre, label: genre }))}
                placeholder="Ej: Ciencia Ficción..."
                selectedValue={selectedGenre}
                onSelect={(genre) => setSelectedGenre(genre as string)}
              />

              {/* director section */}
              <AutocompleteSelector
                label="Director"
                options={directors.map(director => ({ id: director, label: director }))}
                placeholder="Ej: Quentin Tarantino..."
                selectedValue={selectedDirector}
                onSelect={(director) => setSelectedDirector(director as string)}
              />

              {/* actor section */}
              <AutocompleteSelector
                label="Actor"
                options={actors.map(actor => ({ id: actor, label: actor }))}
                placeholder="Ej: Bruce Willis..."
                selectedValue={selectedActor}
                onSelect={(actor) => setSelectedActor(actor as string)}
              />

              {/* quality section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Calidad</h4>
                <div className="grid grid-cols-1 gap-2">
                  {['4K', 'FullHD'].map(quality => (
                    <button
                      key={quality}
                      onClick={() => setQualityFilter(qualityFilter === quality ? null : quality)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all text-left flex justify-between items-center ${
                        qualityFilter === quality ? 'bg-sky-600 text-white' : 'bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      {quality}
                      {qualityFilter === quality && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* showCompleted section - Triple State */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Estado de Visionado</h4>
                <div className="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
                  {[
                    { label: 'Todas', value: null, icon: 'filter' },
                    { label: 'Pendientes', value: false, icon: 'hourglass' },
                    { label: 'Vistas', value: true, icon: 'check' }
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => setShowCompleted(option.value)}
                      className={`
                        flex-1 flex flex-col items-center py-2 rounded-lg text-[10px] font-bold transition-all
                        ${showCompleted === option.value 
                          ? 'bg-emerald-600 text-white shadow-lg' 
                          : 'text-slate-400 hover:text-slate-200'}
                      `}
                    >
                      <span className="mb-1">
                        {option.value === null ? '🎞️' : option.value === true ? '✅' : '⏳'}
                      </span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* showBroken section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">Estado del Archivo</h4>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setShowBroken(!showBroken)}
                    className={`
                      px-4 py-3 rounded-xl text-xs font-bold transition-all flex justify-between items-center border-2
                      ${showBroken 
                        ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-900/20' 
                        : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{showBroken ? '⚠️' : '🛠️'}</span>
                      <span>Mostrar Enlaces Rotos</span>
                    </div>
                    
                    {/* toggle switch */}
                    <div className={`
                      w-10 h-5 rounded-full relative transition-colors duration-300
                      ${showBroken ? 'bg-rose-500' : 'bg-slate-700'}
                    `}>
                      <div className={`
                        absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300
                        ${showBroken ? 'left-6' : 'left-1'}
                      `} />
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsFilterOpen(false);
                  resetFilter();
                }}
                className="w-full py-3 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}