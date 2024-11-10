require("dotenv").config();
// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const userRoutes = require("./routes/userRoutes");
const batchRoutes = require("./routes/batchRoutes");
const standardRoutes = require("./routes/standardRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const onlineMCQTestRoutes = require("./routes/onlineMCQtestRoutes");
const offlineTestRoutes = require("./routes/offlineTestRoutes");
const studentMarksRoutes = require("./routes/studentMarksRoutes");
const razorpayRoutes=require('./routes/razorpayRoutes')
const path = require('path');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/mcqtest",onlineMCQTestRoutes)
app.use("/api/offline",offlineTestRoutes)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/standard/batch", batchRoutes);
app.use("/api/standard", standardRoutes);
app.use("/api/studentmarks", studentMarksRoutes);
app.use("/api/online/payment", razorpayRoutes);
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
