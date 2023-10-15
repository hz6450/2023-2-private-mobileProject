import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { TopNav, themeColor, useTheme, Text, Button } from 'react-native-rapi-ui';
import { Ionicons } from '@expo/vector-icons';
import { generateOpenAIResponse } from './openaiService'; // OpenAI API 호출을 위한 서비스 파일
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Firebase Firestore 관련 import 추가

export default function OpenAIScreen({ navigation }) {
  const { isDarkmode, setTheme } = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [userData, setUserData] = useState([]);
  const [openAIResponse, setOpenAIResponse] = useState('');
  const db = getFirestore(); // Firestore 인스턴스 생성

  // Firebase로부터 사용자 데이터 가져오기 (이 부분은 이전 코드와 동일)
  const fetchUserData = async () => {
    if (selectedDate) {
      try {
        const userDataRef = doc(db, 'users', selectedDate); // 'users' 컬렉션에서 선택한 날짜의 문서 가져오기
        const userDataDoc = await getDoc(userDataRef);

        if (userDataDoc.exists()) {
          const userData = userDataDoc.data();
          setUserData(userData.data || []);
        } else {
          setUserData([]); // 데이터가 없는 경우 빈 배열로 설정
        }
      } catch (error) {
        console.error('데이터 가져오기 중 오류 발생:', error);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [selectedDate]);

  // OpenAI API를 호출하여 추천 일정을 생성하는 함수
  const generateRecommendation = async () => {
    try {
      // generateOpenAIResponse는 OpenAI API를 호출하여 추천 일정을 생성하는 함수입니다.
      const response = await generateOpenAIResponse(selectedDate, userData);
      setOpenAIResponse(response); // API 응답을 상태에 저장
    } catch (error) {
      console.error('OpenAI API 호출 중 오류 발생:', error);
    }
  };

  // 날짜별 할 일을 컨테이너로 구분하여 표시
  const renderUserDataContainers = () => {
    return userData.map((item, index) => (
      <View  key={index} style={{ margin: 8 }}>
        <Text>Date: {item.date}</Text>
        <Text>Task: {item.task}</Text>
        {/* 기타 필요한 데이터 표시 */}
      </View >
    ));
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

      {/* 날짜 선택 */}
      <Text>Select a date: {selectedDate}</Text>

      {/* Firebase로부터 가져온 사용자 데이터 표시 */}
      {userData.map((item, index) => (
        <View key={index} padding-10 marginT-10 bg-white radius-10>
          <Text>할 일: {item.value}</Text>
          <Text>시간: {item.time}</Text>
        </View>
      ))}

      {/* 추천 일정 생성 버튼 */}
      <Button
        title="Generate Recommendation"
        onPress={generateRecommendation}
        disabled={!selectedDate || userData.length === 0}
      />

      {/* OpenAI API에서 생성한 추천 일정 표시 */}
      <Text>Recommendation: {openAIResponse}</Text>
    </View>
  );
}