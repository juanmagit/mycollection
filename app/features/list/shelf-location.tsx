import { useState } from "react";
import { MapPin, X } from "lucide-react";

interface ShelfLocationProps {
  location: {
    shelf: number;
    row: number;
    column: number;
    raw: string;
  };
}

export default function ShelfLocation({ location }: ShelfLocationProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Generate arrays for rows (1 to 9) and columns (1 to 3)
  const rows = Array.from({ length: 9 }, (_, i) => i + 1);
  const cols = Array.from({ length: 3 }, (_, i) => i + 1);

  return (
    <>
      {/* Compact Interactive Preview Card */}
      <div
        onClick={() => setIsZoomed(true)}
        className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-950 hover:shadow-[0_0_12px_rgba(14,165,233,0.15)] transition-all duration-300 cursor-pointer select-none group mt-4 w-full"
      >
        {/* Miniature Shelf Grid (3 Columns x 9 Rows) */}
        <div className="w-10 h-20 bg-slate-900 border border-slate-850 rounded p-[3px] grid grid-cols-3 gap-[2px] shrink-0 shadow-inner group-hover:border-sky-950 transition-colors">
          {rows.map((r) =>
            cols.map((c) => {
              const isTarget = r === location.row && c === location.column;
              return (
                <div
                  key={`mini-cell-${r}-${c}`}
                  className={`rounded-[1px] transition-all duration-300 ${
                    isTarget
                      ? "bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"
                      : "bg-slate-950/80 group-hover:bg-slate-950"
                  }`}
                />
              );
            })
          )}
        </div>

        {/* Text Details & Action Hint */}
        <div className="flex flex-col min-w-0">
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-0.5">
            Ubicación en Estantería
          </span>
          <span className="text-slate-200 text-xs font-bold leading-snug">
            Estantería {location.shelf} • Fila {location.row} • Columna {location.column}
          </span>
          <span className="text-[10px] text-sky-400 font-semibold opacity-85 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex items-center gap-1 mt-1">
            🔍 Click para ampliar ubicación
          </span>
        </div>
      </div>

      {/* Expanded Zoom Modal Overlay */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl relative animate-in zoom-in-95 duration-200 cursor-default"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 hover:bg-slate-800 rounded-full transition-colors active:scale-95"
              aria-label="Cerrar ampliación"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/25 mb-1 animate-bounce duration-1000">
                <MapPin size={20} />
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">Ubicación Física</h3>
              <p className="text-slate-400 text-sm font-semibold">
                Estantería {location.shelf}
              </p>
            </div>

            {/* Bookcase Representation (Large Shelf Grid) */}
            <div className="flex flex-col items-center w-full">
              {/* Column labels (C1, C2, C3) */}
              <div className="flex justify-between w-64 pl-12 pr-6 text-[10px] font-black text-slate-500 tracking-wider mb-2 select-none">
                <span>C1</span>
                <span>C2</span>
                <span>C3</span>
              </div>

              {/* Bookcase Frame wrapper */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950 border border-slate-800/80 rounded-2xl shadow-2xl w-72 relative">
                {rows.map((r) => (
                  <div key={`large-row-${r}`} className="flex items-center gap-3 w-full">
                    {/* Row Label (F1 to F9) */}
                    <span className="text-[10px] font-black text-slate-500 w-6 text-right select-none">
                      F{r}
                    </span>

                    {/* Shelf Compartments (3 Columns) */}
                    <div className="grid grid-cols-3 gap-2 flex-grow">
                      {cols.map((c) => {
                        const isTarget = r === location.row && c === location.column;
                        return (
                          <div
                            key={`large-cell-${r}-${c}`}
                            className={`h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                              isTarget
                                ? "bg-gradient-to-br from-red-500/25 to-red-600/10 border-2 border-red-500 text-red-500 font-bold text-[11px] shadow-[0_0_15px_rgba(239,68,68,0.4)] relative"
                                : "bg-slate-900 border border-slate-850/80 hover:bg-slate-850/50"
                            }`}
                          >
                            {isTarget ? (
                              <>
                                <span className="absolute inset-0 rounded-lg border border-red-500/80 animate-ping opacity-75 pointer-events-none" />
                                <span className="z-10 tracking-widest text-[9px] font-black select-none">AQUÍ</span>
                              </>
                            ) : (
                              <span className="text-[8px] text-slate-800 font-semibold select-none group-hover:text-slate-700 transition-colors">
                                {r}-{c}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Instruction / Legend */}
            <p className="text-[10px] text-slate-500 italic text-center max-w-[240px] leading-relaxed">
              La estantería consta de 9 filas (verticales, de arriba a abajo) y 3 columnas (horizontales, de izquierda a derecha).
            </p>
          </div>
        </div>
      )}
    </>
  );
}
