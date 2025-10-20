# Hướng dẫn Cấu trúc Thư mục Dự án EcoApp 

Chào mừng đến với dự án EcoApp! Tài liệu này giải thích chi tiết về cấu trúc thư mục và quy tắc tổ chức code của chúng ta. Việc tuân thủ cấu trúc này sẽ giúp dự án luôn gọn gàng, dễ quản lý và dễ dàng cho tất cả các thành viên cùng làm việc song song.

## Triết lý Chính

Dự án của chúng ta được xây dựng dựa trên nguyên tắc **"Tách biệt Trách nhiệm" (Separation of Concerns)** và **"Sắp xếp theo Tính năng" (Feature-based Organization)**.

1.  **Thư mục gốc (`/`)**: Chỉ chứa các file cấu hình và điểm khởi đầu của ứng dụng (`App.js`, `index.js`).
2.  **`src/` - Lớp Logic Ứng dụng**: Chứa toàn bộ "bộ não" của ứng dụng, bao gồm UI, logic, xử lý dữ liệu, và giao tiếp với API.

---

## Phân tích Cấu trúc Chi tiết
EcoApp/
├── src/
│ ├── api/ # (1) Lớp Giao tiếp API
│ ├── assets/ # Tài nguyên tĩnh (ảnh, fonts)
│ ├── components/ # (2) Các component TÁI SỬ DỤNG trên toàn app
│ ├── constants/ # Các hằng số (màu sắc, kích thước...)
│ ├── features/ # (3) Nơi phát triển các tính năng chính
│ ├── hooks/ # Các custom hooks dùng chung
│ ├── navigation/ # (4) Quản lý luồng điều hướng (React Navigation)
│ ├── store/ # (5) Quản lý trạng thái toàn cục (Zustand)
│ └── types/ # (6) Nơi chứa các định nghĩa JSDoc
├── App.js # Điểm vào của ứng dụng (chỉ import từ src/)
├── index.js # Điểm đăng ký component gốc
└── ... # Các file cấu hình gốc
code
Code
### 1. `src/api/` (Lớp Giao tiếp API)
-   **Mục đích:** Chứa các file `.js` quản lý việc gọi đến các API bên ngoài và Cloud Functions.
-   **Ví dụ:** `firebaseApi.js`, `geminiApi.js`.
-   **Lợi ích:** Tách biệt logic giao tiếp mạng ra khỏi giao diện, giúp code dễ đọc và dễ test.

### 2. `src/components/` (Component Dùng chung)
-   **Mục đích:** Chứa các component có thể tái sử dụng ở **NHIỀU** tính năng khác nhau.
-   **Quy tắc:**
    -   Nếu một component chỉ dùng trong một tính năng (ví dụ: `PostCard`), nó phải nằm trong thư mục `src/features/community/components/`.
    -   Nếu một component dùng ở khắp nơi (ví dụ: `Button`, `Card`), nó sẽ nằm ở đây.
-   **Cấu trúc con:** `src/components/common/`, `src/components/layout/`.

### 3. `src/features/` (Các Tính năng)
-   **Mục đích:** Đây là thư mục quan trọng nhất. Mỗi tính năng lớn (auth, aqi, report...) sẽ có một thư mục riêng ở đây.
-   **Quy tắc:** Bên trong mỗi thư mục `feature`, chúng ta có thể tự do tổ chức các thư mục con như `components/`, `screens/`, `hooks/`... để phục vụ cho riêng tính năng đó.
-   **Lợi ích:** Giúp các thành viên làm việc độc lập mà không bị xung đột.

### 4. `src/navigation/` (Điều hướng)
-   **Mục đích:** Vì không sử dụng Expo Router, chúng ta cần một nơi để định nghĩa các Navigator của **React Navigation**.
-   **Cấu trúc con:**
    -   `AuthNavigator.js`: Định nghĩa Stack cho luồng Đăng nhập/Đăng ký.
    -   `MainTabNavigator.js`: Định nghĩa Tab Navigator cho 5 tab chính.
    -   `AppNavigator.js`: Chứa logic để chọn hiển thị `AuthNavigator` hay `MainTabNavigator`.

### 5. `src/store/` (Trạng thái Toàn cục)
-   **Mục đích:** Quản lý các trạng thái cần được chia sẻ trên toàn bộ ứng dụng bằng **Zustand**.
-   **Ví dụ:** `userStore.js` sẽ chứa thông tin của người dùng đang đăng nhập.

### 6. `src/types/` (Kiểu dữ liệu)
-   **Mục đích:** Nơi định nghĩa các "kiểu" dữ liệu bằng **JSDoc**.
-   **Ví dụ (`src/types/index.js`):**
    ```javascript
    /**
     * @typedef {object} User
     * @property {string} id
     * @property {string} email
     * @property {string} displayName
     * @property {string} [photoURL]
     * @property {number} points
     */
    ```
-   **Lợi ích:** Giúp VS Code có thể gợi ý code và kiểm tra lỗi gần giống như TypeScript.

---

## Luồng Công việc (Workflow)

1.  **Tạo một tính năng mới:**
    -   Tạo thư mục mới trong `src/features/` (ví dụ: `src/features/auth/`).
    -   Xây dựng các `screens` và `components` cần thiết bên trong đó dưới dạng file `.jsx`.
2.  **Kết nối với Điều hướng:**
    -   Mở file navigator tương ứng trong `src/navigation/` (ví dụ: `AuthNavigator.js`).
    -   Import và thêm screen mới vào Stack.

Cảm ơn vì đã đọc! Hãy cùng nhau tuân thủ cấu trúc này để xây dựng một sản phẩm chất lượng cao.