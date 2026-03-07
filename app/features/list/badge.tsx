export enum BadgeType {
  _4k = '4k',
  FullHD = 'FullHD',
  Genre = 'genre',
};

export default function Badge({
  type,
  children,
}: {
  type: BadgeType;
  children: string;
}) {
  let badgeClasses = "relative inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all duration-300 ";

  if (type === BadgeType._4k) {
    badgeClasses += "bg-gradient-to-b from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-950/30 border border-amber-300/50";
  } else if (type === BadgeType.FullHD) {
    badgeClasses += "bg-gradient-to-b from-sky-500 to-sky-700 text-white shadow-lg shadow-sky-950/40 border border-sky-400/50";
  } else {
    badgeClasses += "bg-slate-700 text-slate-200 border border-slate-600/50";
  }

  return (
    <span className={badgeClasses}>
      <span className="absolute inset-0 bg-white/10 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
      {children}
    </span>
  );
};