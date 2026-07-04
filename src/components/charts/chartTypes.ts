// Presentation-only chart types (decoupled from any mock data source).

export interface DonutSlice {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  points: ChartPoint[];
}
