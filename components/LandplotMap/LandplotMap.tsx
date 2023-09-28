import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  View,
  StyleSheet,
  GestureResponderEvent,
  Pressable,
} from "react-native";
import { GeoJSON, Point } from "geojson";
import * as Location from "expo-location";
import Mapbox from "@rnmapbox/maps";
import { H3LandplotBridge } from "./h3-landplot-bridge";
import { ViewportState } from "./types";
import { mapConfig } from "./map-config";
import { filter, Subject, throttleTime } from "rxjs";
import { defaultLayer, selectionLayer } from "./map-layers";
import { Dimensions } from "react-native";
import { MapState } from "@rnmapbox/maps/lib/typescript/components/MapView";
import { Cell } from "./cell";
import h3 from "h3-js";
import { OnPressEvent } from "@rnmapbox/maps/src/types/OnPressEvent";

Mapbox.setWellKnownTileServer("Mapbox");
Mapbox.setAccessToken(
  "pk.eyJ1IjoiZGlsb3RlYy0yMDE1IiwiYSI6ImNsbG5mMmswODAwNTAzcW80OTV1ZWMyb3MifQ.nQnAOGgCq6oNy1J-XyVHgQ"
);

const viewState: ViewportState = {
  longitude: mapConfig.defaults.longitude,
  latitude: mapConfig.defaults.latitude,
  zoom: mapConfig.defaults.zoom,
  pitch: mapConfig.defaults.pitch,
  width: mapConfig.defaults.width,
  height: mapConfig.defaults.height,
  bearing: mapConfig.defaults.bearing,
};
export const styles = StyleSheet.create({
  container: {
    height: 700,
    width: 390,
  },
  map: {
    flex: 1,
  },
});

const defaultStyle = {
  version: 8,
  name: "Land",
  sources: {
    map: {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      minzoom: 1,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: {
        "background-color": "#f2efea",
      },
    },
    {
      id: "map",
      type: "raster",
      source: "map",
      paint: {
        "raster-fade-duration": 100,
      },
    },
  ],
};

const cellSynthTrigger = new Subject<void>();
const h3bridge = new H3LandplotBridge();
const interactiveLayerIds = [defaultLayer.id];
const LandplotMap = () => {
  const [selection, setSelection] = useState<Cell[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [overlayData, setOverlayData] = useState<GeoJSON | undefined>({
    type: "FeatureCollection",
    features: [],
  });

  // View update hooks
  const [viewChange, setViewChange] = useState(0);
  useEffect(() => {
    const sub = cellSynthTrigger
      .pipe(
        throttleTime(200),
        filter(() => viewState.zoom >= 12)
      )
      .subscribe(() => {
        setViewChange(Date.now);
      });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      viewState.width = Dimensions.get("window").width;
      viewState.height = Dimensions.get("window").height;

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    Alert.alert(
      "Your location Waldi: " +
        location?.coords?.longitude +
        " / " +
        location?.coords?.latitude
    );
  }, [location]);

  useEffect(() => {
    if (viewState.zoom < mapConfig.zoom.heatmapThreshold) {
      return;
    }
    const geoJSON = h3bridge.getOverlayGeoJson(viewState);
    setOverlayData(geoJSON);
  }, [viewChange]);

  const onTouchMove = (event: GestureResponderEvent) => {
    console.log(">>>>> touch move");
  };

  const onTouchStart = (event: GestureResponderEvent) => {
    // console.log(">>>>>>> touch start");
  };
  const onPress = (feature: GeoJSON.Feature) => {
    console.log("---------------------------");
    console.log("press");

    if (!feature) {
      return;
    }

    const point = feature.geometry as Point;
    const hexId = h3bridge.getCell(point.coordinates[1], point.coordinates[0]);
    const contained = selection.map((x: Cell) => x.id).includes(hexId);

    if (contained) {
      setSelection([]);
    } else {
      const [lat, lng] = h3.cellToLatLng(hexId);
      const cell: Cell = {
        id: hexId,
        latitude: lat,
        longitude: lng,
        occupied: false,
        assetId: "",
      };
      console.log("select");
      setSelection([cell]);
    }
  };

  const onPress2 = (event: OnPressEvent) => {
    console.log("---------------------------");
    console.log("press");

    const feature = event.features && event.features[0];
    if (!feature) {
      return;
    }
    const id: string = feature.properties?.id as string;
    const contained = selection.map((x: Cell) => x.id).includes(id);
    if (contained) {
      setSelection([]);
    } else {
      const [lat, lng] = h3.cellToLatLng(id);
      const cell: Cell = {
        id: id,
        latitude: lat,
        longitude: lng,
        occupied: false,
        assetId: "",
      };
      console.log("select");
      setSelection([cell]);
    }
  };

  const onPress3 = (event: any) => {
    console.log("--------------------------");
    console.log("pressable");
  };

  const onMapIdle = (state: MapState) => {
    viewState.zoom = state.properties.zoom;
    viewState.latitude = state.properties.center[1];
    viewState.longitude = state.properties.center[0];
    cellSynthTrigger.next();
  };

  const selectionFilter = useMemo(() => {
    const ids = (selection || []).map((x) => x.id);
    console.log("filter");
    return ["in", "id", ...ids];
  }, [selection]);

  return (
    <View style={styles.container}>
      {/*<Pressable style={styles.container} onPress={(event) => onPress3(event)}>*/}
      <Mapbox.MapView
        style={styles.map}
        styleJSON={JSON.stringify(defaultStyle)}
        // onPress={(feature: GeoJSON.Feature) => onPress(feature)}
        onMapIdle={(state: MapState) => onMapIdle(state)}
        // onTouchStart={(event: GestureResponderEvent) => onTouchStart(event)}
      >
        <Mapbox.ShapeSource
          onPress={(event: OnPressEvent) => onPress2(event)}
          id="sp_cell_data"
          shape={overlayData}
        >
          <Mapbox.FillLayer
            id={defaultLayer.id}
            style={defaultLayer.style}
            maxZoomLevel={defaultLayer.zoom.max}
            minZoomLevel={defaultLayer.zoom.min}
          />
          <Mapbox.FillLayer
            id={selectionLayer.id}
            style={selectionLayer.style}
            maxZoomLevel={selectionLayer.zoom.max}
            minZoomLevel={selectionLayer.zoom.min}
            filter={selectionFilter}
          />
        </Mapbox.ShapeSource>
        {location && (
          <>
            <Mapbox.Camera
              zoomLevel={15}
              centerCoordinate={[
                location.coords.longitude,
                location.coords.latitude,
              ]}
              animationMode="flyTo"
              animationDuration={2000}
            />
            <Mapbox.PointAnnotation
              id="userLocation"
              coordinate={[location.coords.longitude, location.coords.latitude]}
            >
              <Mapbox.Callout title="You are here!" />
            </Mapbox.PointAnnotation>
          </>
        )}
      </Mapbox.MapView>
      {/*</Pressable>*/}
    </View>
  );
};

export default LandplotMap;
