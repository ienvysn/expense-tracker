// middleware/auth.js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // so you can access req.user.userId
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = protect;
