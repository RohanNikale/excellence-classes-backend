require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define routes
const routes = [
  { path: "/api/payments", route: require("./routes/paymentRoutes") },
  { path: "/api/mcqtest", route: require("./routes/onlineMCQtestRoutes") },
  { path: "/api/offline", route: require("./routes/offlineTestRoutes") },
  { path: "/api/attendance", route: require("./routes/attendanceRoutes") },
  { path: "/api/users", route: require("./routes/userRoutes") },
  { path: "/api/auth", route: require("./routes/authRoutes") },
  { path: "/api/standard/batch", route: require("./routes/batchRoutes") },
  { path: "/api/standard", route: require("./routes/standardRoutes") },
  { path: "/api/studentmarks", route: require("./routes/studentMarksRoutes") },
  { path: "/api/online/payment", route: require("./routes/razorpayRoutes") },
  { path: "/api/studymaterial", route: require("./routes/studyMaterialRoutes") },
  { path: "/api/banners", route: require("./routes/bannerRoutes") },
];

// Register all routes
routes.forEach((route) => {
  app.use(route.path, route.route);
});

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files
app.use(express.static(path.join(__dirname, "build")));

// Catch-all route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server only if not in Vercel build
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
