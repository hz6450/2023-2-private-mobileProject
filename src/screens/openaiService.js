import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci/completions';
const OPENAI_API_KEY = ''; // 실제 API 키 사용 시, 이를 서버나 환경 변수에서 안전하게 관리하세요.


export async function generateOpenAIResponse(userData) {
  try {
      // userData가 배열인지 확인합니다.
      if (!Array.isArray(userData)) {
          throw new Error("Invalid userData. Expected an array.");
      }

        // 사용자 데이터를 바탕으로 쿼리를 생성합니다.
        let prompt = `오늘의 사용자의 스케줄을 기반으로 일정을 요약하고 새로운 이벤트 추천을 해주세요.\n\n`;
        userData.forEach(event => {
            prompt += `이벤트: ${event.value}, 시간: ${event.time}\n`;
        });
        prompt += "\n요약 및 추천:";

        const response = await axios.post(OPENAI_API_URL, {
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // OpenAI의 응답에서 요약 및 추천된 일정 텍스트를 추출합니다.
        if (response.data.choices && response.data.choices.length > 0) {
            const summaryAndRecommendation = response.data.choices[0].text.trim();
            return summaryAndRecommendation;
        } else {
            throw new Error("No summary or recommendation received from OpenAI.");
        }
    } catch (error) {
        console.error('Error calling OpenAI:', error);
        throw error;
    }
}
