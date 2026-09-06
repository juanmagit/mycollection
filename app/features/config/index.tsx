import { useState } from "react";
import { Eye, EyeOff, Zap, RefreshCw, Trash2, AlertTriangle, X, Film, ExternalLink } from "lucide-react";
import { Movie, TMDBMovie, ApiConfig, TrelloLabel, TrelloCard } from "../../types/types";
import { getCards, getListData } from "../../api/trello";
import { getGenresObject, getMovieData, getMovieDetails, getTrailerKey } from "../../api/tmdb";
import { ConfigStore } from "./config-store";
import { tmdbStringDateToMovieDate } from "../../utils";

export interface SyncWarning {
  cardName: string;
  cardUrl: string;
  message: string;
}

const parseTrelloName = (trelloName: string) => {
  // search for anything inside [] at the end of the string
  const regexYear = /\[(\d{4})\]$/;
  const match = trelloName.match(regexYear);
  
  const trelloYear = match ? match[1] : null;
  // we clean up the title by removing brackets and extra spaces
  const trelloTitle = trelloName.replace(regexYear, "").trim();
  
  return { trelloTitle, trelloYear };
};

const getTrelloYearWarnings = (trelloCards: TrelloCard[]): SyncWarning[] => {
  const warnings: SyncWarning[] = [];
  for (const card of trelloCards) {
    const { trelloYear } = parseTrelloName(card.name);
    if (!trelloYear) {
      warnings.push({
        cardName: card.name,
        cardUrl: card.shortUrl,
        message: `"${card.name}" no especifica el año entre corchetes [AÑO].`,
      });
    }
  }
  return warnings;
};

const extractLocation = (trelloLabels: TrelloLabel[]): {
  labels: string[];
  location: Movie['trello']['location'];
} => {
  const labels = trelloLabels.map(label => label.name);
  const regexLocation = /^E(\d+)-F([1-9])-C([1-3])$/i;
  let location = undefined;
  let locationLabel = undefined;

  for (const label of labels) {
    const match = label.match(regexLocation);
    if (match) {
      location = {
        shelf: parseInt(match[1], 10),
        row: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        raw: label,
      };
      locationLabel = label;
      break;
    }
  }

  const filteredLabels = locationLabel 
    ? labels.filter(label => label !== locationLabel) 
    : labels;

  return { labels: filteredLabels, location };
};

