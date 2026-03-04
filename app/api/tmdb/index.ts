import { TMDBMovie, TMDBMovieDetails, TrelloConfig } from "../../types/types";

export const getMovieData = async (config: TrelloConfig, title: string, year?: string): Promise<TMDBMovie> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${config.tmdbApiKey}&query=${encodeURIComponent(title)}&language=es-ES`
  );
  const data = await res.json();

  if (year) {
    return data.results.find((movie: TMDBMovie) => {
      return movie.release_date.includes(year);
    });
  } else {
    return data.results[0];
  }
};

export const getMovieDetails = async (config: TrelloConfig, id: string): Promise<TMDBMovieDetails> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${config.tmdbApiKey}&append_to_response=credits`
  );
  const data = await res.json();

  return {
    runtime: data.runtime,
    director: data.credits?.crew?.find((person: any) => person.job === "Director")?.name,
    cast: data.credits?.cast?.slice(0, 5).map((actor: any) => actor.name)
  };
};

export const getTrailerKey = async (config: TrelloConfig, id: string): Promise<string> => {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${config.tmdbApiKey}`)
  const data = await res.json();

  const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
  if (trailer) {
    return trailer.key;
  }
}