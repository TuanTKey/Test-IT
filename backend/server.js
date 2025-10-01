const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const connectDB = require("./src/config/database");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes by default
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// Logging middleware - Always enable for debugging
app.use(morgan("dev"));

// Import CORS options
const corsOptions = require("./src/config/cors");

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
const authRoutes = require("./src/routes/auth");
const problemRoutes = require("./src/routes/problems");
const submissionRoutes = require("./src/routes/submissions");
const contestRoutes = require("./src/routes/contests");
const userRoutes = require("./src/routes/users");
const classRoutes = require('./src/routes/class');

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/users", userRoutes);
app.use('/api/admin/classes', classRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});
