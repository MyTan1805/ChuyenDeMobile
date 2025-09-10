# Hướng dẫn Cấu trúc Thư mục Dự án EcoApp

Chào mừng đến với dự án EcoApp! Tài liệu này sẽ giải thích chi tiết về cấu trúc thư mục và quy tắc tổ chức code của chúng ta. Việc tuân thủ cấu trúc này sẽ giúp dự án luôn gọn gàng, dễ bảo trì và dễ dàng cho tất cả các thành viên cùng làm việc song song.

## Triết lý Chính

Dự án của chúng ta được xây dựng dựa trên nguyên tắc **"Tách biệt Trách nhiệm" (Separation of Concerns)** và **"Sắp xếp theo Tính năng" (Feature-based Organization)**.

1.  **`app/` - Lớp Điều hướng (Routing Layer):** Chỉ chịu trách nhiệm định nghĩa các màn hình và cấu trúc điều hướng. **KHÔNG** chứa logic nghiệp vụ phức tạp.
2.  **`src/` - Lớp Logic Ứng dụng (Application Logic Layer):** Chứa toàn bộ "bộ não" của ứng dụng, bao gồm UI, logic, xử lý dữ liệu, và giao tiếp với API.

---

## Phân tích Cấu trúc Chi tiết

EcoApp/
├── app/ # (1) Lớp Điều hướng (Expo Router)
├── src/ # (2) Lớp Logic Ứng dụng
│ ├── api/ # Nơi chứa các hàm gọi API bên ngoài
│ ├── assets/ # Tài nguyên tĩnh (ảnh, fonts)
│ ├── components/ # (3) Các component TÁI SỬ DỤNG trên toàn app
│ ├── constants/ # Các hằng số (màu sắc, kích thước...)
│ ├── features/ # (4) Nơi phát triển các tính năng chính
│ ├── hooks/ # Các custom hooks dùng chung
│ ├── store/ # (5) Quản lý trạng thái toàn cục (Zustand)
│ └── types/ # (6) Định nghĩa các kiểu dữ liệu TypeScript
└── ... # Các file cấu hình gốc

### 1. `app/` (Lớp Điều hướng)

-   **Mục đích:** Được quản lý bởi **Expo Router**. Cấu trúc thư mục ở đây sẽ tự động tạo ra các route cho ứng dụng.
-   **Quy tắc:**
    -   Các file trong `app/` (ví dụ: `app/(tabs)/community.tsx`) phải được giữ **CỰC KỲ TINH GỌN**.
    -   Nhiệm vụ chính của chúng là import và render các "Screen Component" tương ứng từ `src/features/`.

-   **Ví dụ (`app/(tabs)/community.tsx`):**
    ```tsx
    import CommunityFeedScreen from '@/features/community/screens/CommunityFeedScreen';
    import React from 'react';

    // File này chỉ làm nhiệm vụ kết nối route với screen component.
    export default function CommunityTab() {
      return <CommunityFeedScreen />;
    }
    ```

### 2. `src/` (Lớp Logic Ứng dụng)

Đây là nơi chứa toàn bộ mã nguồn của chúng ta.

### 3. `src/components/` (Component Dùng chung)

-   **Mục đích:** Chứa các component có thể tái sử dụng ở **NHIỀU** tính năng khác nhau.
-   **Quy tắc:**
    -   Nếu một component chỉ được dùng trong một tính năng duy nhất (ví dụ: `PostCard` chỉ dùng trong `community`), nó phải được đặt trong thư mục `src/features/community/components/`.
    -   Nếu một component có thể dùng ở khắp mọi nơi (ví dụ: `Button`, `Card`, `ThemedText`), nó sẽ được đặt ở đây.
-   **Cấu trúc con đề xuất:**
    -   `src/components/common/`: Cho các component UI cơ bản (Button, Input...).
    -   `src/components/layout/`: Cho các component về bố cục (Container, Spacer...).

### 4. `src/features/` (Các Tính năng)

-   **Mục đích:** Đây là thư mục quan trọng nhất, nơi chúng ta phát triển các module chính của ứng dụng.
-   **Quy tắc:**
    -   Mỗi tính năng lớn (auth, aqi, report, community...) sẽ có một thư mục riêng ở đây.
    -   Bên trong mỗi thư mục `feature`, chúng ta có thể tự do tổ chức các thư mục con như `components/`, `screens/`, `hooks/`, `utils/`... để phục vụ cho riêng tính năng đó.
-   **Lợi ích:** Giúp các thành viên làm việc độc lập trên các tính năng khác nhau mà không bị xung đột.

### 5. `src/store/` (Trạng thái Toàn cục)

-   **Mục đích:** Quản lý các trạng thái cần được chia sẻ trên toàn bộ ứng dụng bằng **Zustand**.
-   **Ví dụ:** `userStore.ts` sẽ chứa thông tin của người dùng đang đăng nhập, để bất kỳ màn hình nào cũng có thể truy cập.

### 6. `src/types/` (Kiểu dữ liệu)

-   **Mục đích:** Nơi định nghĩa các `interface` và `type` của TypeScript.
-   **Quy tắc:** Tất cả các định nghĩa kiểu dữ liệu có thể tái sử dụng (ví dụ: `User`, `Report`, `Post`) sẽ được đặt trong file `src/types/index.ts`.
-   **Lợi ích:** Giúp code an toàn, dễ bảo trì và tận dụng tối đa khả năng tự động gợi ý code của VS Code.

---

## Luồng Công việc (Workflow)

1.  **Tạo một tính năng mới:**
    -   Tạo một thư mục mới trong `src/features/` (ví dụ: `src/features/gamification/`).
    -   Xây dựng các `screens` và `components` cần thiết bên trong thư mục đó.
2.  **Kết nối với Điều hướng:**
    -   Tạo một file mới trong `app/` (ví dụ: `app/(tabs)/gamification.tsx`).
    -   Trong file đó, import và render screen component từ `src/features/gamification/screens/`.

Cảm ơn vì đã đọc! Hãy cùng nhau tuân thủ cấu trúc này để xây dựng một sản phẩm chất lượng cao.
