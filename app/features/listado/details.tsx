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
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors z-30"
          >
            ✕
          </button>

          {showVideo && (
            <button 
              onClick={() => setShowVideo(false)}
              className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold z-30"
            >
              ← Volver
            </button>
          )}
        </div>

        {/* title (out of scroll) */}
        <div className="p-6 pb-0 flex-shrink-0">
          <div className="flex justify-between items-start">
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
        </div>

        {/* scroll content (overview only) */}
        <div className="p-6 overflow-y-auto flex-grow">
          {selectedMovie.trello.desc && (
            <p className="text-slate-400 text-base leading-relaxed mb-6 italic border-l-2 border-sky-500 pl-4">
              {selectedMovie.trello.desc}
            </p>
          )}

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {selectedMovie.tmdb.overview}
          </p>
        </div>

        {/* buttons */}
        <div className="p-6 pt-2 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-auto">
          <div className="flex gap-3">
            <a 
              href={selectedMovie.trello.url} 
              target="_blank" 
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-center py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-900/20"
            >
              Abrir en Trello
            </a>
            <button 
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}