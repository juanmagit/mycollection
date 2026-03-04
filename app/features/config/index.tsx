import { useState } from "react";
import { Movie, TMDBMovie, TrelloConfig } from "../../types/types";
import { getCards, getListData } from "../../api/trello";
import { getMovieData, getTrailerKey } from "../../api/tmdb";

const parseTrelloName = (trelloName: string) => {
  // search for anything inside [] at the end of the string
  const regexYear = /\[(\d{4})\]$/;
  const match = trelloName.match(regexYear);
  
  const trelloYear = match ? match[1] : null;
  // we clean up the title by removing brackets and extra spaces
  const trelloTitle = trelloName.replace(regexYear, "").trim();
  
  return { trelloTitle, trelloYear };
};

export default function Configuration({
  config,
  setConfig,
  setMovies,
}: {
  config: TrelloConfig,
  setConfig: (config: TrelloConfig) => void,
  setMovies: (movies: Movie[]) => void,
}) {
  const [loading, setLoading] = useState(false);
  
  // save configuration
  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('config', JSON.stringify(config));
    alert("Configuración guardada localmente");
  };

  // trello import
  const importTrello = async () => {
    if (!config.key || !config.token || !config.boardId) return alert("Faltan datos de Trello");
    
    setLoading(true);
    try {
      const list = await getListData(config, config.listName);
      const trelloCards = await getCards(config, list);
      
      const newMovies: Movie[] = await Promise.all(trelloCards.map(async trelloCard => {
        const { trelloTitle, trelloYear } = parseTrelloName(trelloCard.name);
        const movieData = (await getMovieData(config, trelloTitle, trelloYear) ?? {} as TMDBMovie);
        const videoKey = await getTrailerKey(config, movieData.id);
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
            genre_ids: movieData.genre_ids,
            original_language: movieData.original_language,
            original_title: movieData.original_title,
            overview: movieData.overview,
            popularity: movieData.popularity,
            poster_path: movieData.poster_path,
            release_date: movieData.release_date,
            title: movieData.title,
            video: movieData.video,
            vote_average: movieData.vote_average,
            vote_count: movieData.vote_count,
            videoKey: videoKey,
          },
        };
      }));

      setMovies(newMovies);
      localStorage.setItem('my_movies', JSON.stringify(newMovies));
    } catch (err) {
      alert("Error al importar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-slate-900 p-6 rounded-xl border border-slate-800 mt-8 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-xl font-bold text-white mb-4">Configuración de APIs</h3>
      
      <form onSubmit={saveConfig} className="grid grid-cols-1 gap-4">
        <div className="space-y-4">
          <input 
            placeholder="Trello API Key" 
            value={config.key} 
            onChange={e => setConfig({...config, key: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="Trello Token" 
            value={config.token} 
            onChange={e => setConfig({...config, token: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="ID del Tablero de Trello" 
            value={config.boardId} 
            onChange={e => setConfig({...config, boardId: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="Nombre de la Lista (ej: Películas)" 
            value={config.listName} 
            onChange={e => setConfig({...config, listName: e.target.value})}
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg text-sky-400 placeholder:text-slate-600 focus:border-sky-500 outline-none transition-all"
          />
          <input 
            placeholder="TMDB API Key (v3 auth)" 
            value={config.tmdbApiKey} 
            onChange={e => setConfig({...config, tmdbApiKey: e.target.value})}
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
              <span className="animate-spin text-xl">⏳</span> Actualizando biblioteca...
            </>
          ) : (
            '🔄 Sincronizar con Trello ahora'
          )}
        </button>
        <p className="text-[10px] text-slate-500 mt-3 text-center italic">
          Las claves se guardan en el almacenamiento de tu navegador (LocalStorage).
        </p>
      </div>
    </section>
  );
}