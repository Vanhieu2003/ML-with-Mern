
const jwt = require('jsonwebtoken');
const HttpError = require('../models/errorModel');

const authMiddleware = (req, res, next) => {
    // Lấy header Authorization từ request
    const Authorization = req.headers.authorization || req.headers.Authorization;

    // Kiểm tra xem header Authorization có tồn tại và bắt đầu bằng "Bearer"
    if (Authorization && Authorization.startsWith("Bearer ")) {
        // Lấy token từ header
        const token = Authorization.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Nếu có lỗi khi verify token, trả về lỗi 403
                return next(new HttpError("Unauthorized. Invalid token.", 403));
            }
            // Nếu token hợp lệ, gán thông tin user vào req.user
            req.user = decoded;
            next();
        });
    } else {
        // Nếu không có token, trả về lỗi 401
        return next(new HttpError("Unauthorized. No token.", 401));
    }
};

module.exports = authMiddleware;
