export interface VoiceHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoiceHelpModal({ isOpen, onClose }: VoiceHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎙️</span>
            <div>
              <h3 className="text-lg font-bold text-white">Búsqueda por Voz - Guía de Comandos</h3>
              <p className="text-[11px] text-purple-300">Conoce todas las posibilidades y comandos soportados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          <p className="text-slate-300 text-xs leading-relaxed bg-purple-950/30 border border-purple-800/40 p-3 rounded-2xl">
            Puedes dictar de forma natural o combinar varios filtros usando palabras clave. El sistema repartirá automáticamente la información entre los campos.
          </p>

          {/* Rule 1: Direct title */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-purple-400 flex items-center gap-2 text-sm">
              <span>🎬</span> 1. Título de Película Directo
            </h4>
            <p className="text-slate-400 leading-snug">
              Di simplemente el título de la película. Si no es un nombre exacto de director o género, se buscará solo por el título.
            </p>
            <div className="bg-slate-950/60 p-2.5 rounded-xl font-mono text-purple-300 space-y-1">
              <div>"Alien"</div>
              <div>"El Señor de los Anillos"</div>
              <div>"Die Hard"</div>
            </div>
          </div>

          {/* Rule 2: Year and Decade */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-indigo-400 flex items-center gap-2 text-sm">
              <span>📅</span> 2. Año y Década
            </h4>
            <p className="text-slate-400 leading-snug">
              Di un año específico (ej. *"año 1999"*) o una década coloquial (*"los 80"*, *"década de los 90"*).
            </p>
            <div className="bg-slate-950/60 p-2.5 rounded-xl font-mono text-indigo-300 space-y-1">
              <div>"Año 1994"  •  "Año 2008"</div>
              <div>"Década de los 80"  •  "Los 90"  •  "Los 2000"</div>
            </div>
          </div>

          {/* Rule 3: Exact name */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
              <span>👤</span> 3. Nombre Exacto (Director, Actor o Género)
            </h4>
            <p className="text-slate-400 leading-snug">
              Si dices el nombre completo exacto de un director, actor o género de tu catálogo, se aplicará directamente a su filtro.
            </p>
            <div className="bg-slate-950/60 p-2.5 rounded-xl font-mono text-sky-300 space-y-1">
              <div>"Quentin Tarantino" <span className="text-slate-500 text-[10px]">(asigna Director)</span></div>
              <div>"Bruce Willis" <span className="text-slate-500 text-[10px]">(asigna Actor)</span></div>
              <div>"Ciencia Ficción" <span className="text-slate-500 text-[10px]">(asigna Género)</span></div>
            </div>
          </div>

          {/* Rule 4: Explicit keywords */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <span>🏷️</span> 4. Palabras Clave (Múltiples Campos)
            </h4>
            <p className="text-slate-400 leading-snug">
              Usa prefijos explícitos para rellenar varios campos a la vez: <code className="text-emerald-300">película</code>, <code className="text-emerald-300">director</code>, <code className="text-emerald-300">actor</code>, <code className="text-emerald-300">género</code>, <code className="text-emerald-300">año</code>, <code className="text-emerald-300">década</code>.
            </p>
            <div className="bg-slate-950/60 p-2.5 rounded-xl font-mono text-emerald-300 space-y-1.5">
              <div>"Película Matrix director Wachowski vistas"</div>
              <div>"Género Acción década de los 80 calidad 4k"</div>
              <div>"Película Batman año 1989"</div>
            </div>
          </div>

          {/* Rule 5: Quality and Watch status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                <span>📺</span> Calidad
              </h4>
              <p className="text-[11px] text-slate-400">Di <code className="text-amber-300 font-bold">"4k"</code> o <code className="text-amber-300 font-bold">"full hd"</code>.</p>
            </div>
            <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
              <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                <span>⏳</span> Estado de Visionado
              </h4>
              <p className="text-[11px] text-slate-400">
                <code className="text-rose-300 font-bold">"vistas"</code>, <code className="text-rose-300 font-bold">"pendientes"</code> o <code className="text-rose-300 font-bold">"todas"</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">Formato dictado nativo es-ES</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg active:scale-95 text-xs"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
