const db = require("../config/db");

const createAuditLog = ({
    userId,
    action,
    module,
    projectId,
    reportingYear,
    oldValue,
    newValue,
    description
}) => {

    const sql = `
        INSERT INTO audit_logs
        (
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

    db.query(
        sql,
        [
            userId || null,
            action,
            module,
            projectId || null,
            reportingYear || null,
            oldValue || null,
            newValue || null,
            description || null
        ],
        (err) => {

            if (err) {
                console.error(
                    "Audit log error:",
                    err
                );
            }

        }
    );
};

module.exports = createAuditLog;