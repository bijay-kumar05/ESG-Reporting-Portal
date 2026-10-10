const express = require("express");

const router = express.Router();

const {
    saveEnvironmentalData,
    getEnvironmentalSummary,
    getEnvironmentalDetails,
    getEnvironmentalGHG,
    getEnvironmentalDocuments,
    uploadEnvironmentalDocument,
    downloadEnvironmentalDocument,
    deleteEnvironmentalDocument,
    updateDocumentVerificationStatus,
    syncVerifiedEmissions
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


// =====================================================
// DOCUMENT VERIFICATION: GET DOCUMENTS FOR PROJECT & YEAR
// =====================================================

router.get(
    "/documents/:projectId/:year",
    authenticateToken,
    getEnvironmentalDocuments
);


// =====================================================
// DOCUMENT VERIFICATION: UPLOAD & VERIFY DOCUMENT
// =====================================================

router.post(
    "/documents",
    authenticateToken,
    uploadEnvironmentalDocument
);


// =====================================================
// DOCUMENT VERIFICATION: DOWNLOAD DOCUMENT
// =====================================================

router.get(
    "/documents/:id/download",
    authenticateToken,
    downloadEnvironmentalDocument
);


// =====================================================
// DOCUMENT VERIFICATION: DELETE DOCUMENT
// =====================================================

router.delete(
    "/documents/:id",
    authenticateToken,
    deleteEnvironmentalDocument
);


// =====================================================
// DOCUMENT VERIFICATION: UPDATE STATUS
// =====================================================

router.patch(
    "/documents/:id/verify",
    authenticateToken,
    updateDocumentVerificationStatus
);


// =====================================================
// SYNC VERIFIED FUEL EMISSIONS TO SCOPE 1
// =====================================================

router.post(
    "/sync-verified-emissions",
    authenticateToken,
    syncVerifiedEmissions
);


module.exports = router;