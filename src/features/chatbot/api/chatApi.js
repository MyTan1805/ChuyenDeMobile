import { GEMINI_API_KEY } from '@env';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

const USE_MOCK = false; 

const MOCK_RESPONSES = {
  'rác': 'Pin cũ thuộc loại rác thải nguy hại, cần đưa đến điểm thu gom chuyên dụng. Ở Việt Nam, bạn có thể tìm điểm thu gom pin tại các siêu thị lớn (Co.opMart, BigC) hoặc liên hệ đội thu gom rác khu vực. 🔋♻️',
  'pin': 'Pin và ắc quy cần được xử lý riêng vì chứa kim loại nặng độc hại. Không vứt pin vào rác thải sinh hoạt! Các trung tâm điện máy như Thế Giới Di Động, FPT Shop thường có thùng thu gom pin cũ miễn phí. 🔋',
  'luật': 'Theo Luật Bảo vệ môi trường 2020, vi phạm xả rác bừa bãi có thể bị phạt từ 500.000đ - 1.000.000đ. Xả chất thải nguy hại có thể bị phạt đến 500 triệu đồng. Hãy phân loại rác đúng cách để bảo vệ môi trường! ⚖️🌍',
  'nhựa': 'Rác nhựa có thể tái chế: chai nước, hộp nhựa sạch. Không tái chế được: túi nilon bẩn, nhựa dẻo. Mẹo: Rửa sạch, phơi khô trước khi cho vào thùng rác tái chế màu xanh. 5 chai nhựa = 1 cái áo! ♻️👕',
  'default': 'Cảm ơn câu hỏi của bạn! Để bảo vệ môi trường, hãy bắt đầu từ những việc nhỏ: tắt điện khi không dùng, mang túi vải đi chợ, phân loại rác tại nhà. Mỗi hành động nhỏ đều có ý nghĩa lớn! 🌱💚'
};

function getMockResponse(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('rác') || msg.includes('phân loại')) return MOCK_RESPONSES.rác;
  if (msg.includes('pin') || msg.includes('ắc quy')) return MOCK_RESPONSES.pin;
  if (msg.includes('luật') || msg.includes('phạt') || msg.includes('quy định')) return MOCK_RESPONSES.luật;
  if (msg.includes('nhựa') || msg.includes('chai') || msg.includes('tái chế')) return MOCK_RESPONSES.nhựa;
  
  return MOCK_RESPONSES.default;
}

export const sendMessageToAI = async (userMessage) => {
  if (USE_MOCK) {
    console.log('🧪 Using MOCK mode');
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    return {
      text: getMockResponse(userMessage),
      suggestions: generateContextualSuggestions(userMessage)
    };
  }

  try {
    const fullPrompt = `Bạn là EcoBot - trợ lý AI về môi trường của ứng dụng EcoApp tại Việt Nam.

Nhiệm vụ:
- Trả lời về bảo vệ môi trường, phân loại rác, luật môi trường VN
- Đưa ra lời khuyên thực tế, dễ làm
- Trả lời ngắn gọn 2-4 câu, thân thiện, có emoji

Câu hỏi: ${userMessage}`;

    console.log('📤 Sending to Gemini Pro...');

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      
      if (errorData.error?.code === 429) {
        console.log('⚠️ Rate limited, using mock response');
        return {
          text: getMockResponse(userMessage),
          suggestions: generateContextualSuggestions(userMessage)
        };
      }
      
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Xin lỗi, tôi không thể trả lời lúc này. 😔";

    console.log('✅ Success:', aiText.substring(0, 50) + '...');

    return {
      text: aiText.trim(),
      suggestions: generateContextualSuggestions(userMessage)
    };

  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      text: "Kết nối đang gặp sự cố. Thử lại sau nhé! 🔄"
    };
  }
};

