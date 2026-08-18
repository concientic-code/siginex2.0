"use client";

interface RadarPoint {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarPoint[];
  size?: number;
}

export default function RadarChart({ data, size = 240 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const pointCoords = data.map((d, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const r = (d.value / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });

  const polygon = pointCoords.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} className="block mx-auto">
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <circle
          key={level}
          cx={cx}
          cy={cy}
          r={maxR * level}
          fill="none"
          stroke="#E1E7F0"
          strokeWidth="0.5"
        />
      ))}

      {/* Axes */}
      {data.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x2 = cx + maxR * Math.cos(angle);
        const y2 = cy + maxR * Math.sin(angle);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="#E1E7F0" strokeWidth="0.5" />;
      })}

      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(192,138,46,0.15)" stroke="#C08A2E" strokeWidth="1.5" />

      {/* Data points */}
      {pointCoords.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C08A2E" />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelR = maxR + 18;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[9px] fill-[#64748B]"
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
