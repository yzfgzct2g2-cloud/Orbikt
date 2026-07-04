export function pointsToPolyline(points: number[], width: number, height: number) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const spread = Math.max(max - min, 1);

  return points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((point - min) / spread) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
