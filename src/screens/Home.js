import React from "react";
import { View, Linking } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import {
  Layout,
  Button,
  Text,
  TopNav,
  Section,
  SectionContent,
} from "react-native-rapi-ui";


export default function ({ navigation }) {
  const auth = getAuth();
  return (
    <Layout>
      <TopNav
        middleContent="Home"
        rightAction={() => {
          if (isDarkmode) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
        }}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Section style={{ marginTop: 20 }}>
          <SectionContent>
            <Text fontWeight="bold" style={{ textAlign: "center" }}>
              나만의 일정관리 앱
            </Text>
          
            <Button
              text="캘린더 작성하기"
              onPress={() => {
                navigation.navigate("calander");
              }}
              style={{
                marginTop: 10,
              }}
            />
              <Button
              text="일정 관리하기"
              onPress={() => {
                navigation.navigate("openAiScreen");
              }}
              style={{
                marginTop: 10,
              }}
            />
            <Button
              status="danger"
              text="Logout"
              onPress={() => {
                signOut(auth);
              }}
              style={{
                marginTop: 10,
              }}
            />
          </SectionContent>
        </Section>
      </View>
    </Layout>
  );
}
