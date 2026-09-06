import { useEffect, useState } from "react";
import { Filter, Movie, TMDBMovie } from "../../types/types";
import { getDiscoverMovies, getGenres, getPerson } from "../../api/tmdb";

type LinkProvider = "tmdb" | "filmaffinity";

export default function Suggestions({ 
  activeFilters, 
  movies, 
}: {
  activeFilters: Filter; 
  movies: Movie[];
}) {
  const [suggestions, setSuggestions] = useState<TMDBMovie[]>([]);
  const [genresList, setGenresList] = useState<{id: number, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUrl, setCurrentUrl] = useState("");
  const [provider, setProvider] = useState<LinkProvider>("filmaffinity");

  useEffect(() => {
    const savedProvider = localStorage.getItem("suggestions_provider") as LinkProvider;
    if (savedProvider === "tmdb" || savedProvider === "filmaffinity") {
      setProvider(savedProvider);
    }
  }, []);

  const handleProviderChange = (newProvider: LinkProvider) => {
    setProvider(newProvider);
    localStorage.setItem("suggestions_provider", newProvider);
  };

  const getMovieUrl = (movie: TMDBMovie, targetProvider: LinkProvider): string => {
    if (targetProvider === "tmdb") {
      return `https://www.themoviedb.org/movie/${movie.id}`;
    } else {
      const title = movie.title || "";
      const year = movie.release_date ? movie.release_date.split("-")[0] : "";
      const searchQuery = year
        ? `!ducky ${title} ${year} site:filmaffinity.com`
        : `!ducky ${title} site:filmaffinity.com`;
      return `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 px-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
          <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] px-2 whitespace-nowrap">
            Sugerencias: {titleSource}
          </h3>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800/80 p-1 rounded-lg text-xs shadow-inner">
          <span className="text-slate-400 text-[10px] uppercase font-bold px-1 hidden sm:inline">
            Abrir en:
          </span>
          <button
            type="button"
            onClick={() => handleProviderChange("tmdb")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${
              provider === "tmdb"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            TMDB
          </button>
          <button
            type="button"
            onClick={() => handleProviderChange("filmaffinity")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${
              provider === "filmaffinity"
                ? "bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            FilmAffinity
          </button>
        </div>
      </div>

      <div 
        className="grid gap-3 px-2" 
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
      >
        {suggestions.map((movie) => {
          const mainUrl = getMovieUrl(movie, provider);
          const tmdbUrl = getMovieUrl(movie, "tmdb");
          const filmAffinityUrl = getMovieUrl(movie, "filmaffinity");

          return (
            <div
              key={movie.id}
              className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all duration-500 shadow-lg"
            >
              <a
                href={mainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-0"
                title={`Abrir ${movie.title} en ${provider === "tmdb" ? "TMDB" : "FilmAffinity"}`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                  alt={movie.title}
                  className="object-cover w-full h-full opacity-100 group-hover:scale-105 transition-all duration-700"
                />
              </a>

              {/* hover quick links */}
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <a
                  href={tmdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900/90 hover:bg-sky-600 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold border border-slate-700/60 transition-colors shadow flex items-center gap-1"
                  title="Abrir en TMDB"
                >
                  TMDB
                </a>
                <a
                  href={filmAffinityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900/90 hover:bg-red-600 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[9px] font-bold border border-slate-700/60 transition-colors shadow flex items-center gap-1"
                  title="Abrir en FilmAffinity"
                >
                  FA
                </a>
              </div>

              {/* reduced info */}
              <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-1 group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/90 via-black/70 to-transparent pointer-events-none z-10">
                <p className="text-white text-[10px] font-semibold leading-tight line-clamp-1 mb-0.5">
                  {movie.title}
                </p>
                <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sky-400 text-[9px] font-bold">
                    {movie.release_date?.split('-')[0]}
                  </span>
                  <span className="text-yellow-400 text-[9px] font-medium">
                    ★ {movie.vote_average?.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
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