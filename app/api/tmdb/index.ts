import { TMDBMovie, TrelloConfig } from "../../types/types";

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