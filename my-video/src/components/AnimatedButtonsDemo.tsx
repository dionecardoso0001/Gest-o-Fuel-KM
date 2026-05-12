"use client";

export const AnimatedButtonsDemo: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center py-6">
      {/* Glow */}
      <button
        className="px-6 py-3 rounded-geist bg-indigo-600 text-white font-semibold
          transition-all duration-300 ease-in-out
          hover:brightness-110"
        style={{} as React.CSSProperties}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 22px 6px rgba(99,102,241,0.75)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        ✨ Glow
      </button>

      {/* Scale */}
      <button
        className="px-6 py-3 rounded-geist bg-emerald-600 text-white font-semibold
          transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
      >
        ⬆ Scale
      </button>

      {/* Rotate */}
      <button
        className="px-6 py-3 rounded-geist bg-sky-600 text-white font-semibold
          transition-transform duration-300 ease-in-out hover:rotate-6 active:-rotate-6"
      >
        ↻ Rotate
      </button>

      {/* All combined */}
      <button
        className="px-6 py-3 rounded-geist bg-rose-600 text-white font-semibold
          transition-all duration-300 ease-in-out
          hover:scale-105 hover:rotate-3 hover:brightness-110 active:scale-95"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 0 28px 8px rgba(244,63,94,0.65)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        ⚡ All-in
      </button>
    </div>
  );
};
