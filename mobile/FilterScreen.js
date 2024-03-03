import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert } from "react-native";

export default function FilterScreen({ route, navigation }) {
  const { filterOptions, setFilterOptions } = route.params;
  const [selectedOptions, setSelectedOptions] = useState(filterOptions);

  console.log(filterOptions);
}
