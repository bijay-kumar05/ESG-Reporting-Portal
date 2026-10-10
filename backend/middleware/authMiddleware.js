const jwt = require("jsonwebtoken");

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
    ADMIN:         4,
    GROUP:         3,
    SUBSIDIARY:    2,
    BUSINESS_UNIT: 1
};

// Verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Strict role check - user must have one of the listed roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Required role(s): ${allowedRoles.join(", ")}`
            });
        }
        next();
    };
};

// Minimum hierarchy level check (e.g. minRole("SUBSIDIARY") allows SUBSIDIARY, GROUP, ADMIN)
const authorizeMinRole = (minRole) => {
    return (req, res, next) => {
        const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
        const minLevel  = ROLE_HIERARCHY[minRole]       || 0;

        if (userLevel < minLevel) {
            return res.status(403).json({
                message: `Access denied. Minimum role required: ${minRole}`
            });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeMinRole
};