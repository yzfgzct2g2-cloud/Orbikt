import { pointsToPolyline } from "../../charts/chartUtils";

export function Sparkline({
  points,
  color,
  label,
}: {
  points: number[];
  color: string;
  label: string;
}) {
  return (
    <svg
      className="h-10 w-full"
      viewBox="0 0 120 40"
      role="img"
      aria-label={label}
    >
      <polyline
        fill="none"
        points={pointsToPolyline(points, 120, 36)}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        transform="translate(0 2)"
      />
    </svg>
  );
}
