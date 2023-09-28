import * as h3 from "h3-js";
import { Feature, type FeatureCollection } from "geojson";
import { BoundingBox, ViewportState } from "./types";
import WebMercatorViewport from "@math.gl/web-mercator";

export const H3_CELL_RESOLUTION = 9;

export class H3LandplotBridge {
  private readonly internalState = {
    longitude: 0,
    latitude: 0,
    pitch: 0,
    bearing: 0,
    altitude: 0,
    width: 0,
    height: 0,
    zoom: 0,
  };

  public getCell(
    latitude: number,
    longitude: number,
    resolution: number = H3_CELL_RESOLUTION
  ) {
    return h3.latLngToCell(latitude, longitude, resolution);
  }
  public getCellsForBoundingBox(
    boundingBox: BoundingBox,
    resolution = H3_CELL_RESOLUTION
  ) {
    const nw = [boundingBox.north, boundingBox.west];
    const ne = [boundingBox.north, boundingBox.east];
    const sw = [boundingBox.south, boundingBox.west];
    const se = [boundingBox.south, boundingBox.east];

    try {
      return h3.polygonToCells([nw, ne, se, sw], resolution);
    } catch (e: any) {
      console.log("error", e.message);
    }

    return [];
  }

  public h3ToFeature = (h3Index: string, properties = {}): Feature => {
    const coordinates = [h3.cellToBoundary(h3Index, true)];
    return {
      type: "Feature",
      id: h3Index,
      properties,
      geometry: {
        type: "Polygon",
        coordinates,
      },
    };
  };
  public h3SetToFeatureCollection(
    hexagons: string[],
    getProperties: Function
  ): FeatureCollection {
    const features: Feature[] = [];
    for (let i = 0; i < hexagons.length; i++) {
      const h3Index = hexagons[i];
      const properties = getProperties ? getProperties(h3Index) : {};
      features.push(this.h3ToFeature(h3Index, properties));
    }
    return {
      type: "FeatureCollection",
      features,
    };
  }

  public getOverlayGeoJson(state: ViewportState): FeatureCollection {
    const boundingBox = this.generateBoundingBox(state);
    const h3Indices = this.getCellsForBoundingBox(boundingBox);

    return this.h3SetToFeatureCollection(h3Indices, (x: string) => {
      return {
        id: x,
      };
    });
  }

  private generateBoundingBox(state: ViewportState): BoundingBox {
    this.syncState(state);

    const { height, width } = this.internalState;

    const projection = new WebMercatorViewport(this.internalState);
    const [west, north] = projection.unproject([0, 0]);
    const [east, south] = projection.unproject([width, height]);

    if (!west || !north || !east || !south) {
      throw new Error("Invalid projection");
    }

    return { north, south, east, west };
  }

  private syncState(state: ViewportState) {
    this.internalState.longitude = state.longitude;
    this.internalState.latitude = state.latitude;
    this.internalState.pitch = 0;
    this.internalState.bearing = state.bearing;
    this.internalState.altitude = 0.15;
    this.internalState.height = state.height * 1.4;
    this.internalState.width = state.width * 1.3;
    this.internalState.zoom = state.zoom;
  }
}
