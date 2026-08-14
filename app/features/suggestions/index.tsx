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
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUrl, setCurrentUrl] = useState("");

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
      if (!activeFilters?.actor && !activeFilters?.director && !activeFilters?.genre) {
        setSuggestions([]);
        setCurrentPage(1);
        setTotalPages(1);
        setCurrentUrl("");
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
            setCurrentPage(1);
            setTotalPages(1);
            setCurrentUrl("");
            return;
          }
        }

        setCurrentUrl(discoverUrl);
        const { results, totalPages: fetchedTotalPages } = await getDiscoverMovies(discoverUrl, 1);
        const filtered = results
          .filter((m) => !movies.find(movie => movie.tmdb.id === m.id) && m.poster_path);

        setSuggestions(filtered);
        setCurrentPage(1);
        setTotalPages(fetchedTotalPages);
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

  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= totalPages || !currentUrl) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const { results, totalPages: fetchedTotalPages } = await getDiscoverMovies(currentUrl, nextPage);
      const filtered = results
        .filter((m) => !movies.find(movie => movie.tmdb.id === m.id) && m.poster_path);

      setSuggestions((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = filtered.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setCurrentPage(nextPage);
      setTotalPages(fetchedTotalPages);
    } catch (error) {
      console.error("Error loading more suggestions:", error);
    } finally {
      setLoadingMore(false);
    }
  };

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

      <div className="flex flex-col items-center justify-center mt-8 gap-4">
        {currentPage < totalPages ? (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-full border border-slate-800 hover:border-sky-500/50 bg-slate-950/50 hover:bg-sky-500/5 text-slate-400 hover:text-white text-xs font-semibold tracking-wider transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shadow-lg"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-sky-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cargando...
              </>
            ) : (
              "Cargar más sugerencias"
            )}
          </button>
        ) : (
          <span className="text-slate-600 text-[11px] font-medium tracking-wide uppercase">
            No hay más sugerencias
          </span>
        )}
      </div>
    </div>
  );
}