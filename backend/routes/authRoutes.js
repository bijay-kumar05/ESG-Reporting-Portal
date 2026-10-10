const express = require("express");
const {
    login,
    register,
    getGroups,
    getSubsidiaries,
    getBusinessUnits
} = require("../controllers/authController");

const router = express.Router();

// Auth
router.post("/login",    login);
router.post("/register", register);

// Hierarchy dropdowns (no auth needed during registration)
router.get("/groups",         getGroups);
router.get("/subsidiaries",   getSubsidiaries);
router.get("/business-units", getBusinessUnits);

module.exports = router;