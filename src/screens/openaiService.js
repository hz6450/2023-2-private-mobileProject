import axios from 'axios';

// OpenAI API 엔드포인트 URL
const OPENAI_API_URL = 'https://api.openai.com/v1/your_endpoint_here'; // OpenAI API 엔드포인트 URL을 여기에 추가

// OpenAI API 키 (인증 헤더에 사용됨)
const OPENAI_API_KEY = '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'; // OpenAI API 키를 여기에 추가

// OpenAI API를 호출하여 추천 일정을 생성하는 함수
export async function generateOpenAIResponse(selectedDate, userData) {
  try {
    // OpenAI API 요청 본문 데이터 구성
    const requestData = {
      prompt: `Generate a schedule for ${selectedDate} based on the following tasks:\n${userData.map(item => item.value).join('\n')}`,
      max_tokens: 50, // 생성된 텍스트의 최대 길이
    };

    // OpenAI API 요청 헤더 구성
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    };

    // OpenAI API 호출
    const response = await axios.post(OPENAI_API_URL, requestData, { headers: requestHeaders });

    // API 응답에서 생성된 일정 추천 추출
    const recommendation = response.data.choices[0]?.text || 'No recommendation available';

    return recommendation;
  } catch (error) {
    throw error;
  }
}
