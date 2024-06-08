const jwt = require("jsonwebtoken");
const secrets = require("../config/secrets.json");
const JWT_SECRET = secrets?.development?.jwt_secret;

function authenticateUser(req, res, next) {
  const { headers } = req || {};
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
