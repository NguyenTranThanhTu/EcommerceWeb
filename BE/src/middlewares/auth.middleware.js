const jwt = require("jsonwebtoken");
const JSend = require("../jsend");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json(JSend.error({ message: "Vui lòng cung cấp token xác thực." })); // Không có token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json(JSend.error({ message: "Token xác thực không hợp lệ." })); // Token không hợp lệ
    }
    req.user = user; // Lưu thông tin người dùng vào request
    next();
  });
}

module.exports = authenticateToken;
