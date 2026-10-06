const express = require("express");

const {
    createProject,
    getProjects,
    getProjectCount
} = require("../controllers/projectController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticateToken,
    createProject
);

router.get(
    "/",
    authenticateToken,
    getProjects
);

// Project count
router.get(
    "/count",
    authenticateToken,
    getProjectCount
);

module.exports = router;