import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TopNav, themeColor, useTheme, Text, Button } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { generateOpenAIResponse } from './openaiService';
import { getFirestore, query, where, collection, getDocs, doc, getDoc  } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function OpenAIScreen({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM 형식으로 초기 월 설정
  const [userData, setUserData] = useState({});
  const [openAIResponse, setOpenAIResponse] = useState('');
  const [userUID, setUserUID] = useState(null); // 사용자 UID를 위한 상태 추가
  const db = getFirestore();

  const moveMonth = (offset) => {
    const date = new Date(selectedMonth);
    date.setMonth(date.getMonth() + offset);
    setSelectedMonth(date.toISOString().slice(0, 7));
    
  };

  const fetchUserData = async () => {
    if (userUID && selectedMonth) {
      try {
        const userDataRef = doc(db, 'users', userUID);
        const userDataDoc = await getDoc(userDataRef);
  
        if (userDataDoc.exists()) {
          const originalData = userDataDoc.data().data || [];
  
          const groupedData = {};
  
          originalData.forEach(item => {
            const month = item.date.slice(0, 7);
            const day = item.date; // 일자를 포함한 날짜 YYYY-MM-DD
  
            if (!groupedData[month]) {
              groupedData[month] = {};
            }
  
            if (!groupedData[month][day]) {
              groupedData[month][day] = [];
            }
  
            groupedData[month][day].push({
              date: item.date,
              value: item.value,
              time: item.time
            });
          });
  
          console.log("Fetched User Data:", groupedData);
  
          setUserData(groupedData);
        } else {
          console.warn(`No data found for month: ${selectedMonth}`);
        }
      } catch (error) {
        console.error('데이터 가져오기 중 오류 발생:', error);
      }
    }
  };
useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
          setUserUID(user.uid);
      }
  });

  // 컴포넌트 언마운트시 정리 함수 호출
  return () => unsubscribe();
}, []); // 빈 의존성 배열을 사용하여 컴포넌트가 마운트될 때만 실행되도록 합니다.


  useEffect(() => {
    fetchUserData();
  }, [selectedMonth]);

  const generateRecommendation = async () => {
    try {
      const dataForSelectedMonth = Object.values(userData[selectedMonth] || {});
      const flattenedData = dataForSelectedMonth.flat();
const response = await generateOpenAIResponse(flattenedData);

  
      setOpenAIResponse(response);
    } catch (error) {
      console.error('OpenAI API 호출 중 오류 발생:', error);
    }
  };
  

  return (
    <View>
      <TopNav
        middleContent="일정 관리"
        leftContent={<Ionicons name="chevron-back" size={20} color={isDarkmode ? themeColor.white100 : themeColor.dark} />}
        leftAction={() => navigation.goBack()}
        rightContent={<Ionicons name={isDarkmode ? "sunny" : "moon"} size={20} color={isDarkmode ? themeColor.white100 : themeColor.dark} />}
        rightAction={() => isDarkmode ? setTheme('light') : setTheme('dark')}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Button title="Prev Month" onPress={() => moveMonth(-1)} />
        <Text style={{ marginHorizontal: 10 }}>{selectedMonth}</Text>
        <Button title="Next Month" onPress={() => moveMonth(1)} />
      </View>

      {/* Firebase로부터 가져온 사용자 데이터 표시 */}
       {/* Firebase로부터 가져온 사용자 데이터 표시 */}
    {Object.entries(userData[selectedMonth] || {}).map(([day, items]) => (
      <View key={day} style={{ padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 10 }}>
        <Text>{day}</Text>
        {items.map((item, index) => (
          <View key={index}>
            <Text>할 일: {item.value}</Text>
            <Text>시간: {item.time}</Text>
          </View>
        ))}
      </View>
    ))}

      {/* OpenAI API에서 생성한 추천 일정 표시 */}
      {openAIResponse && (
  <View style={{ padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 10 }}>
    <Text>오늘의 일정 요약: {openAIResponse}</Text>
  </View>
)}
<Button
  title="내일의 추천 일정 생성"
  onPress={generateRecommendation}
  disabled={!selectedMonth || userData.length === 0}
/>
    </View>
  );
}