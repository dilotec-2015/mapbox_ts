export interface Cell {
  id: string;
  longitude: number;
  latitude: number;
  place?: string;
  occupied?: boolean;
  owner?: string;
  assetId: string;
  jpegStore?: {
    assetId: string;
    price: number;
    listingId: string;
  };
  // details?: LandplotCardProps;
  // prices?: Price[];
}
