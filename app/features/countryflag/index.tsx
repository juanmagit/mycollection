const getFlagEmoji = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function CountryFlag({ countryCode }: { countryCode: string | null | undefined }) {
  if (!countryCode) return null;
  return (
    <span className="text-xl" title={countryCode.toUpperCase()}>
      {getFlagEmoji(countryCode)}
    </span>
  );
}