const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Support both JWT_SECRET and JWT_SECRET_KEY for compatibility
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers && req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized access" });
    }

    if (!JWT_SECRET_KEY) {
        console.error('JWT secret not configured. Set JWT_SECRET_KEY in environment.');
        return res.status(500).json({ message: 'Server misconfiguration' });
    }

    // Bearer token support
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token is not valid" });
        }
        req.userId = decoded._id;
        next();
    });
}

module.exports = authenticateToken;