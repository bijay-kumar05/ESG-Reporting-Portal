const express = require("express");

const router = express.Router();

const {
    saveGeneralDisclosures,
    getGeneralDisclosures
} = require("../controllers/brsrController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");


// Save / Update BRSR General Disclosures
router.post(
    "/general",
    authenticateToken,
    saveGeneralDisclosures
);


// Get BRSR General Disclosures
router.get(
    "/general/:projectId/:year",
    authenticateToken,
    getGeneralDisclosures
);


module.exports = router;