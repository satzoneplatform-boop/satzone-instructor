type Props = {
  pct: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  label?: string;
};

export function CircularProgress({
  pct,
  size = 56,
  strokeWidth = 4,
  trackColor = "#e0e1ff",
  progressColor = "#615fff",
  label,
}: Props) {
  const clamped = Math.min(100, Math.max(0, pct));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center gap-1"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.25s ease" }}
        />
      </svg>

      {/* Centre label */}
      <span
        className="relative z-10 font-bold leading-none text-primary"
        style={{ fontSize: Math.max(9, Math.round(size * 0.22)) }}
      >
        {clamped}%
      </span>

      {label && (
        <span className="mt-1 text-[11px] text-slate-500">{label}</span>
      )}
    </div>
  );
}
