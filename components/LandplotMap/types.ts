export interface ViewportState {
  width: number;
  height: number;
  latitude: number;
  longitude: number;
  pitch: number;
  zoom: number;
  bearing: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}
