import { useEffect, useState } from "react";
import { Movie } from "../../types/types";
import Badge from "./badge";

export default function MovieDetails({
  selectedMovie,
  onClose,
}: {
  selectedMovie: Movie;
  onClose: () => void;
}) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!selectedMovie) setShowVideo(false);
  }, [selectedMovie]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
    >
      <div 
        className="bg-slate-900 w-full max-w-lg h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="relative aspect-video w-full flex-shrink-0 bg-black">
          {selectedMovie.tmdb.videoKey && showVideo ? (
            <iframe
              className="w-full h-full animate-in zoom-in-95 duration-300"
              src={`https://www.youtube.com/embed/${selectedMovie.tmdb.videoKey}?autoplay=1&mute=0&modestbranding=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="relative w-full h-full cursor-pointer group" onClick={() => selectedMovie.tmdb.videoKey && setShowVideo(true)}>
              <img 
                src={`https://image.tmdb.org/t/p/w780${selectedMovie.tmdb.backdrop_path}`} 
                className="w-full h-full object-cover opacity-60"
                alt="backdrop"
              />
              {selectedMovie.tmdb.videoKey && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 flex items-center justify-center bg-sky-600 rounded-full text-white shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-30">✕</button>
          {showVideo && (
            <button onClick={() => setShowVideo(false)} className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold z-30">← Volver</button>
          )}
        </div>

        {/* title, duration and score */}
        <div className="p-6 pb-4 flex-shrink-0 border-b border-slate-800/50">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-white leading-tight">{selectedMovie.tmdb.title}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <p className="text-sky-400 text-sm font-bold">
                  {selectedMovie.tmdb.release_date?.split('-')[0]}
                </p>
                <span className="text-slate-600 text-xs">•</span>
                <p className="text-slate-300 text-sm">
                  {selectedMovie.tmdb.runtime} min
                </p>
                <div className="flex gap-1.5">
                  {selectedMovie.trello.labels?.map((label: any, index: number) => (
                    <Badge key={index}>{label}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 flex flex-col items-center min-w-[50px]">
              <span className="text-yellow-400 font-bold text-lg">⭐ {selectedMovie.tmdb.vote_average?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* cast, director and overview */}
        <div className="p-6 overflow-y-auto flex-grow">
          
          {/* details */}
          <div className="grid grid-cols-1 gap-4 text-sm border-b border-slate-800/50 pb-3">
            {selectedMovie.tmdb.director && (
              <div className="flex flex-col">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Director</span>
                <p className="text-slate-200">{selectedMovie.tmdb.director}</p>
              </div>
            )}
            {selectedMovie.tmdb.cast && selectedMovie.tmdb.cast.length > 0 && (
              <div className="flex flex-col">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-1">Reparto</span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedMovie.tmdb.cast.slice(0, 5).join(", ")}
                </p>
              </div>
            )}
          </div>

          {selectedMovie.trello.desc && (
            <div className="bg-sky-500/5 border-l-2 border-sky-500 p-4 rounded-r-xl">
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "{selectedMovie.trello.desc}"
              </p>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Sinopsis</span>
            <p className="text-slate-300 text-sm leading-relaxed">
              {selectedMovie.tmdb.overview}
            </p>
          </div>
        </div>

        {/* footer: buttons */}
        <div className="p-6 pt-3 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-auto">
          <div className="flex gap-3">
            <a 
              href={selectedMovie.trello.url} 
              target="_blank" 
              className="flex-[2] bg-sky-600 hover:bg-sky-500 text-white text-center py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20 active:scale-95"
            >
              Abrir en Trello
            </a>
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}