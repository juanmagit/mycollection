import { useEffect, useState } from "react";
import { Filter, Movie } from "../../types/types";
import { getDiscoverMovies, getGenres, getPerson } from "../../api/tmdb";

export default function Suggestions({ 
  activeFilters, 
  movies, 
}: {
  activeFilters: Filter; 
  movies: Movie[];
}) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [genresList, setGenresList] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (genresList?.length === 0) {
      const fetchGenres = async () => {
        const genres = await getGenres();
        setGenresList(genres);
      };

      fetchGenres();
    }
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!activeFilters.actor && !activeFilters.director && !activeFilters.genre) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        let discoverUrl = '';

        if (activeFilters.actor || activeFilters.director) {
          const personData = await getPerson(activeFilters.actor, activeFilters.director);
          const personId = personData[0]?.id;
          if (personId) {
            discoverUrl += `&${activeFilters.director ? 'with_crew' : 'with_cast'}=${personId}`;
          }
        } else if (activeFilters.genre) {
          const genreObj = genresList.find(g => g.name.toLowerCase() === activeFilters.genre?.toLowerCase());
          if (genreObj) {
            discoverUrl += `&with_genres=${genreObj.id}`;
          } else {
            setSuggestions([]);
            return;
          }
        }

        const discoverResults = await getDiscoverMovies(discoverUrl);
        const filtered = discoverResults
          .filter((m) => !movies.find(movie => movie.tmdb.id === m.id) && m.poster_path);

        setSuggestions(filtered);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (genresList?.length > 0) {
      fetchSuggestions();
    }
  }, [genresList, activeFilters, movies]);

  if (suggestions.length === 0 || loading) return null;

  const titleSource = activeFilters.actor || activeFilters.director || "este género";

  return (
    <div className="mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] px-4 whitespace-nowrap">
          Sugerencias: {titleSource}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
      </div>

      <div 
        className="grid gap-3 px-2" 
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
      >
        {suggestions.map((movie) => (
          <a
            key={movie.id}
            href={`https://www.themoviedb.org/movie/${movie.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all duration-500 shadow-lg"
          >
            <img
              src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
              alt={movie.title}
              className="object-cover w-full h-full opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            
            {/* reduced info */}
            <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-1 group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-[10px] font-semibold leading-tight line-clamp-1 mb-0.5">
                {movie.title}
              </p>
              <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sky-400 text-[9px] font-bold">
                  {movie.release_date?.split('-')[0]}
                </span>
                <span className="text-yellow-400 text-[9px] font-medium">
                  ★ {movie.vote_average.toFixed(1)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}