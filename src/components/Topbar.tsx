"use client";

interface TopbarProps {
  crumb: string;
  title: string;
  progress: number;
  onGenerateDiagnostic: () => void;
}

export default function Topbar({ crumb, title, progress, onGenerateDiagnostic }: TopbarProps) {
  return (
    <div className="sticky top-0 z-20 bg-canvas/90 backdrop-blur-[8px] border-b border-line flex items-center justify-between gap-4 px-6 py-3.5">
      <div>
        <div className="font-mono text-[10px] tracking-[1px] uppercase text-muted">
          {crumb}
        </div>
        <h2 className="font-[var(--font-heading)] text-[19px] font-semibold mt-0.5 m-0">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3.5">
        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <div className="w-[120px] h-[7px] bg-[#D7DFEA] rounded-[5px] overflow-hidden">
            <div
              className="h-full bg-gold rounded-[5px] transition-[width] duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted font-semibold">
            {progress}%
          </span>
        </div>
        {/* Generate button */}
        <button
          onClick={onGenerateDiagnostic}
          className="font-[var(--font-heading)] font-semibold text-[13.5px] rounded-[9px] px-4 py-2.5 border-[1.5px] border-transparent bg-gold text-white hover:bg-[#a9781f] transition-colors"
        >
          Generar diagnóstico
        </button>
      </div>
    </div>
  );
}
