import { GEMINI_API_KEY } from '@env';

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const USE_MOCK = false;  

const ACTION_TEMPLATES = {
  rainy: [
    {
      id: 1,
      icon: 'water',
      title: 'Phòng ngập do rác',
      points: 2,
      descriptionKey: 'prevent_flooding'
    },
    {
      id: 2,
      icon: 'leaf',
      title: 'Trồng cây chịu mưa',
      points: 2,
      descriptionKey: 'plant_trees'
    },
    {
      id: 3,
      icon: 'trash',
      title: 'Phân loại rác ướt',
      points: 2,
      descriptionKey: 'sort_wet_waste'
    },
    {
      id: 4,
      icon: 'hand-left',
      title: 'Dọn rác sau mưa',
      points: 2,
      descriptionKey: 'clean_after_rain'
    }
  ],
  dry: [
    {
      id: 1,
      icon: 'water-outline',
      title: 'Tiết kiệm nước',
      points: 2,
      descriptionKey: 'save_water'
    },
    {
      id: 2,
      icon: 'flame-outline',
      title: 'Phòng cháy rừng',
      points: 2,
      descriptionKey: 'prevent_fire'
    },
    {
      id: 3,
      icon: 'fitness',
      title: 'Bảo vệ sức khỏe',
      points: 2,
      descriptionKey: 'protect_health'
    },
    {
      id: 4,
      icon: 'sunny',
      title: 'Tưới cây buổi sáng',
      points: 2,
      descriptionKey: 'water_plants'
    }
  ]
};

export const generateDailyActions = async () => {
  const currentMonth = new Date().getMonth() + 1;
  const season = currentMonth >= 5 && currentMonth <= 11 ? 'rainy' : 'dry';
  const templates = ACTION_TEMPLATES[season];

  if (USE_MOCK) {
    console.log('🧪 Using MOCK mode - static descriptions');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockActions = templates.map(action => ({
      ...action,
      description: getMockDescription(action.descriptionKey),
      checked: false
    }));
    console.log('✅ Mock actions loaded:', mockActions.length, 'actions');
    return mockActions; 
  }

  try {
    const currentDate = new Date().toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'long'
    });
    
    const seasonText = season === 'rainy' ? 'mùa mưa' : 'mùa khô';
    
    const titlesList = templates.map(a => `"${a.title}"`).join(', ');
    
    const prompt = `Bạn là chuyên gia môi trường tại Việt Nam. Hôm nay là ${currentDate}, đang trong ${seasonText}.

Hãy viết MÔ TẢ CHI TIẾT (10-15 từ) cho các hành động bảo vệ môi trường sau:
${templates.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}

YÊU CẦU:
- Mỗi mô tả 10-15 từ
- Cụ thể, dễ hiểu, phù hợp với ${seasonText} tại VN
- Tập trung vào CÁCH THỰC HIỆN

Trả về ĐÚNG format JSON:
{
  "descriptions": [
    "Mô tả chi tiết cho hành động 1",
    "Mô tả chi tiết cho hành động 2",
    "Mô tả chi tiết cho hành động 3",
    "Mô tả chi tiết cho hành động 4"
  ]
}`;

    console.log('📤 Requesting AI descriptions...');
    console.log('🔑 API Key exists:', !!GEMINI_API_KEY);
    console.log('🔑 API Key preview:', GEMINI_API_KEY?.substring(0, 10) + '...');

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95,
          topK: 40,
          responseLogprobs: false,  
          presencePenalty: 0,
          frequencyPenalty: 0
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      })
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error Detail:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 429) {
        console.log('⏱️ Rate limited, using fallback descriptions');
        throw new Error('RATE_LIMITED'); 
      }
      
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('📦 Full API response:', JSON.stringify(data, null, 2));
    
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('📥 AI Response (full):', aiText);

    let jsonText = aiText;
    
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    const jsonMatch = jsonText.match(/\{[\s\S]*?"descriptions"\s*:\s*\[[\s\S]*?\]\s*\}/);
    
    if (!jsonMatch) {
      console.error('❌ Cannot find JSON in response. Full text:', aiText);
      throw new Error('Cannot parse JSON');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.descriptions || parsed.descriptions.length !== templates.length) {
      throw new Error('Invalid descriptions array');
    }

    const actionsWithAI = templates.map((action, index) => ({
      ...action,
      description: parsed.descriptions[index] || getMockDescription(action.descriptionKey),
      checked: false
    }));

    console.log('✅ AI descriptions generated successfully');
    return actionsWithAI;

  } catch (error) {
    console.error('❌ AI failed:', error.message);
    console.log('⚠️ Fallback to static descriptions');
    
    return templates.map(action => ({
      ...action,
      description: getMockDescription(action.descriptionKey),
      checked: false
    }));
  }
};

function getMockDescription(key) {
  const descriptions = {
    prevent_flooding: 'Không vứt rác bừa bãi, làm tắc cống mương trong mùa mưa',
    plant_trees: 'Trồng cây xanh giúp hút nước và chống ngập úng',
    sort_wet_waste: 'Rác ướt dễ phân hủy cần được phân loại và xử lý đúng cách',
    clean_after_rain: 'Thu gom rác trôi dạt vào khu vực xung quanh nhà bạn',
    
    save_water: 'Tắm ngắn, tắt vòi khi đánh răng để tiết kiệm nước quý giá',
    prevent_fire: 'Không đốt rác, dọn dẹp lá khô để phòng chống cháy rừng',
    protect_health: 'Đeo khẩu trang khi chất lượng không khí kém trong mùa khô',
    water_plants: 'Tưới cây vào buổi sáng sớm để giảm lượng nước bay hơi'
  };
  
  return descriptions[key] || 'Hành động bảo vệ môi trường';
}