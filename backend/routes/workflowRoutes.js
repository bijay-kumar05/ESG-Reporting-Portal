const express = require("express");

const {
    saveDraft,
    getSubmission,
    submitReport,
    startReview,
    approveReport,
    rejectReport,
    lockReport
} = require("../controllers/workflowController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// Save draft
router.post(
    "/draft",
    authenticateToken,
    saveDraft
);


// Get submission status
router.get(
    "/:projectId/:year",
    authenticateToken,
    getSubmission
);


// Submit report
router.post(
    "/submit",
    authenticateToken,
    submitReport
);


// Start review
router.post(
    "/review",
    authenticateToken,
    startReview
);


// Approve
router.post(
    "/approve",
    authenticateToken,
    approveReport
);


// Reject
router.post(
    "/reject",
    authenticateToken,
    rejectReport
);


// Lock
router.post(
    "/lock",
    authenticateToken,
    lockReport
);


module.exports = router;