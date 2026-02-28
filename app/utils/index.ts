export const normalizeText = (text: string) => {
  if (!text) return text;
  return text
    .toLowerCase()
    .normalize("NFD") // break down the accents 'á' -> 'a' + '´'
    .replace(/[\u0300-\u036f]/g, ""); // remove accented characters
};