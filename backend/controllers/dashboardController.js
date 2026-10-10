const db = require("../config/db");

const getDashboardStats = (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM projects)
                AS totalProjects,

            (SELECT COUNT(*)
             FROM esg_submissions
             WHERE status IN (
                 'SUBMITTED',
                 'UNDER_REVIEW',
                 'APPROVED',
                 'LOCKED'
             )) AS esgSubmissions,

            (SELECT COUNT(*)
             FROM esg_submissions
             WHERE status IN (
                 'SUBMITTED',
                 'UNDER_REVIEW'
             )) AS pendingReview,

            (SELECT COUNT(*)
             FROM esg_submissions
             WHERE status = 'APPROVED') AS approvedReports,

            (SELECT COUNT(*)
             FROM report_generation_logs) AS reportsGenerated
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Dashboard statistics error:", err);

            return res.status(500).json({
                message: "Failed to fetch dashboard statistics"
            });
        }

        return res.json(results[0]);
    });
};

module.exports = {
    getDashboardStats
};