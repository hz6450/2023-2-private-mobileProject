import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { TopNav, themeColor, useTheme, Text, Button } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { generateOpenAIResponse } from './openaiService';
import { getFirestore, query, where, collection, getDocs, doc, getDoc  } from 'firebase/firestore';



export default function OpenAIScreen({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM 형식으로 초기 월 설정
  const [userData, setUserData] = useState([]);
  const [openAIResponse, setOpenAIResponse] = useState('');
  const db = getFirestore();

  const moveMonth = (offset) => {
    const date = new Date(selectedMonth);
    date.setMonth(date.getMonth() + offset);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const fetchUserData = async () => {
    if (selectedMonth) {
      try {
        const userDataRef = doc(db, 'users', '8RE0UL0x7gIlNgpKTeE83jQZLa2'); // 문서 ID를 고정값으로 사용함 (변경 필요)
        const userDataDoc = await getDoc(userDataRef);
  
        if (userDataDoc.exists()) {
          // 원래 데이터를 가져옵니다.
          const originalData = userDataDoc.data().data || [];
          // date 필드를 수정합니다.
          const modifiedData = originalData.map(item => ({
            ...item,
            date: item.date.replace(/-/g, '')
          }));
          // 선택된 월의 데이터만 필터링합니다.
          const filteredData = modifiedData.filter(item => item.date.startsWith(selectedMonth.replace(/-/g, '')));
  
          // 필터링된 데이터를 상태로 설정합니다.
          setUserData(filteredData);
        } else {
          setUserData([]);
          console.warn(`No data found for month: ${selectedMonth}`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };
  
  
  

  useEffect(() => {
    fetchUserData();
  }, [selectedMonth]);

  const generateRecommendation = async () => {
    try {
      // generateOpenAIResponse는 OpenAI API를 호출하여 추천 일정을 생성하는 함수입니다.
      const response = await generateOpenAIResponse(selectedDate, userData);
      setOpenAIResponse(response); // API 응답을 상태에 저장
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
      {userData.map((item, index) => (
        <View key={index} style={{ padding: 10, marginTop: 10, backgroundColor: 'white', borderRadius: 10 }}>
          <Text>할 일: {item.value}</Text>
          <Text>시간: {item.time}</Text>
        </View>
      ))}

       {/* 추천 일정 생성 버튼 */}
       <Button
        title="Generate Recommendation"
        onPress={generateRecommendation}
        disabled={!selectedMonth || userData.length === 0}
      />

      {/* OpenAI API에서 생성한 추천 일정 표시 */}
      <Text>Recommendation: {openAIResponse}</Text>
    </View>
  );
}