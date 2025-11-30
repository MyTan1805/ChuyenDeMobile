/**
 * Đây là CODE SERVER (BACKEND)
 * Chỉ chạy trên Cloud Functions, KHÔNG chạy trên điện thoại.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const openWeatherApiKey = defineSecret("OPENWEATHER_API_KEY");
const geminiApiKey = defineSecret("GEMINI_API_KEY");

exports.getAqiData = onCall(
  {
    region: "asia-southeast1", 
    secrets: [openWeatherApiKey],
    cors: true, 
  },
  async (request) => {
    const { lat, lon } = request.data;

    if (!lat || !lon) {
      throw new HttpsError(
        "invalid-argument",
        "Thiếu thông tin tọa độ (latitude, longitude)."
      );
    }

    try {
      const apiKey = openWeatherApiKey.value();
      const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      console.log(`Đang gọi API OpenWeather cho tọa độ: ${lat}, ${lon}`);

      const response = await axios.get(url);
      const data = response.data;

      if (data.list && data.list.length > 0) {
        const currentData = data.list[0];
        return {
          aqi: currentData.main.aqi, 
          components: currentData.components, 
          dt: currentData.dt, 
          coord: data.coord 
        };
      } else {
        throw new HttpsError("not-found", "Không tìm thấy dữ liệu tại vị trí này.");
      }

    } catch (error) {
      console.error("Lỗi Backend:", error.message);
      throw new HttpsError("internal", "Lỗi kết nối đến OpenWeatherMap.");
    }
  }
);

exports.getAqiHistory = onCall(
  {
    region: "asia-southeast1",
    secrets: [openWeatherApiKey],
    cors: true,
  },
  async (request) => {
    const { lat, lon, start, end } = request.data;

    if (!lat || !lon || !start || !end) {
      throw new HttpsError("invalid-argument", "Thiếu thông tin tọa độ hoặc thời gian.");
    }

    try {
      const apiKey = openWeatherApiKey.value();
      const url = `http://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`;
      
      console.log(`Gọi History: ${start} -> ${end}`);
      
      const response = await axios.get(url);
      return response.data;  
    } catch (error) {
      console.error("Lỗi History:", error.message);
      throw new HttpsError("internal", "Lỗi lấy dữ liệu lịch sử.");
    }
  }
);

exports.chatWithAI = onCall(
  {
    region: "asia-southeast1",
    secrets: [geminiApiKey],
    timeoutSeconds: 60,  
    cors: true,
  },
  async (request) => {
    const { message } = request.data;

    if (!message) {
      throw new HttpsError("invalid-argument", "Tin nhắn không được để trống.");
    }

    try {
      const apiKey = geminiApiKey.value();
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Bạn là EcoBot, một trợ lý ảo thân thiện của ứng dụng EcoMate.
        Nhiệm vụ của bạn là trả lời các câu hỏi về:
        - Bảo vệ môi trường, sống xanh.
        - Cách phân loại rác thải chi tiết.
        - Luật bảo vệ môi trường tại Việt Nam.
        
        Quy tắc:
        - Trả lời ngắn gọn, xúc tích, dễ hiểu.
        - Dùng nhiều emoji (🌱, ♻️, 🌍) để thân thiện.
        - Nếu người dùng hỏi chủ đề khác (như chính trị, toán học...), hãy từ chối khéo và lái về môi trường.

        Người dùng hỏi: "${message}"
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return { text: text };

    } catch (error) {
      console.error("Lỗi Gemini:", error);
      throw new HttpsError("internal", "EcoBot đang bận, vui lòng thử lại sau.");
    }
  }
);