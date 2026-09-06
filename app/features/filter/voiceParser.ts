export interface ParsedVoiceFilter {
  title?: string;
  genre?: string;
  director?: string;
  actor?: string;
  quality?: string;
  showCompleted?: boolean | null;
  year?: string;
  decade?: string;
  minRuntime?: number | null;
  maxRuntime?: number | null;
}

/**
 * Normalizes strings for lowercase, accent-free comparisons.
 */
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Maps colloquial phrases to specific decades (e.g. "los ochenta" -> "1980")
 */
function parseDecadeWord(text: string): string | null {
  const norm = normalizeStr(text);

  if (/\b(los\s+60|sesenta|60s|1960)\b/i.test(norm)) return "1960";
  if (/\b(los\s+70|setenta|70s|1970)\b/i.test(norm)) return "1970";
  if (/\b(los\s+80|ochenta|80s|1980)\b/i.test(norm)) return "1980";
  if (/\b(los\s+90|noventa|90s|1990)\b/i.test(norm)) return "1990";
  if (/\b(los\s+2000|dos\s+mil|00s|2000)\b/i.test(norm)) return "2000";
  if (/\b(los\s+2010|los\s+10|10s|2010)\b/i.test(norm)) return "2010";
  if (/\b(los\s+2020|los\s+20|20s|2020)\b/i.test(norm)) return "2020";

  return null;
}

/**
 * Parses a spoken phrase and accurately extracts filter fields including year and decade.
 */
