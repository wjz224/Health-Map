import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Pressable, Alert } from "react-native";
// import MapView from "react-native-maps";
// import { Callout } from "react-native-maps";
// import { Marker } from "react-native-maps";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Home Screen</Text>
      <MapView style={styles.map}>
        <Marker coordinate={{ latitude: -35, longitude: 147 }}>
          <Callout>
            <Text>hiho</Text>
          </Callout>
        </Marker>
      </MapView>
      <Pressable onPress={() => navigation.navigate("Symptom")}>
        <Text>Press here</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    text: "white",
    justifyContent: "center",
  },
  text: {
    color: "white",
  },
});
