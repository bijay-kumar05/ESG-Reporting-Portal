const express = require("express");

const {
    saveSocialData,
    getSocialData,
    getSocialSummary
} = require("../controllers/socialController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// Save Social ESG data

router.post(
    "/",
    authenticateToken,
    saveSocialData
);


// Get Social ESG data

router.get(
    "/:projectId/:year",
    authenticateToken,
    getSocialData
);


// Get Social ESG summary

router.get(
    "/summary/:projectId/:year",
    authenticateToken,
    getSocialSummary
);


module.exports = router;