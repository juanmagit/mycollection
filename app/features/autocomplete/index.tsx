import { useState, useEffect, useRef } from "react";
import { normalizeText } from "../../utils";

interface AutocompleteProps {
  options: { id: number | string; label: string; }[];
  placeholder: string;
  selectedValue: number | string | null;
  onSelect: (value: number | string | null) => void;
  label?: string;
}

export default function AutocompleteSelector({
  options,
  placeholder,
  selectedValue,
  onSelect,
  label
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // container reference

  // closes options menu if click outside of the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.id === selectedValue);

  const filteredOptions = options.filter(({ label }) =>
    normalizeText(label).includes(normalizeText(query))
  );

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-widest">
          {label}
        </h4>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={selectedOption ? selectedOption.label : query || ""}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedValue) onSelect(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
        />

        {/* options menu */}
        {isOpen && !selectedValue && (
          <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-48 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-200">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelect(id);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-sky-600 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                >
                  {label}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-slate-500 italic">No hay resultados</div>
            )}
          </div>
        )}

        {/* clean button */}
        {(selectedValue || query) && (
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}