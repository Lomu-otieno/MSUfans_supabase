import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import SignupScreen from "./screens/Signup";
import LoginScreen from "./screens/Login";
import ForgotPassScreen from "./screens/ForgotPassScreen";
import Home from "./screens/Home";
import Match from "./screens/Match";
import Chat from "./screens/Chat";
import Profile from "./screens/Profile";
import UpdateProfile from "./screens/UpdateProfile";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Bottom Tabs Navigator
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home-outline";
          if (route.name === "Match") iconName = "heart-outline";
          if (route.name === "Chat") iconName = "chatbubble-outline";
          if (route.name === "Profile") iconName = "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: false, // Hide top header
      })}
    >
      <Tab.Screen name="Home" component={Profile} />
      <Tab.Screen name="Match" component={Match} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// ✅ Main Stack Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassScreen" component={ForgotPassScreen} />
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
