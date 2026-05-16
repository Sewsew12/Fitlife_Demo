'use client';

interface Props {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  unit?: string;
}

export default function ProgressRing({
  value,
  max,
  size = 96,
  stroke = 8,
  color = '#4f46e5',
  label,
  unit = '',
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / (max || 1), 1);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e0e7ff" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900 leading-none">
            {value}
            {unit && <span className="text-xs font-normal text-gray-500 ml-0.5">{unit}</span>}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5">/ {max}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}
