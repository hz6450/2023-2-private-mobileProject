import React, { useState } from "react";
import { View, TextInput, Button } from "react-native";
import { Layout, TopNav, Text, themeColor, useTheme } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, setDoc, collection } from "firebase/firestore";
import firebaseConfig from "../firebaseConfig"; // firebaseConfig.js 파일 가져오기
import { Calendar } from "react-native-calendars"; // react-native-calendars 추가

export default function ({ navigation }) {
  // Firebase 앱 초기화
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  // Firebase 앱 초기화
  const app = getApps()[0]; // 이미 초기화된 Firebase 앱 가져오기
  const db = getFirestore(app);
  const dataCollection = collection(db, "data"); // 'data' 컬렉션 참조

  const { isDarkmode, setTheme } = useTheme(); // isDarkmode와 setTheme 스테이트 추가

  const [selectedDate, setSelectedDate] = useState("");
  const [text, setText] = useState("");

  const saveData = async () => {
    if (selectedDate && text) {
      try {
        // 컬렉션 참조를 사용하여 문서 추가
        const dataRef = doc(dataCollection, selectedDate);
        await setDoc(dataRef, {
          value: text,
        });
        console.log("데이터가 성공적으로 저장되었습니다.");
      } catch (error) {
        console.error("데이터 저장 중 오류 발생:", error);
      }
    }
  };

  return (
    <Layout>
      <TopNav
        middleContent="Second Screen"
        leftContent={
          <Ionicons
            name="chevron-back"
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        leftAction={() => navigation.goBack()}
        rightContent={
          <Ionicons
            name={isDarkmode ? "sunny" : "moon"}
            size={20}
            color={isDarkmode ? themeColor.white100 : themeColor.dark}
          />
        }
        rightAction={() => {
          if (isDarkmode) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
        }}
      />

      {/* 캘린더 선택 (캘린더 컴포넌트를 추가하고 선택된 날짜를 setSelectedDate로 업데이트) */}
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
      />

      <TextInput
        value={text}
        onChangeText={(newText) => setText(newText)}
        placeholder="Enter text here"
      />

      <Button
        title="Save Data"
        onPress={saveData}
        disabled={!selectedDate || !text}
      />
    </Layout>
  );
}