function generateContextualSuggestions(lastMessage) {
  const msg = lastMessage.toLowerCase();
  
  if (msg.includes('rác') || msg.includes('phân loại')) {
    return [
      "Rác nhựa tái chế thế nào? ♻️",
      "Pin cũ xử lý ở đâu? 🔋",
      "Túi nilon có tái chế được không? 🛍️"
    ];
  }
  
  if (msg.includes('luật') || msg.includes('quy định') || msg.includes('phạt')) {
    return [
      "Phạt xả rác bao nhiêu? ⚖️",
      "Luật môi trường mới nhất? 📜",
      "Xả nước thải có bị phạt không? 💧"
    ];
  }
  
  if (msg.includes('tiết kiệm') || msg.includes('điện') || msg.includes('nước')) {
    return [
      "Cách tiết kiệm điện? 💡",
      "Tiết kiệm nước mùa khô? 💧",
      "Giảm hóa đơn điện thế nào? 🔌"
    ];
  }
  
  return [
    "Mẹo sống xanh mỗi ngày? 🌿",
    "Cách giảm rác thải nhựa? 🥤",
    "Trồng cây gì trong nhà? 🪴"
  ];
}

export const getSeasonalSuggestions = async () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().toLocaleDateString('vi-VN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const seasonPrompt = `Hôm nay là ${currentDate} tại Việt Nam.

Hãy đưa ra 4 gợi ý ngắn gọn (mỗi gợi ý 5-8 từ) về hành động bảo vệ môi trường phù hợp với:
- Mùa hiện tại (${currentMonth >= 5 && currentMonth <= 11 ? 'mùa mưa' : 'mùa khô'})
- Các sự kiện môi trường trong tháng này (nếu có)
- Tình hình môi trường tại VN

Trả về ĐÚNG format JSON sau (không có văn bản giải thích khác):
{
  "suggestions": [
    "🌧️ Gợi ý 1 ngắn gọn",
    "♻️ Gợi ý 2 ngắn gọn",
    "🌱 Gợi ý 3 ngắn gọn",
    "💧 Gợi ý 4 ngắn gọn"
  ]
}`;

  try {
    if (USE_MOCK) {
      return getMockSeasonalSuggestions(currentMonth);
    }

    console.log('🤖 Requesting AI seasonal suggestions...');

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: seasonPrompt }] }],
        generationConfig: {
          temperature: 0.8, 
          maxOutputTokens: 300,
          topP: 0.95,
          topK: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error('API Error');
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ AI Seasonal Suggestions:', parsed.suggestions);
      return parsed.suggestions;
    }

    return getMockSeasonalSuggestions(currentMonth);

  } catch (error) {
    console.error('❌ Error getting seasonal suggestions:', error);
    return getMockSeasonalSuggestions(currentMonth);
  }
};

function getMockSeasonalSuggestions(month) {
  const seasonalTips = {
    dry: [
      "🔥 Không đốt rác, phòng cháy rừng",
      "💧 Tiết kiệm nước mùa hạn hán",
      "😷 Đeo khẩu trang khi AQI cao",
      "🌳 Trồng cây chịu hạn quanh nhà"
    ],
    rainy: [
      "🌧️ Không vứt rác gây tắc cống",
      "♻️ Phân loại rác ướt đúng cách",
      "🚰 Thu gom nước mưa tái sử dụng",
      "🌱 Trồng cây hút nước chống ngập"
    ]
  };
  
  const season = (month >= 5 && month <= 11) ? 'rainy' : 'dry';
  return seasonalTips[season];
}

export const speakText = async (text) => {
  try {
    const Speech = require('expo-speech');
    
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }
    
    await Speech.speak(text, {
      language: 'vi-VN',
      pitch: 1.0,
      rate: 0.85, 
    });
    
    console.log('🔊 Speaking:', text.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('❌ Text-to-Speech Error:', error);
  }
};

export const startVoiceRecognition = async () => {
  try {
    const { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } = 
      require("expo-speech-recognition");

    const { start } = ExpoSpeechRecognitionModule;
    
    const result = await start({
      lang: "vi-VN",
      interimResults: true,
      maxAlternatives: 1
    });

    return {
      success: true,
      text: result.results[0]?.transcript || ""
    };

  } catch (error) {
    console.error('Speech-to-Text Error:', error);
    return {
      success: false,
      message: 'Không nhận diện được giọng nói'
    };
  }
};