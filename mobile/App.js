import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Alert } from "react-native";
import MyStack from "./MyStack.js";
import HomeScreen from "./HomeScreen.js";
import SymptomScreen from "./SymptomScreen.js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
import { NavigationContainer } from "@react-navigation/native";
// import MapView from "react-native-maps";
// import { Callout } from "react-native-maps";
// import { Marker } from "react-native-maps";
// export default function App() {
//   return (
//     <View>
//       <MyStack />
//     </View>
//   );
// }
const Stack = createNativeStackNavigator();
// export default function App() {
//   return (
//     <NavigationContainer>
//       {/* <Stack.Navigator>
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="Symptom" component={SymptomScreen} />
//       </Stack.Navigator> */}
//       {/* <MapView style={styles.map}>
//         <Marker coordinate={{ latitude: -35, longitude: 147 }}>
//           <Callout>
//             <Text>hiho</Text>
//           </Callout>
//         </Marker>
//       </MapView> */}
//       <Text>Hiho</Text>
//     </NavigationContainer>
//   );
// }

export default function App() {
  return (
    <MenuProvider>
      <NavigationContainer>
        <Stack.Navigator
        // screenOptions={{
        //   headerShown: false, // Hide the default header
        //   tabBarStyle: {
        //     position: "absolute",
        //     bottom: 0,
        //     left: 0,
        //     right: 0,
        //   },
        // }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Symptom" component={SymptomScreen} />
        </Stack.Navigator>
        {/* <MapView style={styles.map}>
        <Marker coordinate={{ latitude: -35, longitude: 147 }}>
          <Callout>
            <Text>hiho</Text>
          </Callout>
        </Marker>
      </MapView> */}
        {/* <Text>Hiho</Text> */}
      </NavigationContainer>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    text: "white",
    justifyContent: "center",
  },
  text: {
    color: "black",
  },
});
