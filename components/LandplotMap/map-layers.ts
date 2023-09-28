import { mapConfig } from "./map-config";

class Color {
  constructor(public r: number, public g: number, public b: number) {}

  public withAlpha(alpha: number) {
    return `rgba(${this.r},${this.g},${this.b},${alpha})`;
  }

  public toString() {
    return `rgb(${this.r},${this.g},${this.b})`;
  }
}

const base = {
  free: new Color(106, 106, 106),
  cart: new Color(195, 251, 224),
  select: new Color(61, 255, 243),
  occupied: new Color(232, 60, 132),
  owned: new Color(135, 255, 183),
  forSale: new Color(255, 219, 36),
};

export const colors = {
  freeOutline: base.free.withAlpha(0.8),
  freeFill: base.free.withAlpha(0.1),
  cartOutline: base.cart.toString(),
  cartFill: base.cart.withAlpha(0.3),
  selectOutline: base.select.toString(),
  selectFill: base.select.withAlpha(0.2),
  occupiedOutline: base.occupied.toString(),
  occupiedFill: base.occupied.withAlpha(0.2),
  ownedOutline: base.owned.toString(),
  ownedFill: base.owned.withAlpha(0.5),
  forSaleOutline: base.forSale.toString(),
  forSaleFill: base.forSale.withAlpha(0.2),
};

// FILL LAYER
export const defaultLayer = {
  id: "sp_landplot_default",
  style: {
    fillAntialias: true,
    fillColor: colors.freeFill,
    fillOutlineColor: colors.freeOutline,
  },
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
};
export const hoverLayer = {
  id: "sp_landplot_hover",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: "white",
    fillOpacity: [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.1,
      0,
    ],
  },
};
export const occupiedLayer = {
  id: "sp_landplot_occupied",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: colors.occupiedFill,
    fillOutlineColor: colors.occupiedOutline,
  },
};
export const ownedLayer = {
  id: "sp_landplot_owned",
  type: "fill",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: colors.ownedFill,
    fillOutlineColor: colors.ownedOutline,
  },
};
export const forSaleLayer = {
  id: "sp_landplot_for_sale",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: colors.forSaleFill,
    fillOutlineColor: colors.forSaleOutline,
  },
};
export const selectionLayer = {
  id: "sp_landplot_selection",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: colors.selectFill,
    fillOutlineColor: colors.selectOutline,
  },
};
export const cartLayer = {
  id: "sp_landplot_cart",
  zoom: {
    max: mapConfig.zoom.max + 1,
    min: mapConfig.zoom.heatmapThreshold,
  },
  style: {
    fillAntialias: true,
    fillColor: colors.cartFill,
    fillOutlineColor: colors.cartOutline,
  },
};

// HEATMAP LAYER
export const selectionHeatmapLayer = {
  id: "sp_landplot_selection_heatmap",
  type: "heatmap",
  minzoom: mapConfig.zoom.min - 1,
  maxzoom: mapConfig.zoom.heatmapThreshold,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      base.select.withAlpha(0),
      0.2,
      base.select.withAlpha(0.2),
      0.4,
      base.select.withAlpha(0.3),
      0.6,
      base.select.withAlpha(0.4),
      0.8,
      base.select.withAlpha(0.5),
      1,
      base.select.withAlpha(0.6),
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": {
      stops: [
        [5, 10],
        [12, 20],
      ],
    },
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": {
      stops: [
        [5, 10],
        [15, 1],
      ],
    },
  },
};
export const cartHeatmapLayer = {
  id: "sp_landplot_cart_heatmap",
  type: "heatmap",
  minzoom: mapConfig.zoom.min - 1,
  maxzoom: mapConfig.zoom.heatmapThreshold,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      base.cart.withAlpha(0),
      0.2,
      base.cart.withAlpha(0.2),
      0.4,
      base.cart.withAlpha(0.3),
      0.6,
      base.cart.withAlpha(0.4),
      0.8,
      base.cart.withAlpha(0.5),
      1,
      base.cart.withAlpha(0.6),
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": {
      stops: [
        [5, 10],
        [12, 20],
      ],
    },
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": {
      stops: [
        [5, 10],
        [15, 1],
      ],
    },
  },
};
export const occupiedHeatmapLayer = {
  id: "sp_landplot_occupied_heatmap",
  type: "heatmap",
  filter: ["!", ["has", "jpegStore"]],
  minzoom: mapConfig.zoom.min,
  maxzoom: mapConfig.zoom.heatmapThreshold,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      base.occupied.withAlpha(0),
      0.2,
      base.occupied.withAlpha(0.2),
      0.4,
      base.occupied.withAlpha(0.3),
      0.6,
      base.occupied.withAlpha(0.4),
      0.8,
      base.occupied.withAlpha(0.5),
      1,
      base.occupied.withAlpha(0.6),
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": {
      stops: [
        [5, 10],
        [12, 20],
      ],
    },
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": {
      stops: [
        [5, 10],
        [15, 1],
      ],
    },
  },
};
export const forSaleHeatmapLayer = {
  id: "sp_landplot_for_sale_heatmap",
  type: "heatmap",
  minzoom: mapConfig.zoom.min,
  filter: ["has", "jpegStore"],
  maxzoom: mapConfig.zoom.heatmapThreshold,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      base.forSale.withAlpha(0),
      0.2,
      base.forSale.withAlpha(0.2),
      0.4,
      base.forSale.withAlpha(0.3),
      0.6,
      base.forSale.withAlpha(0.4),
      0.8,
      base.forSale.withAlpha(0.5),
      1,
      base.forSale.withAlpha(0.6),
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": {
      stops: [
        [5, 10],
        [9, 20],
      ],
    },
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": {
      stops: [
        [5, 10],
        [15, 1],
      ],
    },
  },
};
export const ownedLayerHeatmapLayer = {
  id: "sp_landplot_owned_heatmap",
  type: "heatmap",
  minzoom: mapConfig.zoom.min,
  maxzoom: mapConfig.zoom.heatmapThreshold,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      base.owned.withAlpha(0),
      0.2,
      base.owned.withAlpha(0.2),
      0.4,
      base.owned.withAlpha(0.3),
      0.6,
      base.owned.withAlpha(0.4),
      0.8,
      base.owned.withAlpha(0.5),
      1,
      base.owned.withAlpha(0.6),
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": {
      stops: [
        [5, 10],
        [9, 20],
      ],
    },
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": {
      stops: [
        [5, 10],
        [15, 1],
      ],
    },
  },
};
