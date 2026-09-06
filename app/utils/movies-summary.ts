import { Movie } from "../types/types";

export class MoviesSummary {
  genres: string[];
  directors: string[];
  actors: string[];
  years: string[];
  decades: string[];

  constructor(movies: Movie[] = []) {
    // genres
    const genres = movies.reduce((acc, movie) => {
      movie.tmdb.genres?.forEach(genre => {
        acc.add(genre);
      });
      return acc;
    }, new Set<string>());

    this.genres = Array.from(genres);

    // directors
    const directors = movies.reduce((acc, movie) => {
      if (movie.tmdb.director) {
        acc.add(movie.tmdb.director);
      }
      return acc;
    }, new Set<string>());

    this.directors = Array.from(directors);

    // actors
    const actors = movies.reduce((acc, movie) => {
      movie.tmdb.cast?.forEach(actor => {
        acc.add(actor);
      });
      return acc;
    }, new Set<string>());

    this.actors = Array.from(actors);

    // years
    const years = movies.reduce((acc, movie) => {
      const year = movie.tmdb.release_date?.year;
      if (year !== null && year !== undefined) {
        acc.add(String(year));
      }
      return acc;
    }, new Set<string>());

    this.years = Array.from(years).sort((a, b) => b.localeCompare(a));

    // decades
    const decades = movies.reduce((acc, movie) => {
      const decade = movie.tmdb.release_date?.decade;
      if (decade !== null && decade !== undefined) {
        acc.add(String(decade));
      }
      return acc;
    }, new Set<string>());

    this.decades = Array.from(decades).sort((a, b) => b.localeCompare(a));
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

  getYears(): string[] {
    return this.years;
  }

  getDecades(): string[] {
    return this.decades;
  }
}