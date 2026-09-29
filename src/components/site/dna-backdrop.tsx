import { motion } from "framer-motion";

export function DnaBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg
        viewBox="0 0 800 800"
        className="absolute -right-32 top-1/2 h-[140%] w-auto -translate-y-1/2 opacity-30"
      >
        <defs>
          <linearGradient id="dna-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.13 200)" />
            <stop offset="100%" stopColor="oklch(0.4 0.09 200)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }).map((_, i) => {
          const y = 40 + i * 30;
          const x1 = 400 + Math.sin(i * 0.5) * 140;
          const x2 = 400 - Math.sin(i * 0.5) * 140;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="url(#dna-grad)" strokeWidth="2" opacity="0.6" />
              <circle cx={x1} cy={y} r="4" fill="url(#dna-grad)" />
              <circle cx={x2} cy={y} r="4" fill="oklch(0.86 0.005 230)" />
            </g>
          );
        })}
      </svg>
      <motion.div
        className="absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.5 0.11 200 / 0.35) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 bottom-0 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.13 200 / 0.3) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
