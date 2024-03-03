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
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState, useEffect } from "react";
import MapView, { PROVIDER_GOOGLE, Callout, Marker } from "react-native-maps";
import * as Location from "expo-location";
import SectionedMultiSelect from "react-native-sectioned-multi-select";

export default function HomeScreen(props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [diseaseListData, setDiseaseListData] = useState();
  const [symptomListData, setSymptomListData] = useState();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [points, setPoints] = useState([]);
  const [diseaseSymptom, setdiseaseSymptom] = useState();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [nestedList, setNestedList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [selectedPointIdForDeletion, setSelectedPointIdForDeletion] =
    useState(null);
  const [pin, setPin] = useState("");

  const dictionary = {
    1: "COVID-19",
    2: "Flu",
    3: "Cold",
    5: "cough",
    6: "fever",
    7: "sore throat",
    8: "runny nose",
  };

  function splitArray(inputArray) {
    const threshold = 4;
    const arr1 = [];
    const arr2 = [];

    inputArray.forEach((value) => {
      if (value < threshold) {
        arr1.push(value);
      } else {
        arr2.push(value);
      }
    });

    return [arr1, arr2];
  }

  function getStringValuesFromArray(array) {
    return array.map((value) => dictionary[value]);
  }

  const handleFilterPress = () => {
    props.navigation.navigate("Filter", { test });
  };

  const toggleOption = (option) => {
    const index = selectedOptions.indexOf(option);
    if (index === -1) {
      setSelectedOptions([...selectedOptions, option]);
    } else {
      setSelectedOptions(selectedOptions.filter((item) => item !== option));
    }
  };

  const createNestedList = (listDisease, listSymptom) => {
    const nestedList = [
      {
        name: "disease",
        id: 0,
        children: listDisease.map((item, index) => ({
          name: item,
          id: index + 1,
        })),
      },
      {
        name: "symptoms",
        id: listDisease.length + 1,
        children: listSymptom.map((item, index) => ({
          name: item,
          id: index + listDisease.length + 2,
        })),
      },
    ];
    console.log("In list");
    console.log(nestedList);

    return nestedList;
  };

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
    fetchFilterOptions();
    console.log(nestedList);
    fetchData();
  }, []);

  const getNameFromId = (id, listDisease, listSymptom) => {
    if (id >= 1 && id <= listDisease.length) {
      return listDisease[id - 1];
    } else if (
      id >= listDisease.length + 2 &&
      id <= listDisease.length + listSymptom.length + 1
    ) {
      return listSymptom[id - listDisease.length - 2];
    } else {
      return null; // ID is invalid
    }
  };

  // For getting the disease and symptoms to show on the filter pop up
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/dropdown"
      );
      const data = await response.json();
      setDiseaseListData(data.diseaseList);
      setSymptomListData(data.symptomList);
      const nested = createNestedList(data.diseaseList, data.symptomList);
      setNestedList(nested);
      console.log(nestedList);
      console.log(nested.children);
    } catch (e) {
      console.error(e);
      setErrorMsg("ERROR: Failed to fetch dropdown data.");
    }
  };

  // For rendering ALL the points onto the map
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/points"
      );
      const json = await response.json();
      const pointsArray = json.points.map((point) => ({
        ...point,
      }));
      setPoints(pointsArray);
      console.log("Points shown here");
      console.log(points);
      //console.log(pointsArray);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch points data");
    }
  };

  // For rendering ONLY the filtered disease/symptoms from filter
  const fetchFilteredData = async (symptoms, diseases) => {
    try {
      const filterCriteria = {
        symptoms,
        diseases,
      };
      console.log(filterCriteria);

      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/points/filter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filterCriteria), // Convert the filter criteria into a JSON string
        }
      );
      //console.log(JSON.stringify(filterCriteria));

      const json = await response.json();
      const pointsArray = json.points.map((point) => ({
        ...point,
      }));

      setPoints(pointsArray);
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to fetch filtered points data");
    }
  };
  const deletePoint = async (pointId, pin) => {
    const url = `https://healthimage-ey3sdnf4ka-uk.a.run.app/points/delete/${pointId}/${pin}`;
    // Implement your API call here using fetch or another HTTP client.
    // For example, using fetch:
    try {
      const response = await fetch(url, { method: "DELETE" });
      console.log(response.ok);
      console.log(response);
      if (response.ok) {
        fetchData();
        Alert.alert("Point deleted successfully");
      } else {
        // Handle errors, e.g., incorrect pin
        Alert.alert("Error deleting point");
      }
    } catch (error) {
      console.error("Failed to delete point:", error);
      Alert.alert("Error deleting point");
    }
    setPin("");
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
              <Callout
                tooltip={true}
                onPress={() => {
                  setSelectedPointIdForDeletion(point.pointId);
                }}
              >
                <View style={styles.customView}>
                  <Text>Date Posted: {point.date}</Text>
                  <Text style={styles.calloutText}>
                    Symptoms: {point.symptoms.join(", ")}
                  </Text>
                  <Text style={styles.calloutText}>
                    Diseases: {point.diseases.join(", ")}
                  </Text>
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
      <Pressable style={styles.mapOverlay3} onPress={() => fetchData()}>
        <Image
          styler={styles.icon}
          source={require("./assets/refresh.png")}
          style={styles.icon}
        />
      </Pressable>
      <Pressable
        style={styles.mapOverlay2}
        onPress={() => props.navigation.navigate("Symptom")}
      >
        <Image
          styler={styles.icon}
          source={require("./assets/plusnew.png")}
          style={styles.icon}
        />
      </Pressable>

      {/* Third idea */}
      <View style={styles.mapOverlay}>
        {nestedList ? (
          <SectionedMultiSelect
            // styles={styles.mapOverlay}
            items={nestedList}
            IconRenderer={Icon}
            uniqueKey="id"
            subKey="children"
            selectText="Choose some things..."
            showDropDowns={true}
            showChips={false}
            showRemoveAll={true}
            readOnlyHeadings={true}
            onSelectedItemsChange={(item) => setSelected(item)}
            selectedItems={selected}
            onConfirm={() => {
              console.log(selected);
              const [diseaseRes, symptomRes] = splitArray(selected);
              const result1 = getStringValuesFromArray(diseaseRes);
              const result2 = getStringValuesFromArray(symptomRes);
              // const filteredData = getNameFromId(selected);
              console.log(result1);
              console.log(result2);
              fetchFilteredData(result2, result1);
            }}
          />
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedPointIdForDeletion !== null}
        onRequestClose={() => setSelectedPointIdForDeletion(null)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Pin</Text>
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
  icon: {
    height: 70,
    width: 70,
  },
  container2: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    flexDirection: "column",
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
      height: 2,
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
    borderColor: "black", // Adjust color as needed
    borderRadius: 5,
  },
  customView: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 6,
    borderColor: "grey",
    borderWidth: 0.5,
  },
  // pressableStyle: {
  //   marginTop: 10,
  //   backgroundColor: "#ff4444",
  //   padding: 10,
  //   borderRadius: 5,
  // },
  pressableText: {
    color: "white",
    textAlign: "center",
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
    bottom: 35,
    right: "8%",
    padding: 16,
    width: "50",
    textAlign: "center",
    backgroundColor: "white",
  },
  mapOverlay2: {
    position: "absolute",
    bottom: 130,
    right: "5%",
    padding: 16,
    width: "50",
    textAlign: "center",
  },
  mapOverlay3: {
    position: "absolute",
    bottom: 210,
    right: "5%",
    padding: 16,
    width: "50",
    textAlign: "center",
    maxHeight: 100,
    maxWidth: 100,
  },
  icon: {
    height: 70,
    width: 70,
  },
  pressableStyle: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  // pressableText: {
  //   color: "white",
  //   fontWeight: "bold",
  //   textAlign: "center",
  // },
  box: {
    height: 10,
  },
});
