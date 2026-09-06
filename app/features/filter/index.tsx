import { useCallback, useEffect, useState } from "react";
import { Filter } from '../../types/types';
import AutocompleteSelector from "../autocomplete";
import { parseVoiceInput } from "./voiceParser";
import VoiceOverlay from "./VoiceOverlay";
import VoiceHelpModal from "./VoiceHelpModal";

export default function FilterComponent({
  genres,
  directors,
  actors,
  years = [],
  decades = [],
  onChange,
}: {
  genres: string[],
  directors: string[],
  actors: string[],
  years?: string[],
  decades?: string[],
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
  const [selectedYear, setSelectedYear] = useState<string>(null);
  const [selectedDecade, setSelectedDecade] = useState<string>(null);

  // voice dictation states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [isVoiceHelpOpen, setIsVoiceHelpOpen] = useState(false);

  // automatically hide voice feedback after 4 seconds
  useEffect(() => {
    if (voiceFeedback) {
      const timer = setTimeout(() => setVoiceFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [voiceFeedback]);

  // blocks background scroll when drawer or help modal are open
  useEffect(() => {
    if (isFilterOpen || isVoiceHelpOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen, isVoiceHelpOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({
        quality: qualityFilter,
        title: searchTitle?.trim(),
        showCompleted: showCompleted,
        showBroken: showBroken,
        genre: selectedGenre?.trim(),
        director: selectedDirector?.trim(),
        actor: selectedActor?.trim(),
        year: selectedYear?.trim(),
        decade: selectedDecade?.trim(),
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [qualityFilter, searchTitle, showCompleted, showBroken, selectedGenre, selectedDirector, selectedActor, selectedYear, selectedDecade, onChange]);

  const resetFilter = useCallback(() => {
    setQualityFilter(null);
    setSearchTitle("");
    setShowCompleted(null);
    setShowBroken(false);
    setSelectedGenre(null);
    setSelectedDirector(null);
    setSelectedActor(null);
    setSelectedYear(null);
    setSelectedDecade(null);
    setVoiceTranscript("");
    setVoiceFeedback(null);
  }, []);

  // voice dictation handler
  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no admite el reconocimiento de voz nativo (Web Speech API). Prueba usando Google Chrome, Edge o Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
      setVoiceFeedback(null);
    };

    recognition.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setVoiceTranscript(currentTranscript);

      const isFinal = event.results[event.results.length - 1].isFinal;

      if (isFinal) {
        const parsed = parseVoiceInput(currentTranscript, genres, directors, actors, years);
        const fieldsUpdated: string[] = [];

        // reset previous filter states to avoid unwanted filter stacking
        setSearchTitle(parsed.title || "");
        setSelectedDirector(parsed.director || null);
        setSelectedActor(parsed.actor || null);
        setSelectedGenre(parsed.genre || null);
        setQualityFilter(parsed.quality || null);
        setSelectedYear(parsed.year || null);
        setSelectedDecade(parsed.decade || null);

        if (parsed.showCompleted !== undefined) {
          setShowCompleted(parsed.showCompleted);
        }

        if (parsed.title) fieldsUpdated.push("Película");
        if (parsed.director) fieldsUpdated.push("Director");
        if (parsed.actor) fieldsUpdated.push("Actor");
        if (parsed.genre) fieldsUpdated.push("Género");
        if (parsed.quality) fieldsUpdated.push("Calidad");
        if (parsed.year) fieldsUpdated.push("Año");
        if (parsed.decade) fieldsUpdated.push("Década");
        if (parsed.showCompleted !== undefined) fieldsUpdated.push("Estado");

        if (fieldsUpdated.length > 0) {
          setVoiceFeedback(`Filtros aplicados: ${fieldsUpdated.join(", ")}`);
        } else {
          setVoiceFeedback("No se identificaron datos concretos para los filtros.");
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        setVoiceFeedback("Error en el micrófono o permiso denegado.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [genres, directors, actors, years]);

  // formatted list of standard decades or extracted from catalog
  const availableDecades = decades.length > 0 ? decades : ["2020", "2010", "2000", "1990", "1980", "1970", "1960"];

  return (
    <>
      {/* floating buttons container */}
      <div className="fixed bottom-6 right-3 z-40 flex flex-col gap-3 items-center">
        
        {/* floating voice dictation button */}
        <button
          onClick={handleVoiceSearch}
          className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-slate-950 animate-in zoom-in duration-200 ${
            isListening
              ? "bg-rose-600 animate-pulse text-white ring-4 ring-rose-400/50"
              : "bg-purple-600 hover:bg-purple-500 text-white"
          }`}
          title="Dictar filtro por voz"
        >
          <span className="text-xl">{isListening ? "🔴" : "🎙️"}</span>
        </button>

        {/* clean filter button */}
        {(qualityFilter || searchTitle || showCompleted !== null || showBroken || selectedGenre || selectedDirector || selectedActor || selectedYear || selectedDecade) && (
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
          {(qualityFilter || searchTitle || showCompleted !== null || showBroken || selectedGenre || selectedDirector || selectedActor || selectedYear || selectedDecade) && (
            <span className="absolute -top-1 -right-1 bg-amber-500 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-slate-950 font-bold">!</span>
          )}
        </button>
      </div>

      {/* visual overlay / modal while voice listening */}
      <VoiceOverlay
        isListening={isListening}
        voiceTranscript={voiceTranscript}
        voiceFeedback={voiceFeedback}
        onClose={() => {
          setIsListening(false);
          setVoiceTranscript("");
          setVoiceFeedback(null);
        }}
        onOpenHelp={() => setIsVoiceHelpOpen(true)}
      />

      {/* full voice command info modal */}
      <VoiceHelpModal
        isOpen={isVoiceHelpOpen}
        onClose={() => setIsVoiceHelpOpen(false)}
      />

      {/* side filter menu (DRAWER) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-72 bg-slate-900 h-full flex flex-col shadow-2xl border-l border-slate-800 p-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Filtros</h3>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            {/* featured voice dictation banner in drawer */}
            <div className="mb-6 p-3.5 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <span>🎙️</span> Dictar por Voz
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsVoiceHelpOpen(true)}
                    className="p-1 text-slate-400 hover:text-purple-300 transition-colors"
                    title="Ver ayuda de comandos de voz"
                  >
                    ℹ️
                  </button>
                  <button
                    onClick={handleVoiceSearch}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse"
                        : "bg-purple-600 hover:bg-purple-500 text-white active:scale-95"
                    }`}
                  >
                    {isListening ? "Escuchando..." : "Hablar ahora"}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Habla de forma natural indicando película, director, género, actor, año, década, calidad o estado.
              </p>
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

              {/* decade section */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest flex items-center justify-between">
                  <span>Década</span>
                  {selectedDecade && (
                    <button 
                      onClick={() => setSelectedDecade(null)}
                      className="text-[10px] text-rose-400 hover:underline font-normal capitalize"
                    >
                      Limpiar
                    </button>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {availableDecades.map((dec) => {
                    const isSelected = selectedDecade === dec;
                    const label = `${dec.substring(2)}s`;
                    return (
                      <button
                        key={dec}
                        onClick={() => setSelectedDecade(isSelected ? null : dec)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-950"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* specific year section */}
              <AutocompleteSelector
                label="Año"
                options={years.map(y => ({ id: y, label: y }))}
                placeholder="Ej: 1999..."
                selectedValue={selectedYear}
                onSelect={(y) => setSelectedYear(y as string)}
              />

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