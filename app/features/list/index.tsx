import { Filter, Movie } from "../../types/types";
import { TMDB_IMAGE_BASE, POSTER_SIZE } from "../../config";
import { useEffect, useState } from "react";
import FilterComponent from "../filter";
import MovieDetails from "./details";
import Badge, { BadgeType } from "./badge";
import SortComponent, { SortOption } from "../sort";
import { filterMovies, sortMovies } from "../../utils";
import { MoviesSummary } from "../../utils/movies-summary";
import Suggestions from "../suggestions";

export default function MoviesList({
  movies,
  moviesSummary,
}: {
  movies: Movie[];
  moviesSummary: MoviesSummary;
}) {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [filter, setFilter] = useState<Filter>(null);
  const [sort, setSort] = useState<SortOption>(SortOption.TITLE_ASC);

  useEffect(() => {
    const filteredMovies = filterMovies(movies, filter);
    const sortedMovies = sortMovies(filteredMovies, sort);
    setFilteredMovies(sortedMovies);
  }, [movies, filter, sort]);

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
                      <Badge key={tag} type={tag as BadgeType}>{tag}</Badge>
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
                        {movie.tmdb.release_date?.year}
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

          <Suggestions 
            activeFilters={filter} 
            movies={movies}
          />

          <FilterComponent
            genres={moviesSummary.getGenres()}
            directors={moviesSummary.getDirectors()}
            actors={moviesSummary.getActors()}
            onChange={setFilter}
          />
          <SortComponent
            currentSort={sort}
            onChange={setSort}
          />

          {/* modal */}
          {selectedMovie && (
            <MovieDetails
              selectedMovie={selectedMovie}
              onClose={() => setSelectedMovie(null)}
            />
          )}
        </>
  );
}