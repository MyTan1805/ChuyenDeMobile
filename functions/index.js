/**
 * Đây là CODE SERVER (BACKEND)
 * Chỉ chạy trên Cloud Functions, KHÔNG chạy trên điện thoại.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");

// 1. Khai báo Secret (Key bảo mật)
// Bạn phải đã chạy lệnh: firebase functions:secrets:set OPENWEATHER_API_KEY
const openWeatherApiKey = defineSecret("OPENWEATHER_API_KEY");

// 2. Định nghĩa Cloud Function 'getAqiData'
exports.getAqiData = onCall(
  {
    // Đặt server gần Việt Nam cho nhanh (Singapore)
    region: "asia-southeast1", 
    // Cấp quyền truy cập Secret
    secrets: [openWeatherApiKey],
    // Cấu hình CORS để chấp nhận request từ mọi nguồn (nếu cần test web)
    cors: true, 
  },
  async (request) => {
    // --- A. Kiểm tra Input từ App gửi lên ---
    const { lat, lon } = request.data;

    // Kiểm tra xem App có gửi thiếu tọa độ không
    if (!lat || !lon) {
      throw new HttpsError(
        "invalid-argument",
        "Thiếu thông tin tọa độ (latitude, longitude)."
      );
    }

    // (Tùy chọn) Kiểm tra đăng nhập
    // Nếu bạn chưa làm chức năng Đăng nhập ở App, hãy comment dòng if dưới đây lại
    // if (!request.auth) {
    //   throw new HttpsError("unauthenticated", "User chưa đăng nhập.");
    // }

    // --- B. Xử lý Logic gọi API bên thứ 3 ---
    try {
      const apiKey = openWeatherApiKey.value();
      const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      console.log(`Đang gọi API OpenWeather cho tọa độ: ${lat}, ${lon}`);

      const response = await axios.get(url);
      const data = response.data;

      // --- C. Trả kết quả về cho App ---
      // API trả về mảng 'list', ta lấy phần tử đầu tiên (thời điểm hiện tại)
      if (data.list && data.list.length > 0) {
        const currentData = data.list[0];
        return {
          aqi: currentData.main.aqi,         // 1, 2, 3, 4, 5
          components: currentData.components, // co, no, no2, o3...
          dt: currentData.dt,                // Thời gian đo
          coord: data.coord                  // Tọa độ check lại
        };
      } else {
        throw new HttpsError("not-found", "Không tìm thấy dữ liệu tại vị trí này.");
      }

    } catch (error) {
      console.error("Lỗi Backend:", error.message);
      // Trả lỗi chuẩn về cho App xử lý
      throw new HttpsError("internal", "Lỗi kết nối đến OpenWeatherMap.");
    }
  }
);