export function parseVoiceInput(
  rawTranscript: string,
  genres: string[] = [],
  directors: string[] = [],
  actors: string[] = [],
  years: string[] = []
): ParsedVoiceFilter {
  const result: ParsedVoiceFilter = {};
  if (!rawTranscript || !rawTranscript.trim()) return result;

  const transcript = rawTranscript.trim();

  // 1. Quality detection
  if (/\b4\s*k\b/i.test(transcript)) {
    result.quality = "4K";
  } else if (/\b(full\s*hd|1080p?|alta\s*definicion)\b/i.test(transcript)) {
    result.quality = "FullHD";
  }

  // 2. Watch status detection
  if (/\b(no\s+vistas?|no\s+vistos?|pendientes?|por\s+ver)\b/i.test(transcript)) {
    result.showCompleted = false;
  } else if (/\b(vistas?|vistos?|completadas?|completados?|ya\s+vistas?)\b/i.test(transcript)) {
    result.showCompleted = true;
  } else if (/\b(todas?|todos?)\b/i.test(transcript)) {
    result.showCompleted = null;
  }

  // Runtime / Duration detection
  const durationBetweenMatch = transcript.match(/(?:duraci[oó]n|entre)\s+(\d+)\s*(?:y|a)\s*(\d+)\s*(?:min|minutos|m)?/i);
  const durationMoreMatch = transcript.match(/(?:m[aá]s\s+de|m[ií]nimo\s+de)\s+(\d+)\s*(?:min|minutos|m|horas?|h)?/i);
  const durationLessMatch = transcript.match(/(?:menos\s+de|m[aá]ximo\s+de)\s+(\d+)\s*(?:min|minutos|m|horas?|h)?/i);

  if (durationBetweenMatch && durationBetweenMatch[1] && durationBetweenMatch[2]) {
    result.minRuntime = parseInt(durationBetweenMatch[1], 10);
    result.maxRuntime = parseInt(durationBetweenMatch[2], 10);
  } else {
    if (durationMoreMatch && durationMoreMatch[1]) {
      let val = parseInt(durationMoreMatch[1], 10);
      if (/hora/i.test(durationMoreMatch[0])) val = val * 60;
      result.minRuntime = val;
    }
    if (durationLessMatch && durationLessMatch[1]) {
      let val = parseInt(durationLessMatch[1], 10);
      if (/hora/i.test(durationLessMatch[0])) val = val * 60;
      result.maxRuntime = val;
    }
  }

  // 3. Decade detection
  const decadeMatch = transcript.match(/(?:década|decada|años)\s+(?:de\s+los\s+)?([a-z0-9\s]+?)(?=\s+(?:título|película|titulo|pelicula|director|actor|actriz|género|genero|calidad|estado|año|vistas?|pendientes?|4k|full\s*hd)|$)/i);
  if (decadeMatch && decadeMatch[1]) {
    const dec = parseDecadeWord(decadeMatch[1]);
    if (dec) result.decade = dec;
  } else if (/\b(década|decada|de\s+los\s+(?:80|90|70|60|2000|2010|2020|ochenta|noventa|setenta|sesenta))\b/i.test(transcript)) {
    const dec = parseDecadeWord(transcript);
    if (dec) result.decade = dec;
  }

  // 4. Specific year detection
  const yearMatch = transcript.match(/(?:año|del?\s+año)\s+(19\d\d|20[0-3]\d)\b/i);
  if (yearMatch && yearMatch[1]) {
    result.year = yearMatch[1];
  } else {
    // If there is an explicit 4-digit year between 1900 and 2029 that is not a decade ending in 0 without prefix
    const fourDigitMatch = transcript.match(/\b(19\d\d|20[0-3]\d)\b/);
    if (fourDigitMatch && fourDigitMatch[1] && !result.decade) {
      // If it's in the available years list or doesn't end in 0
      const matchedYear = fourDigitMatch[1];
      if (!matchedYear.endsWith("0") || years.includes(matchedYear)) {
        result.year = matchedYear;
      }
    }
  }

  // 5. Check for explicit prefixes ("título...", "director...", "actor...", "género...")
  const hasExplicitPrefix = /\b(título|película|titulo|pelicula|director|actor|actriz|género|genero|año|década|decada)\b/i.test(transcript);

  const titleMatch = transcript.match(/(?:título|película|titulo|pelicula)\s+(.+?)(?=\s+(?:director|actor|actriz|género|genero|calidad|estado|año|década|decada|vistas?|pendientes?|4k|full\s*hd)|$)/i);
  if (titleMatch && titleMatch[1]) {
    result.title = titleMatch[1].trim();
  }

  const directorMatch = transcript.match(/(?:director)\s+(.+?)(?=\s+(?:título|película|titulo|pelicula|actor|actriz|género|genero|calidad|estado|año|década|decada|vistas?|pendientes?|4k|full\s*hd)|$)/i);
  if (directorMatch && directorMatch[1]) {
    result.director = directorMatch[1].trim();
  }

  const actorMatch = transcript.match(/(?:actor|actriz)\s+(.+?)(?=\s+(?:título|película|titulo|pelicula|director|género|genero|calidad|estado|año|década|decada|vistas?|pendientes?|4k|full\s*hd)|$)/i);
  if (actorMatch && actorMatch[1]) {
    result.actor = actorMatch[1].trim();
  }

  const genreMatch = transcript.match(/(?:género|genero)\s+(.+?)(?=\s+(?:título|película|titulo|pelicula|director|actor|actriz|calidad|estado|año|década|decada|vistas?|pendientes?|4k|full\s*hd)|$)/i);
  if (genreMatch && genreMatch[1]) {
    result.genre = genreMatch[1].trim();
  }

  // 6. If NO explicit prefixes were found, do strict exact matching or treat as Title by default
  if (!hasExplicitPrefix) {
    const cleanText = transcript
      .replace(/\b(4k|full\s*hd|1080p?|alta\s*definición|alta\s*definicion|vistas?|vistos?|completadas?|completados?|pendientes?|por\s+ver|todas?|todos?|década|decada|años?)\b/gi, "")
      .replace(/\b(19\d\d|20[0-3]\d)\b/g, "")
      .trim();
    const cleanNormalized = normalizeStr(cleanText);

    if (cleanNormalized.length > 0) {
      const exactGenre = genres.find((g) => normalizeStr(g) === cleanNormalized);
      const exactDirector = directors.find((d) => normalizeStr(d) === cleanNormalized);
      const exactActor = actors.find((a) => normalizeStr(a) === cleanNormalized);

      if (exactGenre) {
        result.genre = exactGenre;
      } else if (exactDirector) {
        result.director = exactDirector;
      } else if (exactActor) {
        result.actor = exactActor;
      } else {
        result.title = cleanText;
      }
    }
  } else {
    // If there WERE explicit prefixes and no explicit title was assigned, check if remaining text is available for title
    if (!result.title) {
      let remaining = transcript
        .replace(/\b(4k|full\s*hd|1080p?|vistas?|vistos?|pendientes?|por\s+ver|todas?)\b/gi, "")
        .replace(/\b(19\d\d|20[0-3]\d)\b/g, "")
        .trim();

      if (result.director) {
        remaining = remaining.replace(new RegExp(`director\\s+${result.director}`, "gi"), "").replace(new RegExp(result.director, "gi"), "");
      }
      if (result.genre) {
        remaining = remaining.replace(new RegExp(`g[ée]nero\\s+${result.genre}`, "gi"), "").replace(new RegExp(result.genre, "gi"), "");
      }
      if (result.actor) {
        remaining = remaining.replace(new RegExp(`(actor|actriz)\\s+${result.actor}`, "gi"), "").replace(new RegExp(result.actor, "gi"), "");
      }

      remaining = remaining.replace(/\b(director|actor|actriz|género|genero|título|titulo|película|pelicula|calidad|estado|año|década|decada)\b/gi, "").trim();

      if (remaining.length > 0) {
        result.title = remaining;
      }
    }
  }

  return result;
}