export default function Configuration({
  movies = [],
  setMovies,
}: {
  movies?: Movie[];
  setMovies: (movies: Movie[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [syncType, setSyncType] = useState<'full' | 'fast' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [localConfig, setLocalConfig] = useState<ApiConfig>(
    ConfigStore.getInstance().getApiConfig()
  );
  const [finished, setFinished] = useState(0);
  const [total, setTotal] = useState(0);
  const [showSensitive, setShowSensitive] = useState(false);
  const [syncWarnings, setSyncWarnings] = useState<SyncWarning[]>([]);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  
  // save configuration
  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('config', JSON.stringify(localConfig));
    alert("Saved settings locally");
  };

  const fetchTMDBMovieData = async (
    trelloCard: TrelloCard,
    genres: Record<number, string>,
    onProgressStep: () => void = () => setFinished(prev => prev + 1 / 3)
  ): Promise<Movie> => {
    const { trelloTitle, trelloYear } = parseTrelloName(trelloCard.name);
    const movieData = (await getMovieData(trelloTitle, trelloYear) ?? {} as TMDBMovie);
    onProgressStep();

    const videoKey = await getTrailerKey(movieData.id);
    onProgressStep();

    const movieDetails = await getMovieDetails(movieData.id);
    onProgressStep();

    const { labels, location } = extractLocation(trelloCard.labels);

    return {
      trello: {
        id: trelloCard.id,
        title: trelloTitle,
        desc: trelloCard.desc,
        url: trelloCard.shortUrl,
        labels,
        completed: trelloCard.dueComplete,
        location,
      },
      tmdb: {
        id: movieData.id,
        adult: movieData.adult,
        backdrop_path: movieData.backdrop_path,
        genres: movieData.genre_ids.map(id => genres[id]),
        original_language: movieData.original_language,
        original_title: movieData.original_title,
        overview: movieData.overview,
        popularity: movieData.popularity,
        poster_path: movieData.poster_path,
        release_date: tmdbStringDateToMovieDate(movieData.release_date),
        title: movieData.title,
        video: movieData.video,
        vote_average: movieData.vote_average,
        vote_count: movieData.vote_count,
        videoKey: videoKey,
        runtime: movieDetails.runtime,
        director: movieDetails.director,
        cast: movieDetails.cast,
        country_code: movieDetails.country_code,
      },
    };
  };

  // trello full import
  const importTrello = async () => {
    if (!localConfig.trelloKey || !localConfig.trelloToken || !localConfig.trelloBoardId) {
      return alert("Trello data is missing");
    }
    
    setFinished(0);
    setTotal(0);
    setSyncType('full');
    setStatusMessage('Obteniendo lista de Trello...');
    setLoading(true);
    setSyncWarnings([]);

    try {
      const list = await getListData(ConfigStore.getInstance().getApiConfig().trelloListName);
      const trelloCards = await getCards(list);
      const warnings = getTrelloYearWarnings(trelloCards);
      setSyncWarnings(warnings);

      const genres = await getGenresObject();
      const errors: Array<{ trelloTitle: string; trelloYear: string | null; errorMessage: string }> = [];

      setTotal(trelloCards.length);
      setStatusMessage('Consultando TMDB para todas las películas...');

      const newMovies: Movie[] = (await Promise.all(trelloCards.map(async trelloCard => {
        const { trelloTitle, trelloYear } = parseTrelloName(trelloCard.name);
        try {
          return await fetchTMDBMovieData(trelloCard, genres);
        } catch (error) {
          errors.push({
            trelloTitle,
            trelloYear,
            errorMessage: error.message,
          });
          console.error(error);
          setFinished(prev => prev + 1);
          return null;
        }
      }))).filter((movie): movie is Movie => !!movie);

      if (errors.length > 0) {
        alert('Hubo errores al procesar algunas películas:\n' + errors.map(error => `${error.trelloTitle} (${error.trelloYear}) Error: ${error.errorMessage}`).join('\n'));
      }

      setMovies(newMovies);
      localStorage.setItem('my_movies', JSON.stringify(newMovies));

      if (warnings.length > 0) {
        setShowWarningModal(true);
      }
    } catch (err) {
      alert("Error en la importación: " + err.message);
    } finally {
      setLoading(false);
      setSyncType(null);
      setStatusMessage('');
    }
  };

  // trello fast import
  const importTrelloFast = async () => {
    if (!localConfig.trelloKey || !localConfig.trelloToken || !localConfig.trelloBoardId) {
      return alert("Trello data is missing");
    }

    setFinished(0);
    setTotal(0);
    setSyncType('fast');
    setStatusMessage('Obteniendo tarjetas de Trello...');
    setLoading(true);
    setSyncWarnings([]);

    try {
      const list = await getListData(ConfigStore.getInstance().getApiConfig().trelloListName);
      const trelloCards = await getCards(list);
      const warnings = getTrelloYearWarnings(trelloCards);
      setSyncWarnings(warnings);
      
      // Get current local movies
      const existingMoviesList: Movie[] = movies.length > 0 
        ? movies 
        : JSON.parse(localStorage.getItem('my_movies') || '[]');

      const existingMap = new Map<string, Movie>(
        existingMoviesList.map(m => [m.trello.id, m])
      );

      // Find new cards
      const newCards = trelloCards.filter(card => !existingMap.has(card.id));
      const errors: Array<{ trelloTitle: string; trelloYear: string | null; errorMessage: string }> = [];

      const newlyFetchedMap = new Map<string, Movie>();

      if (newCards.length > 0) {
        setTotal(newCards.length);
        setStatusMessage(`Detectadas ${newCards.length} películas nuevas. Consultando TMDB...`);
        const genres = await getGenresObject();

        await Promise.all(newCards.map(async trelloCard => {
          const { trelloTitle, trelloYear } = parseTrelloName(trelloCard.name);
          try {
            const movie = await fetchTMDBMovieData(trelloCard, genres);
            newlyFetchedMap.set(trelloCard.id, movie);
          } catch (error) {
            errors.push({
              trelloTitle,
              trelloYear,
              errorMessage: error.message,
            });
            console.error(error);
            setFinished(prev => prev + 1);
          }
        }));
      } else {
        setStatusMessage('No hay películas nuevas. Actualizando metadatos de Trello...');
      }

      // Re-construct the full movies list in Trello's order
      const finalMovies: Movie[] = trelloCards.map(trelloCard => {
        if (newlyFetchedMap.has(trelloCard.id)) {
          return newlyFetchedMap.get(trelloCard.id)!;
        }
        
        if (existingMap.has(trelloCard.id)) {
          const existing = existingMap.get(trelloCard.id)!;
          const { labels, location } = extractLocation(trelloCard.labels);
          const { trelloTitle } = parseTrelloName(trelloCard.name);
          return {
            ...existing,
            trello: {
              ...existing.trello,
              title: trelloTitle,
              desc: trelloCard.desc,
              url: trelloCard.shortUrl,
              labels,
              completed: trelloCard.dueComplete,
              location,
            }
          };
        }

        return null;
      }).filter((movie): movie is Movie => !!movie);

      if (errors.length > 0) {
        alert('Hubo errores al procesar películas nuevas:\n' + errors.map(error => `${error.trelloTitle} (${error.trelloYear}) Error: ${error.errorMessage}`).join('\n'));
      }

      setMovies(finalMovies);
      localStorage.setItem('my_movies', JSON.stringify(finalMovies));

      if (warnings.length > 0) {
        setShowWarningModal(true);
      }
    } catch (err) {
      alert("Error en la sincronización rápida: " + err.message);
    } finally {
      setLoading(false);
      setSyncType(null);
      setStatusMessage('');
    }
  };

  const resetTrello = async () => {
    if (confirm("¿Seguro que deseas vaciar la base de datos local de películas?")) {
      setMovies([]);
      localStorage.setItem('my_movies', JSON.stringify([]));
    }
  };

  const handleInputChange = (key: keyof ApiConfig, value: string) => {
    const updatedConfig = { ...localConfig, [key]: value };
    setLocalConfig(updatedConfig);
    ConfigStore.getInstance().setApiConfig(updatedConfig);
  };

  return (
    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-8 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Configuración de APIs</h3>
        <button
          type="button"
          onClick={() => setShowSensitive(!showSensitive)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-all select-none animate-in fade-in duration-200"
          title={showSensitive ? "Ocultar claves" : "Mostrar claves"}
        >
          {showSensitive ? (
            <>
              <EyeOff size={16} className="text-sky-400 animate-in spin-in-12 duration-200" />
              <span>Ocultar claves</span>
            </>
          ) : (
            <>
              <Eye size={16} className="text-sky-400 animate-in spin-in-12 duration-200" />
              <span>Mostrar claves</span>
            </>
          )}
        </button>
      </div>
      
      <form onSubmit={saveConfig} className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <input 
            type={showSensitive ? "text" : "password"}
            placeholder="Trello API Key" 
            value={localConfig.trelloKey}
            onChange={e => handleInputChange('trelloKey', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            type={showSensitive ? "text" : "password"}
            placeholder="Trello Token" 
            value={localConfig.trelloToken}
            onChange={e => handleInputChange('trelloToken', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            type="text"
            placeholder="ID del Tablero de Trello" 
            value={localConfig.trelloBoardId}
            onChange={e => handleInputChange('trelloBoardId', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            type="text"
            placeholder="Nombre de la Lista (ej: Películas)" 
            value={localConfig.trelloListName}
            onChange={e => handleInputChange('trelloListName', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            type={showSensitive ? "text" : "password"}
            placeholder="TMDB API Key (v3 auth)" 
            value={localConfig.tmdbApiKey}
            onChange={e => handleInputChange('tmdbApiKey', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            type="text"
            placeholder="TMDB API language" 
            value={localConfig.tmdbLanguage}
            onChange={e => handleInputChange('tmdbLanguage', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-lg mt-2 transition-colors shadow-lg shadow-sky-900/20"
        >
          💾 Guardar Claves localmente
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
        <h4 className="text-sm font-semibold text-slate-300 mb-1">Sincronización con Trello</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={importTrelloFast} 
            disabled={loading}
            className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
            }`}
          >
            {loading && syncType === 'fast' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <Zap size={18} className="text-emerald-200 fill-emerald-200" />
                <span>Sincronización rápida</span>
              </>
            )}
          </button>

          <button 
            type="button"
            onClick={importTrello} 
            disabled={loading}
            className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md active:scale-[0.98]'
            }`}
          >
            {loading && syncType === 'full' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <RefreshCw size={18} className="text-sky-400" />
                <span>Sincronización completa</span>
              </>
            )}
          </button>
        </div>

        {/* progress bar & status */}
        {loading && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-3 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-mono">
              <span>{statusMessage || 'Procesando...'}</span>
              {total > 0 && <span>{Math.round((finished / total) * 100)}%</span>}
            </div>
            {total > 0 && (
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    syncType === 'fast' 
                      ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                      : 'bg-sky-500 shadow-[0_0_8px_#0284c7]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((finished / total) * 100))}%` }}
                />
              </div>
            )}
            {total > 0 && (
              <p className="text-[10px] text-slate-500 mt-1.5 text-center font-mono">
                Procesando: {Math.floor(finished)} de {total} películas nuevas en TMDB
              </p>
            )}
          </div>
        )}

        {/* persistent warnings banner */}
        {syncWarnings.length > 0 && !loading && (
          <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-lg mt-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <AlertTriangle size={16} className="shrink-0" />
                <span>Se registraron {syncWarnings.length} advertencia(s) en la sincronización</span>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningModal(true)}
                className="text-xs text-amber-300 hover:text-amber-200 underline font-medium"
              >
                Ver detalles
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] text-slate-500 mt-2 text-center italic">
          <strong>Rápida:</strong> Solo consulta TMDB para películas nuevas. <strong>Completa:</strong> Reconsulta todas en TMDB.
        </p>

        <button 
          type="button"
          onClick={resetTrello} 
          disabled={loading}
          className={`w-full py-2.5 rounded-lg font-semibold text-xs transition-all flex items-center justify-center gap-2 mt-4 ${
            loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' :
            'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-900/50'
          }`}
        >
          <Trash2 size={14} />
          Resetear base de datos local
        </button>
      </div>

      {/* Modal de Advertencias de Sincronización */}
      {showWarningModal && syncWarnings.length > 0 && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Advertencias de Sincronización</h3>
                  <p className="text-xs text-slate-400">Se encontraron {syncWarnings.length} película(s) sin año especificado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-amber-950/30 border border-amber-800/30 rounded-lg text-amber-200 text-xs leading-relaxed">
              Las películas sin el año entre corchetes <code>[AÑO]</code> en Trello pueden generar resultados imprecisos al buscar metadatos en TMDB.
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {syncWarnings.map((warning, index) => (
                <div key={index} className="flex items-center justify-between gap-2.5 p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Film size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">{warning.message}</span>
                  </div>
                  {warning.cardUrl && (
                    <a
                      href={warning.cardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 hover:text-sky-300 hover:underline shrink-0 bg-sky-950/60 border border-sky-800/40 px-2.5 py-1 rounded-md transition-colors"
                      title="Abrir tarjeta en Trello"
                    >
                      <span>Abrir en Trello</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}