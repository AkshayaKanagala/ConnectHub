const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check whether token exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided.",
      });
    }

    // Extract token from:
    // "Bearer eyJhbGciOi..."
    const token = authHeader.split(" ")[1];

    // Verify token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save the user ID inside the request
    req.userId = decoded.userId;

    // Token is valid, continue to the next function
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or expired token.",
    });
  }
};

module.exports = {
  protect,
};
