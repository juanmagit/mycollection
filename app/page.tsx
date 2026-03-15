"use client";
import { useState, useEffect } from 'react';
import { Movie } from './types/types';
import Configuration from './features/config';
import MoviesList from './features/list';
import { MoviesSummary } from './utils/movies-summary';
import LoadingSkeleton from './features/skeleton';
import { ConfigStore } from './features/config/config-store';

export default function MoviesCollection() {
  const [activeSection, setActiveSection] = useState<'moviesList' | 'config'>('moviesList');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesSummary, setMoviesSummary] = useState<MoviesSummary>(new MoviesSummary());

  // data load
  useEffect(() => {
    const localMovies = localStorage.getItem('my_movies');
    const localConfig = localStorage.getItem('config');
    if (localMovies) setMovies(JSON.parse(localMovies));
    if (localConfig) ConfigStore.getInstance().setApiConfig(JSON.parse(localConfig));
  }, []);

  useEffect(() => {
    if (movies) {
      setMoviesSummary(new MoviesSummary(movies));
    }
  }, [movies]);

  if (!ConfigStore.getInstance().getApiConfig()) {
    return <LoadingSkeleton />;
  }

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <nav className="flex gap-4 border-b border-slate-800 mb-8">
        <button
          onClick={() => setActiveSection('moviesList')}
          className={`pb-2 px-4 font-medium transition-all ${
            activeSection === 'moviesList' 
            ? 'border-b-2 border-sky-500 text-sky-500' 
            : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          📺 Mi Colección
        </button>
        <button
          onClick={() => setActiveSection('config')}
          className={`pb-2 px-4 font-medium transition-all ${
            activeSection === 'config' 
            ? 'border-b-2 border-sky-500 text-sky-500' 
            : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ⚙️ Configuración
        </button>
      </nav>

      {/* configuration section */}
      {activeSection === 'config' && (
        <Configuration
          setMovies={setMovies}
        />
      )}

      {/* movies list */}
      {activeSection === 'moviesList' && (
        <MoviesList 
          movies={movies}
          moviesSummary={moviesSummary}
        />
      )}
    </main>
  );
}