"use client";
import { useState, useEffect } from 'react';
import { TrelloConfig, Movie } from './types/types';
import Configuration from './features/config';
import MoviesList from './features/list';

export default function ColeccionPelis() {
  const [activeSection, setActiveSection] = useState<'listado' | 'config'>('listado');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [config, setConfig] = useState<TrelloConfig>({ key: '', token: '', boardId: '', listName: '', tmdbApiKey: ''});

  // data load
  useEffect(() => {
    const localMovies = localStorage.getItem('my_movies');
    const localConfig = localStorage.getItem('config');
    if (localMovies) setMovies(JSON.parse(localMovies));
    if (localConfig) setConfig(JSON.parse(localConfig));
  }, []);

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <nav className="flex gap-4 border-b border-slate-800 mb-8">
        <button
          onClick={() => setActiveSection('listado')}
          className={`pb-2 px-4 font-medium transition-all ${
            activeSection === 'listado' 
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
          config={config}
          setConfig={setConfig}
          setMovies={setMovies}
        />
      )}

      {/* movies list */}
      {activeSection === 'listado' && (
        <MoviesList 
          movies={movies}
        />
      )}
    </main>
  );
}