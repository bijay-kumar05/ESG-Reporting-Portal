const express = require("express");

const {
    saveGovernanceData,
    getGovernanceData,
    getGovernanceSummary
} = require("../controllers/governanceController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


const router = express.Router();


// Save governance data

router.post(
    "/",
    authenticateToken,
    saveGovernanceData
);


// Governance summary
// Keep this BEFORE the generic route.

router.get(
    "/summary/:projectId/:year",
    authenticateToken,
    getGovernanceSummary
);


// Get existing governance data

router.get(
    "/:projectId/:year",
    authenticateToken,
    getGovernanceData
);


module.exports = router;