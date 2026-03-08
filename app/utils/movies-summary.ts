import { Movie } from "../types/types";

export class MoviesSummary {
  genres: string[];
  directors: string[];
  actors: string[];

  constructor(movies: Movie[] = []) {
    // genres
    const genres = movies.reduce((acc, movie) => {
      movie.tmdb.genres.forEach(genre => {
        acc.add(genre);
      });
      return acc;
    }, new Set<string>());

    this.genres = Array.from(genres);

    // directors
    const directors = movies.reduce((acc, movie) => {
      acc.add(movie.tmdb.director);
      return acc;
    }, new Set<string>());

    this.directors = Array.from(directors);

    // actors
    const actors = movies.reduce((acc, movie) => {
      movie.tmdb.cast.forEach(actor => {
        acc.add(actor);
      });
      return acc;
    }, new Set<string>());

    this.actors = Array.from(actors);
  }

  getGenres(): string[] {
    return this.genres;
  }

  getDirectors(): string[] {
    return this.directors;
  }

  getActors(): string[] {
    return this.actors;
  }
}