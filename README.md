# 🎯 CodeJudge - Online Coding Platform

<div align="center">

![CodeJudge](https://img.shields.io/badge/CodeJudge-v1.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-47A248?style=for-the-badge&logo=mongodb)

**Nền tảng luyện tập và thi đấu lập trình trực tuyến với AI Judge**

[Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt) • [Hướng dẫn sử dụng](#-chạy-dự-án)

</div>

---

## 📋 Mô tả

CodeJudge là nền tảng học tập và thi đấu lập trình trực tuyến, được thiết kế dành cho giáo viên và học sinh. Hệ thống hỗ trợ chấm bài tự động bằng AI (Gemini) và cho phép quản lý lớp học, bài tập, cuộc thi một cách hiệu quả.

## ✨ Tính năng

### 👨‍🎓 Dành cho Học sinh
- 📝 Giải bài tập lập trình với nhiều ngôn ngữ (Python, JavaScript, C++, Java)
- 🖥️ Code editor tích hợp với syntax highlighting (Monaco Editor)
- ▶️ Chạy code với terminal tương tác
- 🏆 Tham gia cuộc thi trực tuyến
- 📊 Xem xếp hạng và điểm số

### 👨‍🏫 Dành cho Giáo viên/Admin
- 📚 Quản lý bài tập với nhiều độ khó
- 🏅 Tạo và quản lý cuộc thi
- 👥 Quản lý lớp học và học sinh
- 📈 Xem thống kê bài nộp
- ✅ Chấm điểm tự động với AI Judge

### 🤖 AI Judge (Gemini)
- Chấm bài tự động với độ chính xác cao
- Phân tích code và đưa ra phản hồi
- Hỗ trợ nhiều ngôn ngữ lập trình

## 🛠️ Công nghệ sử dụng

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 18, Vite, TailwindCSS, Monaco Editor |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI** | Google Gemini API |
| **Auth** | JWT (JSON Web Token) |

## 📦 Cài đặt

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MongoDB** (local hoặc MongoDB Atlas)
- **Git**
- **g++** (để chạy code C++) - [Tải MinGW](https://github.com/niXman/mingw-builds-binaries/releases)
- **Java JDK** (để chạy code Java)
- **Python** >= 3.10

### Bước 1: Clone dự án

```bash
git clone https://github.com/TuanTKey/coding-platform.git
cd coding-platform
```

### Bước 2: Cài đặt Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/coding-platform
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
USE_AI_JUDGE=true
```

> 💡 **Lấy Gemini API Key**: Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)

### Bước 3: Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### Bước 4: Cấu hình g++ cho Windows (để chạy C++)

1. Tải MinGW từ [đây](https://github.com/niXman/mingw-builds-binaries/releases)
2. Giải nén vào `C:\mingw64`
3. Thêm `C:\mingw64\bin` vào biến môi trường PATH
4. Khởi động lại máy tính

## 🚀 Chạy dự án

### Cách 1: Chạy thủ công

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Cách 2: Sử dụng file batch (Windows)

```bash
# Chạy file start.bat ở thư mục gốc
start.bat
```

### Truy cập ứng dụng

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Cấu trúc dự án

```
coding-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình database, CORS
│   │   ├── controllers/     # Xử lý logic API
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic, AI Judge
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── services/        # API calls
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔑 Tài khoản mặc định

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |

## 📖 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |

### Problems
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/problems` | Lấy danh sách bài tập |
| GET | `/api/problems/:slug` | Lấy chi tiết bài tập |
| POST | `/api/problems` | Tạo bài tập (Admin) |

### Submissions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/submissions` | Nộp bài |
| POST | `/api/submissions/run` | Chạy thử code |
| GET | `/api/submissions/:id` | Lấy kết quả chấm |

### Contests
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/contests` | Lấy danh sách cuộc thi |
| POST | `/api/contests` | Tạo cuộc thi (Admin) |

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo Pull Request hoặc Issue nếu bạn có ý tưởng cải tiến.

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Tác giả

**TuanTKey**
- GitHub: [@TuanTKey](https://github.com/TuanTKey)

---

<div align="center">
Made with ❤️ by TuanTKey
</div>
