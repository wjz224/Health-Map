import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://healthimage-ey3sdnf4ka-uk.a.run.app/points');
      const json = await response.json();
      const pointsArray = json.points.map((point, index) => ({
        ...point,
        id: index, 
      }));
      setPoints(pointsArray);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch points data');
    }
  };

  const fetchFilteredData = async (symptoms, diseases) => {
    try {
      const filterCriteria = {
        symptoms, 
        diseases, 
      };
  
      const response = await fetch('https://healthimage-ey3sdnf4ka-uk.a.run.app/points/filter', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterCriteria), // Convert the filter criteria into a JSON string
      });
      console.log(JSON.stringify(filterCriteria));
  
      const json = await response.json();
      console.log(json);
      const pointsArray = json.points.map((point, index) => ({
        ...point,
        id: index, // Assign an ID for key usage in Marker (if needed)
      }));
  
      setPoints(pointsArray);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch filtered points data');
    }
  };
  

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0496,
            longitudeDelta: 0.0211,
          }}
        >
          {points.map((point) => (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
            >
              <Callout>
                <View>
                  <Text>Date Posted: {point.date}</Text>
                  <Text style={styles.calloutText}>Symptoms: {point.symptoms.join(', ')}</Text>
                  <Text style={styles.calloutText}>Diseases: {point.diseases.join(', ')}</Text>
                </View>
              </Callout>
            </Marker>
          ))}



        </MapView>
      ) : errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        <Text>Fetching location and data...</Text>
      )}
      <StatusBar style="auto" />
      {/* <Text style={styles.mapOverlay}>Home Screen</Text> */}
      {/* <Pressable style={styles.mapOverlay2} onPress={() => YourComponent()}>
        <Image
          styler={styles.icon}
          source={require("./assets/filternew.png")}
          style={styles.icon}
        />
      </Pressable> */}
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

      <Menu
        style={styles.mapOverlay2}
        opened={isMenuOpen}
        onBackdropPress={toggleMenu}
      >
        <MenuTrigger>
          <Pressable onPress={toggleMenu}>
            <Image
              // styler={styles.icon}
              source={require("./assets/filternew.png")}
              style={styles.icon}
            />
          </Pressable>
        </MenuTrigger>
        <MenuOptions customStyles={styles.menuOptions}>
          <ScrollView style={{ maxHeight: 200 }}>
            <MenuOption onSelect={() => alert(`Save`)} text="Save" />
            <MenuOption onSelect={() => alert(`Delete`)} text="Delete" />
            {/* <ScrollView style={{ height: 200 }}>
              {data.map((item) => (
                <MenuOption
                  key={item.key}
                  customStyles={{
                    optionWrapper: {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  }}
                >
                  <Text>{item.name}</Text>
                  <Text>{item.icon}</Text>
                </MenuOption>
              ))}
            </ScrollView> */}
          </ScrollView>
        </MenuOptions>
      </Menu>
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
  mainScreen: {
    top: 100,
    right: 100,
    backgroundColor: "white",
  },
  mainScreen2: {
    top: 120,
    right: 120,
  },
  menuOptions: {
    position: "relative",
    top: -40,
    backgroundColor: "white",
    width: 150,
  },
  container2: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    flexDirection: "column",
  },
});
