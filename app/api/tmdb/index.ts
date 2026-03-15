import { ConfigStore } from "../../features/config/config-store";
import { TMDBMovie, TMDBMovieDetails, TMDBPerson } from "../../types/types";
import { FetchQueue } from "../queue";

export const getGenres = async (): Promise<{id: number, name: string}[]> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}&language=${ConfigStore.getInstance().getApiConfig().tmdbLanguage}`);
  const data = await res.json();

  return data.genres;
}

export const getGenresObject = async (): Promise<Record<number, string>> => {
  const genres = await getGenres();

  return genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});
};

export const getMovieData = async (title: string, year?: string): Promise<TMDBMovie> => {
  const res = await FetchQueue.getInstance().fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}&query=${encodeURIComponent(title)}&language=${ConfigStore.getInstance().getApiConfig().tmdbLanguage}`
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

export const getMovieDetails = async (id: string): Promise<TMDBMovieDetails> => {
  const res = await FetchQueue.getInstance().fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}&append_to_response=credits`
  );
  const data = await res.json();

  return {
    runtime: data.runtime,
    director: data.credits?.crew?.find((person: any) => person.job === "Director")?.name,
    cast: data.credits?.cast?.slice(0, 5).map((actor: any) => actor.name)
  };
};

export const getTrailerKey = async (id: string): Promise<string> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}`)
  const data = await res.json();

  const trailer = data.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
  if (trailer) {
    return trailer.key;
  }
}

export const getDiscoverMovies = async (extraQuery: string): Promise<TMDBMovie[]> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}&language=${ConfigStore.getInstance().getApiConfig().tmdbLanguage}&sort_by=popularity.desc&vote_count.gte=100${extraQuery}`);
  const data = await res.json();

  return data.results;
}

export const getPerson = async (actor: string, director: string): Promise<TMDBPerson[]> => {
  const res = await FetchQueue.getInstance().fetch(`https://api.themoviedb.org/3/search/person?query=${actor || director}&api_key=${ConfigStore.getInstance().getApiConfig().tmdbApiKey}`);
  const data = await res.json();

  return data.results;
};