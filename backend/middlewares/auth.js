const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

function authenticateUser(req, res, next) {
  const { body } = req || {};
  const { headers } = body || {};
  const { authorization } = headers || {};
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(403).json({
      message: "incorrect Bearer token",
    });
  }
  const [, token] = authorization?.split(" ") || [];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Authentication failed",
    });
  }
}

module.exports = { authenticateUser };
