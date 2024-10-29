// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.auth = (roles) => async (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userData = await User.findById(decoded.id).select('-password'); // Exclude password field

    if (!userData) return res.status(404).json({ message: "User not found" });

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = userData; // Attach user data without password
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
