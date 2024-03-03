import { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Pressable } from "react-native";
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

export default function SymptomScreen() {
  const [diseaseListData, setDiseaseListData] = useState();
  const [symptomListData, setSymptomListData] = useState();
  const [value, setValue] = useState(null);
  const [selected1, setSelected1] = useState([]);
  const [selected2, setSelected2] = useState([]);
  useEffect(() => {
    // Fetch data from route.com/dropdowns
    fetchDropdownData();
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

  const onPressSubmit = async (disease, symptoms) => {
    const disease1 = getLabelsByValues(diseaseListData, disease);
    const symptom1 = getLabelsByValues(symptomListData, symptoms);
    const mergedArray = [...disease1, ...symptom1];
    try {
      console.log(mergedArray);
      const response = await fetch(
        "https://healthimage-ey3sdnf4ka-uk.a.run.app/points",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mergedArray), // Convert the filter criteria into a JSON string
        }
      );
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
});
