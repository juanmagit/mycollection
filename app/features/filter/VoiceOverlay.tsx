export interface VoiceOverlayProps {
  isListening: boolean;
  voiceTranscript: string;
  voiceFeedback: string | null;
  onClose: () => void;
  onOpenHelp: () => void;
}

export default function VoiceOverlay({
  isListening,
  voiceTranscript,
  voiceFeedback,
  onClose,
  onOpenHelp,
}: VoiceOverlayProps) {
  if (!isListening && !voiceTranscript && !voiceFeedback) {
    return null;
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] w-[90%] max-w-md bg-slate-900/95 border border-purple-500/40 backdrop-blur-md rounded-2xl shadow-2xl p-4 text-white text-xs animate-in slide-in-from-top duration-300">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isListening ? "bg-rose-500 animate-ping" : "bg-purple-500"}`} />
          <span className="font-bold text-purple-300">
            {isListening ? "Escuchando tu voz..." : "Dictado por voz"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHelp}
            className="text-purple-300 hover:text-white font-bold bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 px-2 py-0.5 rounded-lg text-[11px] flex items-center gap-1 transition-all"
            title="Ver comandos de voz"
          >
            <span>ℹ️</span> Ayuda
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold px-1"
          >
            ✕
          </button>
        </div>
      </div>

      {voiceTranscript && (
        <p className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60 italic text-slate-200 text-sm mb-2">
          "{voiceTranscript}"
        </p>
      )}

      {voiceFeedback && (
        <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 font-semibold mb-1">
          ✓ {voiceFeedback}
        </div>
      )}

      {isListening && !voiceTranscript && (
        <p className="text-[11px] text-slate-400">
          Ejemplo: <span className="text-purple-300">"Película Batman año 1989 década de los 80 4k"</span>
        </p>
      )}
    </div>
  );
}
