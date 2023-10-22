import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer"; // Import createDrawerNavigator
import { AuthContext } from "../provider/AuthProvider";

// Main
import Home from "../screens/Home";
import calander from "../screens/calander";
import openAiScreen from "../screens/openAiScreen"

// Auth screens
import Login from "../screens/auth/Login";
import Register from "../screens/auth/Register";
import ForgetPassword from "../screens/auth/ForgetPassword";

import Loading from "../screens/utils/Loading";


const AuthStack = createNativeStackNavigator();

const Auth = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
    </AuthStack.Navigator>
  );
};

const MainStack = createNativeStackNavigator();

const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen name="Home" component={Home} />
      <MainStack.Screen name="calander" component={calander} />
      <MainStack.Screen name="openAiScreen" component={openAiScreen} />
    </MainStack.Navigator>
  );
};

const Drawer = createDrawerNavigator(); // Create a Drawer Navigator

export default () => {
  const auth = useContext(AuthContext);
  const user = auth.user;

  return (
    <NavigationContainer>
      {user == null && <Loading />}
      {user == false && <Auth />}
      {user == true && (
        <Drawer.Navigator initialRouteName="Home"> 
          <Drawer.Screen name="Home" component={Main} />
          <Drawer.Screen name="calander" component={calander} />
          <Drawer.Screen name="openAiScreen" component={openAiScreen} />
        </Drawer.Navigator>
      )}
    </NavigationContainer>
  );
};
