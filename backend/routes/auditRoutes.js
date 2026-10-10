const express = require("express");
const router = express.Router();

const {
    getAuditLogs,
    getAuditLogStats
} = require("../controllers/auditController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Get audit logs
router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "AUDITOR"),
    getAuditLogs
);

// Get audit statistics
router.get(
    "/stats",
    authenticateToken,
    authorizeRoles("ADMIN", "AUDITOR"),
    getAuditLogStats
);

module.exports = router;