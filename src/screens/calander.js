import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Picker  } from "react-native";
import { Layout, TopNav, Text, themeColor, useTheme } from "react-native-rapi-ui";
import { Ionicons } from "@expo/vector-icons";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseConfig from "../firebaseConfig";
import { Calendar } from "react-native-calendars";
import { addMonths, subMonths, format } from "date-fns";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [userUID, setUserUID] = useState("");
  const [userData, setUserData] = useState([]);

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUserUID(user.uid);
    }
  });

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
    // 컴포넌트가 마운트될 때 실행되는 함수
    const fetchDataOnMount = async () => {
      // UID가 설정되어 있는지 확인
      if (userUID) {
        // 데이터를 가져오는 함수를 호출
        await fetchUserData();
      }
    };
  
    // 사용자의 인증 상태가 변경될 때마다 실행될 함수
    const handleAuthStateChange = (user) => {
      if (user) {
        // 사용자가 로그인한 경우
        setUserUID(user.uid); // UID 설정
        fetchDataOnMount(); // 데이터 가져오기
      } else {
        // 사용자가 로그아웃한 경우
        setUserUID(null); // UID 제거
        setUserData([]); // 사용자 데이터 초기화
      }
    };
  
    // 인증 상태 변경 리스너를 추가
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
  
    // 컴포넌트가 언마운트될 때 리스너를 제거하기 위한 정리 함수
    return () => {
      unsubscribe();
    };
  }, []); // 빈 의존성 배열을 사용하여 컴포넌트가 마운트될 때만 실행되도록 함
  
  

  useEffect(() => {
    fetchUserData();
  }, [selectedDate]);

  const saveData = async () => {
    if (userUID && selectedDate && text) {
      try {
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

  const calculateMarkedDates = () => {
    const markedDates = {};

    userData.forEach((item) => {
      markedDates[item.date] = { marked: true };
    });

    return markedDates;
  };

  const markedDates = calculateMarkedDates();

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <Layout style={styles.container}>
      <TopNav
        middleContent="오늘 할 일"
        leftContent={<Ionicons name="chevron-back" size={20} color={isDarkmode ? themeColor.white100 : themeColor.dark} />}
        leftAction={() => navigation.goBack()}
      />

      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePrevMonth}>
          <Text>{"< Previous"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth}>
          <Text>{"Next >"}</Text>
        </TouchableOpacity>
      </View>

      <Calendar
  key={format(currentMonth, "yyyy-MM-dd")} // key prop을 추가했습니다.
  style={styles.calendar}
  current={format(currentMonth, "yyyy-MM-dd")}
  onDayPress={(day) => setSelectedDate(day.dateString)}
  markedDates={markedDates}
/>

      <View style={styles.pickerContainer}>
        <Picker
          style={styles.picker}
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
      </View>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(newText) => setText(newText)}
      />

      <TouchableOpacity onPress={saveData} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <Text style={styles.userDataText}>{`오늘 할 일:\n${getSelectedDateValues()}`}</Text>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  calendar: {
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  picker: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  userDataText: {
    fontSize: 16,
    lineHeight: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});
