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
import React, { useState, useEffect } from 'react';
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [points, setPoints] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
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
          provider= {PROVIDER_GOOGLE}
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
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
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
