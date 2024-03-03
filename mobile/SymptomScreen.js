import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  Pressable,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

const data = [
  { label: "Item 1", value: "1" },
  { label: "Item 2", value: "2" },
  { label: "Item 3", value: "3" },
  { label: "Item 4", value: "4" },
  { label: "Item 5", value: "5" },
  { label: "Item 6", value: "6" },
  { label: "Item 7", value: "7" },
  { label: "Item 8", value: "8" },
];

function transformToOptions(array) {
  return array.map((item, index) => ({
    label: item,
    value: (index + 1).toString(),
  }));
}

function getLabelsByValues(array, values) {
  return values
    .map((value) => {
      const item = array.find((item) => item.value === value);
      return item ? item.label : null;
    })
    .filter((label) => label !== null);
}

export default function SymptomScreen(props) {
  const [diseaseListData, setDiseaseListData] = useState();
  const [symptomListData, setSymptomListData] = useState();
  const [value, setValue] = useState(null);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  const [pin, setPin] = useState();
  const [location, setLocation] = useState();
  useEffect(() => {
    // Fetch data from route.com/dropdowns
    fetchDropdownData();
    fetchLocation();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/dropdown"
      );
      const data = await response.json();
      const optDisease = await transformToOptions(data.diseaseList);
      setDiseaseListData(optDisease);
      const optSymptom = await transformToOptions(data.symptomList);
      setSymptomListData(optSymptom);
    } catch (e) {
      console.error(e);
      setErrorMsg("ERROR: Failed to fetch dropdown data.");
    }
  };

  const fetchLocation = async () => {
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const onPressSubmit = async (disease, symptoms) => {
    const disease1 = getLabelsByValues(diseaseListData, disease);
    const symptom1 = getLabelsByValues(symptomListData, symptoms);

    try {
      console.log(disease1);
      console.log(symptom1);
      console.log(location.coords.longitude);
      console.log(pin);
      console.log(location.coords.latitude);
      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/points",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: symptom1,
            diseases: disease1,
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
            pin: pin,
          }), // Convert the filter criteria into a JSON string
        }
      );
      if (response.ok) {
        alert("You have submitted your response");
        props.navigation.goBack();
      } else {
        alert("Submission failed. Please try again later.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("ERROR: Failed to submit data.");
    }
  };

  return (
    <View style={styles.container}>
      {symptomListData ? (
        <MultiSelect
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          search
          data={symptomListData}
          labelField="label"
          valueField="value"
          placeholder="Select your symptom(s)"
          searchPlaceholder="Search..."
          value={selected1}
          onChange={(item) => {
            setSelected1(item);
          }}
          selectedStyle={styles.selectedStyle}
        />
      ) : (
        <Text>Loading...</Text>
      )}
      {diseaseListData ? (
        <MultiSelect
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          search
          data={diseaseListData}
          labelField="label"
          valueField="value"
          placeholder="Select your disease(s)"
          searchPlaceholder="Search..."
          value={selected2}
          onChange={(item) => {
            setSelected2(item);
          }}
          selectedStyle={styles.selectedStyle}
        />
      ) : (
        <Text>Loading...</Text>
      )}
      <TextInput
        style={styles.input}
        onChangeText={setPin}
        value={pin}
        placeholder="Create a Pin"
        keyboardType="default"
      />
      <Pressable onPress={() => onPressSubmit(selected1, selected2)}>
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 16 },
  dropdown: {
    height: 50,
    backgroundColor: "transparent",
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  selectedStyle: {
    borderRadius: 12,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
