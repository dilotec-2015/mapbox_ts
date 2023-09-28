import React from "react";
import { StyleSheet, View } from "react-native";
import LandplotMap from "./components/LandplotMap/LandplotMap";

export default function App() {
  return (
    <View style={styles.page}>
      <LandplotMap />
    </View>
  );
}

export const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
