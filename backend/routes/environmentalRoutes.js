const express = require("express");

const router = express.Router();

const {
    saveEnvironmentalData,
    getEnvironmentalSummary,
    getEnvironmentalDetails,
    getEnvironmentalGHG
} = require("../controllers/environmentalController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


// =====================================================
// SAVE ENVIRONMENTAL DATA
// =====================================================

router.post(
    "/",
    authenticateToken,
    saveEnvironmentalData
);


// =====================================================
// GET ENVIRONMENTAL SUMMARY
// =====================================================

router.get(
    "/summary/:projectId/:year",
    authenticateToken,
    getEnvironmentalSummary
);


// =====================================================
// GET COMPLETE ENVIRONMENTAL DATA
// =====================================================

router.get(
    "/details/:projectId/:year",
    authenticateToken,
    getEnvironmentalDetails
);


// =====================================================
// GET GHG DATA
// =====================================================

router.get(
    "/ghg/:projectId/:year",
    authenticateToken,
    getEnvironmentalGHG
);


module.exports = router;