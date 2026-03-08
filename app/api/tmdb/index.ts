import { TMDBMovie, TMDBMovieDetails, ApiConfig } from "../../types/types";
import { FetchQueue } from "../queue";

export const getGenres = async (config: ApiConfig): Promise<Record<number, string>> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${config.tmdbApiKey}&language=${config.tmdbLanguage}`);
  const data = await res.json();

  return data.genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});
};

export const getMovieData = async (config: ApiConfig, title: string, year?: string): Promise<TMDBMovie> => {
  const res = await FetchQueue.getInstance().fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${config.tmdbApiKey}&query=${encodeURIComponent(title)}&language=${config.tmdbLanguage}`
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

export const getMovieDetails = async (config: ApiConfig, id: string): Promise<TMDBMovieDetails> => {
  const res = await FetchQueue.getInstance().fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${config.tmdbApiKey}&append_to_response=credits`
  );
  const data = await res.json();

  return {
    runtime: data.runtime,
    director: data.credits?.crew?.find((person: any) => person.job === "Director")?.name,
    cast: data.credits?.cast?.slice(0, 5).map((actor: any) => actor.name)
  };
};

export const getTrailerKey = async (config: ApiConfig, id: string): Promise<string> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${config.tmdbApiKey}`)
  const data = await res.json();

  const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
  if (trailer) {
    return trailer.key;
  }
}