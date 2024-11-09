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
require("dotenv").config();

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
