const db = require("../config/db");

const createAuditLog = ({
    userId = null,
    action,
    module,
    projectId = null,
    reportingYear = null,
    oldValue = null,
    newValue = null,
    description = null
}) => {
    const sql = `
        INSERT INTO audit_logs (
            user_id,
            action,
            module,
            project_id,
            reporting_year,
            old_value,
            new_value,
            description
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        userId,
        action,
        module,
        projectId,
        reportingYear,
        serializeValue(oldValue),
        serializeValue(newValue),
        description
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Audit log error:", err.message);
            return;
        }

        console.log(
            `Audit log created: ${action} | ${module} | ID: ${result.insertId}`
        );
    });
};

function serializeValue(value) {
    if (value === undefined || value === null) {
        return null;
    }

    if (typeof value === "object") {
        return JSON.stringify(value);
    }

    return String(value);
}

module.exports = createAuditLog;