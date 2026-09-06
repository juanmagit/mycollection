import { SortOption } from "../features/sort";
import { Filter, Movie } from "../types/types";
import { TMDB_IMAGE_BASE } from "../config";

export const normalizeText = (text: string) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .normalize("NFD") // break down the accents 'á' -> 'a' + '´'
    .replace(/[\u0300-\u036f]/g, ""); // remove accented characters
};

/**
 * Convierte la fecha string recibida de TMDB API a la estructura numérica del modelo Movie.
 */
export const tmdbStringDateToMovieDate = (date: string): Movie['tmdb']['release_date'] => {
  const rawStr = date ?? '';
  const [yearStr, monthStr, dayStr] = rawStr.split('-');

  const parsedYear = yearStr && !isNaN(parseInt(yearStr, 10)) ? parseInt(yearStr, 10) : null;
  const parsedMonth = monthStr && !isNaN(parseInt(monthStr, 10)) ? parseInt(monthStr, 10) : null;
  const parsedDay = dayStr && !isNaN(parseInt(dayStr, 10)) ? parseInt(dayStr, 10) : null;
  const parsedDecade = parsedYear ? Math.floor(parsedYear / 10) * 10 : null;

  return {
    year: parsedYear,
    month: parsedMonth,
    day: parsedDay,
    decade: parsedDecade,
    raw: rawStr,
  };
};

export const filterMovies = (movies: Movie[], filter: Filter): Movie[] => {
  return movies.filter(movie => {
    if (!filter) return true;

    if (filter.showBroken) {
      return !movie.tmdb.title;
    }

    let completedMatch = true;
    if (filter.showCompleted === true) {
      completedMatch = movie.trello.completed === true;
    }

    let notCompletedMatch = true;
    if (filter.showCompleted === false) {
      notCompletedMatch = movie.trello.completed === false;
    }

    let qualityMatch = true;
    if (filter.quality) {
      qualityMatch = movie.trello.labels?.some(tag => 
        tag.toLowerCase().includes(filter.quality?.toLowerCase())
      );
    }

    let titleMatch = true;
    if (filter.title) {
      titleMatch = normalizeText(movie.tmdb.title)?.includes(normalizeText(filter.title)) ||
        normalizeText(movie.tmdb.original_title)?.includes(normalizeText(filter.title));
    }

    let genreMatch = true;
    if (filter.genre) {
      const normalizedGenre = normalizeText(filter.genre);
      genreMatch = movie.tmdb.genres?.some(genre => 
        normalizeText(genre).includes(normalizedGenre)
      );
    }

    let directorMatch = true;
    if (filter.director) {
      directorMatch = normalizeText(movie.tmdb.director)?.includes(normalizeText(filter.director));
    }

    let actorMatch = true;
    if (filter.actor) {
      const normalizedActor = normalizeText(filter.actor);
      actorMatch = movie.tmdb.cast?.some(actor => 
        normalizeText(actor)?.includes(normalizedActor)
      );
    }

    let yearMatch = true;
    if (filter.year) {
      yearMatch = movie.tmdb.release_date?.year === parseInt(filter.year, 10);
    }

    let decadeMatch = true;
    if (filter.decade) {
      decadeMatch = movie.tmdb.release_date?.decade === parseInt(filter.decade, 10);
    }

    let runtimeMatch = true;
    const runtime = movie.tmdb.runtime;

    if (filter.minRuntime !== undefined && filter.minRuntime !== null) {
      if (isNaN(runtime) || runtime < filter.minRuntime) {
        runtimeMatch = false;
      }
    }

    if (filter.maxRuntime !== undefined && filter.maxRuntime !== null) {
      if (isNaN(runtime) || runtime > filter.maxRuntime) {
        runtimeMatch = false;
      }
    }

    return qualityMatch && titleMatch && completedMatch && notCompletedMatch && genreMatch && directorMatch && actorMatch && yearMatch && decadeMatch && runtimeMatch;
  });
};

export const sortMovies = (movies: Movie[], sort: SortOption): Movie[] => {
  const sortedMovies = [...movies];

  switch (sort) {
    case SortOption.TITLE_ASC:
      sortedMovies.sort((a, b) => {
        const titleA = normalizeText(a.tmdb.title) || "";
        const titleB = normalizeText(b.tmdb.title) || "";
        return titleA.localeCompare(titleB);
      });
      break;

    case SortOption.TITLE_DESC:
      sortedMovies.sort((a, b) => {
        const titleA = normalizeText(a.tmdb.title) || "";
        const titleB = normalizeText(b.tmdb.title) || "";
        return titleB.localeCompare(titleA);
      });
      break;

    case SortOption.YEAR_ASC:
      sortedMovies.sort((a, b) => {
        const yearA = a.tmdb.release_date?.year || 0;
        const yearB = b.tmdb.release_date?.year || 0;
        return yearA - yearB;
      });
      break;

    case SortOption.YEAR_DESC:
      sortedMovies.sort((a, b) => {
        const yearA = a.tmdb.release_date?.year || 0;
        const yearB = b.tmdb.release_date?.year || 0;
        return yearB - yearA;
      });
      break;

    case SortOption.RATING_DESC:
      sortedMovies.sort((a, b) => {
        const ratingA = a.tmdb.vote_average || 0;
        const ratingB = b.tmdb.vote_average || 0;
        return ratingB - ratingA;
      });
      break;

    default:
      break;
  }

  return sortedMovies;
};

/**
 * Genera una URL de búsqueda a FilmAffinity mediante DuckDuckGo !ducky
 */
export const getFilmAffinityUrl = (title: string, year?: string | number): string => {
  const searchQuery = year
    ? `!ducky ${title} ${year} site:filmaffinity.com`
    : `!ducky ${title} site:filmaffinity.com`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
};

/**
 * Genera la URL de la ficha de una película en TMDB
 */
export const getTMDBUrl = (id: string): string => {
  return `https://www.themoviedb.org/movie/${id}`;
};

/**
 * Genera la URL de incrustación de YouTube para el trailer de una película
 */
export const getYouTubeEmbedUrl = (videoKey?: string): string => {
  if (!videoKey) return "";
  return `https://www.youtube.com/embed/${videoKey}?autoplay=1&mute=0&modestbranding=1`;
};

/**
 * Genera la URL de la imagen de fondo (backdrop) de TMDB
 */
export const getTMDBBackdropUrl = (backdropPath?: string, size = "w780"): string => {
  if (!backdropPath) return "";
  return `${TMDB_IMAGE_BASE}${size}${backdropPath}`;
};