import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Picker } from "react-native";
import { Layout, TopNav, Text, themeColor, useTheme } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../firebaseConfig";
import { Calendar } from "react-native-calendars";

export default function ({ navigation }) {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }

  const app = getApps()[0];
  const db = getFirestore(app);

  const { isDarkmode, setTheme } = useTheme();

  const [selectedDate, setSelectedDate] = useState("");
  const [text, setText] = useState("");
  const [selectedTime, setSelectedTime] = useState("00:00");

  const [userUID, setUserUID] = useState("");
  const [userData, setUserData] = useState([]);

  // Firebase Authentication에서 사용자 UID 가져오기
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserUID(user.uid);
    }
  });

  // 사용자 데이터를 가져오는 함수
  const fetchUserData = async () => {
    if (userUID && selectedDate) {
      try {
        const userDataRef = doc(db, "users", userUID);
        const userDataDoc = await getDoc(userDataRef);

        if (userDataDoc.exists()) {
          const userData = userDataDoc.data();
          setUserData(userData.data || []);
        }
      } catch (error) {
        console.error("데이터 가져오기 중 오류 발생:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [selectedDate]);

  const saveData = async () => {
    if (userUID && selectedDate && text) {
      try {
        // Firestore에 데이터 저장
        const userDataRef = doc(db, "users", userUID);
        const updatedData = userData.slice();
        updatedData.push({ date: selectedDate, time: selectedTime, value: text });

        await updateDoc(userDataRef, {
          data: updatedData,
        });

        console.log("데이터가 성공적으로 저장되었습니다.");
      } catch (error) {
        console.error("데이터 저장 중 오류 발생:", error);
      }
    }
  };

  const getSelectedDateValues = () => {
    if (userData && userData.length > 0 && selectedDate) {
      const selectedData = userData.filter((item) => item.date === selectedDate);
      return selectedData.map((item) => `Time: ${item.time}, Value: ${item.value}`).join("\n");
    }
    return "No data";
  };

  return (
    <Layout>
      <TopNav
        middleContent="오늘 할 일"
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

      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
      />

      <Picker
        selectedValue={selectedTime}
        onValueChange={(itemValue, itemIndex) => setSelectedTime(itemValue)}
      >
        {Array.from({ length: 49 }, (_, i) => (
          <Picker.Item
            key={i}
            label={`${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`}
            value={`${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`}
          />
        ))}
      </Picker>

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

      {/* 사용자 데이터 출력 */}
      <Text>{`오늘 할 일:\n${getSelectedDateValues()}`}</Text>
    </Layout>
  );
}
