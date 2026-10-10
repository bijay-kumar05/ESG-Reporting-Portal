const db = require("../config/db");

const getAuditLogs = (req, res) => {
    const sql = `
        SELECT
            id,
            user_id,
            action,
            module,
            project_id,
            reporting_year,
            old_value,
            new_value,
            description,
            created_at
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 100
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Audit logs error:", err);

            return res.status(500).json({
                message: "Failed to fetch audit logs",
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            logs: results
        });
    });
};

// Get audit log statistics
const getAuditLogStats = (req, res) => {
    const sql = `
        SELECT
            COUNT(*) AS totalLogs,
            COUNT(DISTINCT user_id) AS activeUsers,
            COALESCE(
                SUM(CASE
                    WHEN created_at >= CURRENT_DATE() THEN 1
                    ELSE 0
                END),
                0
            ) AS todayLogs,
            COALESCE(
                SUM(CASE
                    WHEN action LIKE '%UPDATE%'
                      OR action LIKE '%EDIT%'
                    THEN 1
                    ELSE 0
                END),
                0
            ) AS changeLogs
        FROM audit_logs
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Audit statistics error:", err.message);

            return res.status(500).json({
                message: "Failed to retrieve audit statistics"
            });
        }

        return res.status(200).json(results[0]);
    });
};

module.exports = { getAuditLogs,
                    getAuditLogStats };
                    