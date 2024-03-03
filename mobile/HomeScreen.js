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
  Modal,
  TextInput,
  Button,
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
  const [pin, setPin] = useState('');
  const [selectedPointIdForDeletion, setSelectedPointIdForDeletion] = useState(null);  

  
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
      const pointsArray = json.points.map((point) => ({
        ...point,
      }));
      setPoints(pointsArray);
      //console.log(pointsArray);
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
      //console.log(JSON.stringify(filterCriteria));
  
      const json = await response.json();
      const pointsArray = json.points.map((point) => ({
        ...point,
      }));
  
      setPoints(pointsArray);
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to fetch filtered points data');
    }
  };

  const deletePoint = async (pointId, pin) => {
    const url = `https://healthimage-ey3sdnf4ka-uk.a.run.app/points/delete/${pointId}/${pin}`;
    // Implement your API call here using fetch or another HTTP client.
    // For example, using fetch:
    try {
      const response = await fetch(url, { method: 'DELETE' });
      console.log(response.ok)
      console.log(response)
      if (response.ok) {
        fetchData();
        Alert.alert('Point deleted successfully');
      } else {
        // Handle errors, e.g., incorrect pin
        Alert.alert('Error deleting point');
      }
    } catch (error) {
      console.error('Failed to delete point:', error);
      Alert.alert('Error deleting point');
    }
    setPin('');
    setSelectedPointIdForDeletion(null);
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
            key={point.pointId}
            coordinate={{
              latitude: point.latitude,
              longitude: point.longitude,
            }}
          >
            <Callout tooltip={true} onPress={() => { 
              setSelectedPointIdForDeletion(point.pointId);
              }}>
              <View style={styles.customView}>
                <Text>Date Posted: {point.date}</Text>
                <Text style={styles.calloutText}>Symptoms: {point.symptoms.join(', ')}</Text>
                <Text style={styles.calloutText}>Diseases: {point.diseases.join(', ')}</Text>
                <Pressable 
                  onPress={() => {
                    setSelectedPointId(point.id);
                    toggleDeleteModal();
                  }}
                  style={styles.pressableStyle}
                >
                  <Text style={styles.pressableText}>Delete</Text>
                </Pressable>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedPointIdForDeletion !== null}
        onRequestClose={() => setSelectedPointIdForDeletion(null)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>pin</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPin}
              value={pin}
              placeholder="Enter Pin"
              keyboardType="default"
            />
            <Button
              title="Delete"
              onPress={() => {
                console.log(selectedPointIdForDeletion);
                deletePoint(selectedPointIdForDeletion, pin);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  customView: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 6,
    borderColor: 'grey',
    borderWidth: 0.5,
  },
  pressableStyle: {
    marginTop: 10,
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  pressableText: {
    color: 'white',
    textAlign: 'center',
  },
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
  buttonOpen: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10, // Adjust based on your layout
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 40,
    width: "100%", // Adjust if necessary
    marginBottom: 20,
    borderWidth: 1,
    padding: 10,
    color: "black",
    borderColor: 'black', // Adjust color as needed
    borderRadius: 5,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  textStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
  pressableStyle: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  pressableText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
