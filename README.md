🏗️ Kiến trúc hệ thống
Mô hình microservices:
Auth Service: Quản lý đăng nhập, đăng ký, phân quyền
Exam Service: Quản lý kỳ thi, đề thi, câu hỏi
Code Execution Service: Xử lý biên dịch và chạy code
Submission Service: Quản lý bài nộp và chấm điểm
Monitoring Service: Giám sát gian lận và theo dõi tiến trình
🛠️ Công nghệ đề xuất
Backend:
Node.js với Express/NestJS hoặc Python với Django/FastAPI
Database: PostgreSQL/MongoDB
Redis cho caching và real-time updates
Message queue (RabbitMQ/Kafka) cho xử lý code execution
Frontend:
React.js với TypeScript
Monaco Editor (trình soạn thảo code của VS Code)
Socket.io cho real-time updates
Code Execution:
Docker container isolation cho an toàn
API Judge0 hoặc tự build execution environment
