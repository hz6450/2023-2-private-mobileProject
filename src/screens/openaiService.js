import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci/completions';
const OPENAI_API_KEY = process.env.API_KEY; // 실제 API 키 사용 시, 이를 서버나 환경 변수에서 안전하게 관리하세요.

export async function generateOpenAIResponse(userData) {
  try {
      // userData가 배열인지 확인합니다.
      if (!Array.isArray(userData)) {
          throw new Error("Invalid userData. Expected an array.");
      }

        // 사용자 데이터를 바탕으로 쿼리를 생성합니다.
        let activities = userData.map(event => event.value).join(', ');

        // 프롬프트 생성
        let prompt = `오늘 나는 다음과 같은 활동을 했다: ${activities}. 
        이 활동들에 대한 내 느낌과 생각, 그리고 특별히 기억에 남는 부분을 바탕으로 오늘의 일기를 작성해줘.`;
        console.log(activities)
        const response = await axios.post(OPENAI_API_URL, {
            prompt: prompt,
            max_tokens: 500,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // OpenAI의 응답에서 일기 내용을 추출합니다.
        if (response.data.choices && response.data.choices.length > 0) {
            const diaryEntry = response.data.choices[0].text.trim();
            return diaryEntry;
        } else {
            throw new Error("No diary entry received from OpenAI.");
        }
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        throw error;
    }
}
