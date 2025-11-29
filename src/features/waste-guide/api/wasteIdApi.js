import { GEMINI_API_KEY } from '@env';
import * as FileSystem from 'expo-file-system/legacy'; // Giữ nguyên legacy như đã sửa

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

export const identifyWasteWithAI = async (imageUri, textDescription) => {
  try {
    const parts = [];
    let promptText = "Bạn là chuyên gia phân loại rác EcoMate. Trả lời JSON raw.";
    
    if (textDescription) promptText += ` Mô tả: "${textDescription}".`;
    else promptText += " Nhìn ảnh này.";

    // Thêm nhắc nhở "ngắn gọn" để tránh AI viết văn tế
    promptText += `
      Xác định loại rác. Trả về JSON:
      {
        "itemName": "Tên vật phẩm (Tiếng Việt)",
        "category": "Chọn chính xác 1 trong các mã sau: 'huuco', 'nhua', 'kimloai', 'giay', 'dientu', 'thuytinh', 'yte', 'rac_khac'",
        "instructions": "Cách xử lý ngắn gọn (dưới 30 từ)", 
        "confidence": "Cao/Thấp"
      }
    `;

    parts.push({ text: promptText });

    if (imageUri) {
      console.log("Đang đọc ảnh...");
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64', 
      });
      parts.push({
        inlineData: { mimeType: 'image/jpeg', data: base64 }
      });
    }

    console.log("Đang gửi...");
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: { 
            temperature: 0.4, 
            maxOutputTokens: 2000 // ✅ SỬA Ở ĐÂY: Tăng từ 500 lên 2000
        }
      })
    });

    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) throw new Error("AI không trả lời");

    console.log("AI Full Text:", aiText); // Log ra xem có bị cắt nữa không

    // Clean JSON kỹ hơn chút
    const cleanJson = aiText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
        
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Error:", error);
    return {
        itemName: "Lỗi xử lý",
        category: "Không xác định",
        instructions: "Vui lòng chụp lại ảnh rõ hơn hoặc thử lại sau.",
        confidence: "N/A"
    };
  }
};

export const getDIYIdeas = async (itemText) => {
  try {
    const prompt = `
      Tôi có rác thải là: "${itemText}".
      Hãy gợi ý 3 ý tưởng tái chế sáng tạo (DIY) từ vật liệu này.
      Trả về JSON raw (không markdown) theo cấu trúc:
      {
        "ideas": [
          {
            "title": "Tên ý tưởng (ngắn gọn)",
            "difficulty": "Dễ/Trung bình/Khó",
            "steps": "Hướng dẫn tóm tắt 1 câu",
            "icon": "icon_name (chọn 1 trong: flower, cut, home, gift)"
          }
        ]
      }
    `;

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("DIY AI Error:", error);
    return { ideas: [] };
  }
};