import { Filter, Movie } from "../../types/types";
import { TMDB_IMAGE_BASE, POSTER_SIZE } from "../../config";
import { useEffect, useState } from "react";
import FilterComponent from "../filter";
import { normalizeText } from "../../utils";

const Badge = ({ children }: { children: string }) => {
  const label = children.toLowerCase();
  const is4K = label.includes('4k');
  const isFullHD = label.includes('fullhd');
  
  let badgeClasses = "relative inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ";

  if (is4K) {
    badgeClasses += "bg-gradient-to-b from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-950/30 border border-amber-300/50";
  } else if (isFullHD) {
    badgeClasses += "bg-gradient-to-b from-sky-500 to-sky-700 text-white shadow-lg shadow-sky-950/40 border border-sky-400/50";
  } else {
    badgeClasses += "bg-slate-700 text-slate-200 border border-slate-600/50";
  }

  return (
    <span className={badgeClasses}>
      <span className="absolute inset-0 bg-white/10 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
      {children}
    </span>
  );
};

export default function MoviesList({
  movies,
}: {
  movies: Movie[];
}) {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [filter, setFilter] = useState<Filter>(null);

  useEffect(() => {
    const peliculasFiltradas = movies.filter(movie => {
      if (!filter) return true;

      if (filter.showBroken) {
        return !movie.tmdb.title;
      }

      let completedMatch = true;
      if (filter.showCompleted === true) {
        completedMatch = movie.trello.completed === true;
      }

      let notCompletedMatch = true;
      if (filter.showCompleted === false) {
        notCompletedMatch = movie.trello.completed === false;
      }

      let qualityMatch = true;
      if (filter.quality) {
        qualityMatch = movie.trello.labels?.some(tag => 
          tag.toLowerCase().includes(filter.quality?.toLowerCase())
        );
      }

      let titleMatch = true;
      if (filter.title) {
        titleMatch = normalizeText(movie.tmdb.title)?.includes(normalizeText(filter.title)) ||
          normalizeText(movie.tmdb.original_title)?.includes(normalizeText(filter.title));
      }

      return qualityMatch && titleMatch && completedMatch && notCompletedMatch;
    });
    setFilteredMovies(peliculasFiltradas);
  }, [movies, filter]);
  
  return (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🎬 Mi Catálogo ({filteredMovies.length})</h1>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2 mt-8">
            {filteredMovies.map(movie => {
              const isCompleted = movie.trello.completed === true;

              return (
                <div
                  key={movie.trello.id}
                  onClick={() => setSelectedMovie(movie)} 
                  className="group relative aspect-[2/3] w-full bg-slate-900 rounded-md overflow-hidden border border-slate-800 hover:border-sky-500 transition-all duration-300 shadow-lg cursor-pointer"
                >
                  {/* completed status indicator */}
                  <div className="absolute top-2 right-2 z-20">
                    {isCompleted ? (
                      <div className="bg-emerald-500 text-white p-1 rounded-full shadow-lg border border-emerald-400/50 animate-in zoom-in duration-300">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="bg-slate-800/80 backdrop-blur-sm text-slate-500 p-1 rounded-full border border-slate-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* poster image (It gets dark when hovering) */}
                  <img
                    src={movie.tmdb.poster_path ? `${TMDB_IMAGE_BASE}${POSTER_SIZE}${movie.tmdb.poster_path}` : "https://via.placeholder.com/342x513?text=Sin+Poster"}
                    alt={movie.tmdb.title}
                    className="w-full h-full object-cover group-hover:opacity-30 transition-opacity duration-300"
                  />

                  {/* labels */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                    {movie.trello.labels?.map(tag => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>

                  {/* information Layer (Invisible by default, appears on hover) */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black via-black/80 to-transparent">                
                    {/* title and year */}
                    <h4 className="text-[11px] font-bold text-white leading-tight mb-0.5">
                      {movie.tmdb.title ?? movie.trello.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[9px] text-sky-400 font-semibold">
                        {movie.tmdb.release_date?.split('-')[0]}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>
                        • {isCompleted ? 'Completada' : 'Pendiente'}
                      </span>
                    </div>

                    {movie.trello.desc && (
                      <p className="text-[1}">
                        {movie.trello.desc}
                      </p>
                    )}

                    {/* overview (Limited to 4 lines to prevent overflow) */}
                    <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-3 mb-3 italic">
                      {movie.tmdb.overview || "Sin sinopsis disponible."}
                    </p>
                    <span className="text-[9px] bg-sky-600 text-white text-center py-1 rounded font-bold">
                      Ver detalles
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <FilterComponent onChange={setFilter} />

          {/* modal */}
          {selectedMovie && (
            <div
              onClick={() => setSelectedMovie(null)}
              className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
            >
              <div 
                className="bg-slate-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden border-t sm:border border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* background image (Backdrop) */}
                <div className="relative h-48 sm:h-64">
                  <img 
                    src={selectedMovie.tmdb.backdrop_path ? `${TMDB_IMAGE_BASE}w780${selectedMovie.tmdb.backdrop_path}` : `${TMDB_IMAGE_BASE}${POSTER_SIZE}${selectedMovie.tmdb.poster_path}`} 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <button 
                    onClick={() => setSelectedMovie(null)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{selectedMovie.tmdb.title}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sky-400 text-sm font-medium">
                          {selectedMovie.tmdb.release_date?.split('-')[0]}
                        </p>
                        <div className="flex gap-1.5">
                          {selectedMovie.trello.labels?.map((label: any, index: number) => (
                            <Badge key={index}>{label}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                      <span className="text-yellow-400 font-bold">⭐ {selectedMovie.tmdb.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>

                  {selectedMovie.trello.desc && (
                    <p className="text-slate-400 text-xl leading-relaxed mb-6 max-h-48 overflow-y-auto">
                      {selectedMovie.trello.desc}
                    </p>
                  )}

                  <p className="text-slate-300 text-sm leading-relaxed mb-6 max-h-48 overflow-y-auto">
                    {selectedMovie.tmdb.overview}
                  </p>

                  <div className="flex gap-3">
                    <a 
                      href={selectedMovie.trello.url} 
                      target="_blank" 
                      className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-center py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20"
                    >
                      Abrir en Trello
                    </a>
                    <button 
                      onClick={() => setSelectedMovie(null)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
  );
}