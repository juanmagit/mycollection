export interface TrelloConfig {
  key: string;
  token: string;
  boardId: string;
  listName: string;
  tmdbApiKey: string;
}

export interface TrelloListEntry {
  id: string;
  name: string;
}

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  shortUrl: string;
  labels: TrelloLabel[];
  dueComplete: boolean;
}

export interface TrelloLabel {
  id: string;
  name: string;
};

export interface TMDBMovie {
  id: string;
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  runtime: string;
}

export interface TMDBMovieDetails {
  runtime: string;
  director: string;
  cast: string[];
}

export interface Movie {
  trello: {
    id: string;
    title: string;
    desc: string;
    url: string;
    labels: string[];
    completed: boolean;
  },
  tmdb: {
    id: string;
    title: string;
    original_title: string;
    formato?: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    genres: string[];
    vote_average: number;
    release_date: {
      year: string;
      month: string;
      day: string;
    };
    videoKey: string;
    runtime: string;
    director: string;
    cast: string[];
  },
}

export interface Filter {
  quality: string;
  title: string;
  showCompleted: boolean | null;
  showBroken: boolean;
}