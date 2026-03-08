import { SortOption } from "../features/sort";
import { Filter, Movie } from "../types/types";

export const normalizeText = (text: string) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .normalize("NFD") // break down the accents 'á' -> 'a' + '´'
    .replace(/[\u0300-\u036f]/g, ""); // remove accented characters
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

    return qualityMatch && titleMatch && completedMatch && notCompletedMatch && genreMatch && directorMatch;
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
        const yearA = a.tmdb.release_date?.year || "";
        const yearB = b.tmdb.release_date?.year || "";
        return parseInt(yearA) - parseInt(yearB);
      });
      break;

    case SortOption.YEAR_DESC:
      sortedMovies.sort((a, b) => {
        const yearA = a.tmdb.release_date?.year || "";
        const yearB = b.tmdb.release_date?.year || "";
        return parseInt(yearB) - parseInt(yearA);
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