'use client';

interface Props {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label: string;
  unit?: string;
  className?: string;
}

export default function ProgressRing({
  value, max, size = 72, stroke = 6,
  color = '#8b5cf6', trackColor = 'rgba(0,0,0,0.06)',
  label, unit = '', className = '',
}: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / (max || 1), 1);
  const offset = circ * (1 - pct);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.7s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold leading-none text-gray-900">
            {value}{unit && <span className="text-[10px] font-normal text-gray-500">{unit}</span>}
          </span>
          <span className="text-[9px] text-gray-400">/{max}{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
}
