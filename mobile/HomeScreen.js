import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import MapView from "react-native-maps";
import { Callout } from "react-native-maps";
import { Marker } from "react-native-maps";
import Icon from "./circle.svg";
import Svg, { Path } from "react-native-svg";
import { ReactComponent as Logo } from "./circle.svg";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <MapView style={styles.map}>
        <Marker coordinate={{ latitude: -35, longitude: 147 }}>
          <Callout>
            <Text>hiho</Text>
          </Callout>
        </Marker>
      </MapView>
      {/* <Text style={styles.mapOverlay}>Home Screen</Text> */}
      <Pressable style={styles.mapOverlay2} onPress={() => YourComponent()}>
        <Image
          styler={styles.icon}
          source={require("./assets/filternew.png")}
          style={styles.icon}
        />
      </Pressable>
      <Pressable
        style={styles.mapOverlay}
        onPress={() => navigation.navigate("Symptom")}
      >
        <Image
          styler={styles.icon}
          source={require("./assets/plusnew.png")}
          style={styles.icon}
        />
      </Pressable>
    </View>
  );
}

const YourComponent = () => alert("filter");

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
  map: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 20,
    right: "5%",
    padding: 16,
    width: "50",
    textAlign: "center",
  },
  mapOverlay2: {
    position: "absolute",
    bottom: 100,
    right: "5%",
    padding: 16,
    width: "50",
    textAlign: "center",
  },
  icon: {
    height: 70,
    width: 70,
  },
});
