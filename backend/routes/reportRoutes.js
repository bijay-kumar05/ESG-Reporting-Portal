const express = require("express");

const {
    getESGReport,
    generateESGReportPDF,
    generateESGReportExcel
} = require("../controllers/reportController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// Get report data
router.get(
    "/:projectId/:year",
    authenticateToken,
    getESGReport
);


// Generate PDF
router.get(
    "/:projectId/:year/pdf",
    authenticateToken,
    generateESGReportPDF
);

router.get(
    "/:projectId/:year/excel",
    authenticateToken,
    generateESGReportExcel
);

module.exports = router;