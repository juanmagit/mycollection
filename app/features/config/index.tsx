import { useState } from "react";
import { Movie, TMDBMovie, ApiConfig } from "../../types/types";
import { getCards, getListData } from "../../api/trello";
import { getGenresObject, getMovieData, getMovieDetails, getTrailerKey } from "../../api/tmdb";
import { ConfigStore } from "./config-store";

const parseTrelloName = (trelloName: string) => {
  // search for anything inside [] at the end of the string
  const regexYear = /\[(\d{4})\]$/;
  const match = trelloName.match(regexYear);
  
  const trelloYear = match ? match[1] : null;
  // we clean up the title by removing brackets and extra spaces
  const trelloTitle = trelloName.replace(regexYear, "").trim();
  
  return { trelloTitle, trelloYear };
};

const tmdbStringDateToMovieDate = (date: string): Movie['tmdb']['release_date'] => {
  const [year, month, day] = (date ?? '').split('-');
  return {
    year: year ?? '',
    month: month ?? '',
    day: day ?? '',
  }
};

export default function Configuration({
  setMovies,
}: {
  setMovies: (movies: Movie[]) => void,
}) {
  const [loading, setLoading] = useState(false);
  const [localConfig, setLocalConfig] = useState<ApiConfig>(
    ConfigStore.getInstance().getApiConfig()
  );
  const [finished, setFinished] = useState(0);
  const [total, setTotal] = useState(0);
  
  // save configuration
  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('config', JSON.stringify(localConfig));
    alert("Saved settings locally");
  };

  // trello import
  const importTrello = async () => {
    if (!localConfig.trelloKey || !localConfig.trelloToken || !localConfig.trelloBoardId) return alert("Trello data is missing");
    
    setFinished(0);
    setTotal(0);
    setLoading(true);
    try {
      const list = await getListData(ConfigStore.getInstance().getApiConfig().trelloListName);
      const trelloCards = await getCards(list);
      const genres = await getGenresObject();
      const errors = [];

      setTotal(trelloCards.length);

      const newMovies: Movie[] = (await Promise.all(trelloCards.map(async trelloCard => {
        const { trelloTitle, trelloYear } = parseTrelloName(trelloCard.name);
        try {
          const movieData = (await getMovieData(trelloTitle, trelloYear) ?? {} as TMDBMovie);
          setFinished(prev => prev + 1/3);

          const videoKey = await getTrailerKey(movieData.id);
          setFinished(prev => prev + 1/3);

          const movieDetails = await getMovieDetails(movieData.id);
          setFinished(prev => prev + 1/3);

          return {
            trello: {
              id: trelloCard.id,
              title: trelloTitle,
              desc: trelloCard.desc,
              url: trelloCard.shortUrl,
              labels: trelloCard.labels.map(label => (label.name)),
              completed: trelloCard.dueComplete,
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
        } catch (error) {
          errors.push({
            trelloTitle,
            trelloYear,
          });
          setFinished(prev => prev + 1);
          return null;
        }
      })
      )).filter(movie => !!movie);  // remove errored

      if (errors.length > 0) {
        alert('There were errors in the processing:\n' + errors.map(error => `${error.trelloTitle} (${error.trelloYear})`));
      }

      setMovies(newMovies);
      localStorage.setItem('my_movies', JSON.stringify(newMovies));
    } catch (err) {
      alert("Error importing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof ApiConfig, value: string) => {
    const updatedConfig = { ...localConfig, [key]: value };
    setLocalConfig(updatedConfig);
    ConfigStore.getInstance().setApiConfig(updatedConfig);
  };

  return (
    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-8 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-xl font-bold text-white mb-4">Configuración de APIs</h3>
      
      <form onSubmit={saveConfig} className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <input 
            placeholder="Trello API Key" 
            value={localConfig.trelloKey}
            onChange={e => handleInputChange('trelloKey', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="Trello Token" 
            value={localConfig.trelloToken}
            onChange={e => handleInputChange('trelloToken', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="ID del Tablero de Trello" 
            value={localConfig.trelloBoardId}
            onChange={e => handleInputChange('trelloBoardId', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="Nombre de la Lista (ej: Películas)" 
            value={localConfig.trelloListName}
            onChange={e => handleInputChange('trelloListName', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="TMDB API Key (v3 auth)" 
            value={localConfig.tmdbApiKey}
            onChange={e => handleInputChange('tmdbApiKey', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
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

      <div className="mt-6 pt-6 border-t border-slate-800">
        <button 
          onClick={importTrello} 
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            loading 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
          }`}
        >
          {loading ? (
            <>
              <span className="animate-spin text-xl">⏳</span>
              {total > 0 ? `Sincronizando... ${Math.round((finished / total) * 100)}%` : 'Iniciando...'}
            </>
          ) : (
            '🔄 Sincronizar con Trello ahora'
          )}
        </button>

        {/* progress bar */}
        {loading && total > 0 && (
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300 shadow-[0_0_8px_#10b981]"
              style={{ width: `${(finished / total) * 100}%` }}
            />
          </div>
        )}
        
        {loading && (
          <p className="text-[10px] text-slate-400 mt-2 text-center font-mono">
            Procesando: {Math.floor(finished)} de {total} películas
          </p>
        )}

        <p className="text-[10px] text-slate-500 mt-3 text-center italic">
          Las claves se guardan en el almacenamiento de tu navegador (LocalStorage).
        </p>
      </div>
    </section>
  );
}