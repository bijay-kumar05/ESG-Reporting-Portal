const db = require("../config/db");
const createAuditLog = require("../utils/auditLogger");
// --------------------------------------------------
// CREATE / SAVE DRAFT
// --------------------------------------------------

// validation for submit
const {
    validateESGData
} = require("../services/validationService");

const saveDraft = (req, res) => {

    const {
        projectId,
        reportingYear
    } = req.body;

    if (!projectId || !reportingYear) {
        return res.status(400).json({
            message: "Project and reporting year are required"
        });
    }

    const sql = `
        INSERT INTO esg_submissions
        (
            project_id,
            reporting_year,
            status
        )
        VALUES (?, ?, 'DRAFT')

        ON DUPLICATE KEY UPDATE
            status = CASE
                WHEN status IN ('DRAFT', 'REJECTED')
                THEN 'DRAFT'
                ELSE status
            END
    `;

    db.query(
        sql,
        [projectId, reportingYear],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to save draft"
                });
            }
// draft submission
            createAuditLog({
    userId: req.user.id,
    action: "CREATE_DRAFT",
    module: "WORKFLOW",
    projectId,
    reportingYear,
    oldValue: null,
    newValue: "DRAFT",
    description:
        "ESG reporting draft created"
});

res.json({
    message: "Draft saved successfully"
});
        }
    );
};


// --------------------------------------------------
// GET SUBMISSION STATUS
// --------------------------------------------------

const getSubmission = (req, res) => {

    const {
        projectId,
        year
    } = req.params;

    const sql = `
        SELECT
            s.*,
            p.project_name,
            u1.name AS submitted_by_name,
            u2.name AS reviewed_by_name

        FROM esg_submissions s

        LEFT JOIN projects p
            ON s.project_id = p.id

        LEFT JOIN users u1
            ON s.submitted_by = u1.id

        LEFT JOIN users u2
            ON s.reviewed_by = u2.id

        WHERE s.project_id = ?
        AND s.reporting_year = ?
    `;

    db.query(
        sql,
        [projectId, year],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to fetch submission"
                });
            }

            if (results.length === 0) {

                return res.json({
                    data: null
                });

            }

            res.json(results[0]);
        }
    );
};



// SUBMIT REPORT
// --------------------------------------------------

const submitReport = async (req, res) => {

    const {
        projectId,
        reportingYear
    } = req.body;

    if (!projectId || !reportingYear) {

        return res.status(400).json({
            message:
                "Project and reporting year are required"
        });

    }

    try {

        // -----------------------------------------
        // VALIDATE ESG DATA
        // -----------------------------------------

        const validationErrors =
            await validateESGData(
                projectId,
                reportingYear
            );


        if (validationErrors.length > 0) {

            return res.status(400).json({

                message:
                    "ESG validation failed",

                errors:
                    validationErrors

            });

        }


        // -----------------------------------------
        // SUBMIT REPORT
        // -----------------------------------------

        const sql = `
            UPDATE esg_submissions

            SET
                status = 'SUBMITTED',
                submitted_by = ?,
                submitted_at = CURRENT_TIMESTAMP

            WHERE project_id = ?
            AND reporting_year = ?
            AND status IN ('DRAFT', 'REJECTED')
        `;


        db.query(
            sql,
            [
                req.user.id,
                projectId,
                reportingYear
            ],
            (err, result) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        message:
                            "Failed to submit report"
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(400).json({
                        message:
                            "Report cannot be submitted in its current status"
                    });

                }


                // -----------------------------------------
                // AUDIT LOG
                // -----------------------------------------

                createAuditLog({

                    userId:
                        req.user.id,

                    action:
                        "SUBMIT_REPORT",

                    module:
                        "WORKFLOW",

                    projectId,

                    reportingYear,

                    oldValue:
                        "DRAFT/REJECTED",

                    newValue:
                        "SUBMITTED",

                    description:
                        "ESG report submitted after successful validation"

                });


                res.json({

                    message:
                        "Report submitted successfully"

                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({

            message:
                "Failed to validate ESG report"

        });

    }

};


// --------------------------------------------------
// START REVIEW
// --------------------------------------------------

const startReview = (req, res) => {

    const {
        projectId,
        reportingYear
    } = req.body;

    const sql = `
        UPDATE esg_submissions

        SET
            status = 'UNDER_REVIEW',
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP

        WHERE project_id = ?
        AND reporting_year = ?
        AND status = 'SUBMITTED'
    `;

    db.query(
        sql,
        [
            req.user.id,
            projectId,
            reportingYear
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to start review"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(400).json({
                    message:
                        "Report is not available for review"
                });

            }
// audit review
            createAuditLog({
    userId: req.user.id,
    action: "START_REVIEW",
    module: "WORKFLOW",
    projectId,
    reportingYear,
    oldValue: "SUBMITTED",
    newValue: "UNDER_REVIEW",
    description: "ESG report review started"
});

res.json({
    message: "Review started successfully"
});
        }
    );
};


// --------------------------------------------------
// APPROVE REPORT
// --------------------------------------------------

const approveReport = (req, res) => {

    const {
        projectId,
        reportingYear,
        comments
    } = req.body;

    const sql = `
        UPDATE esg_submissions

        SET
            status = 'APPROVED',
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            reviewer_comments = ?

        WHERE project_id = ?
        AND reporting_year = ?
        AND status = 'UNDER_REVIEW'
    `;

    db.query(
        sql,
        [
            req.user.id,
            comments || null,
            projectId,
            reportingYear
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to approve report"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(400).json({
                    message:
                        "Only reports under review can be approved"
                });

            }
// audit approval
            createAuditLog({
    userId: req.user.id,
    action: "APPROVE_REPORT",
    module: "WORKFLOW",
    projectId,
    reportingYear,
    oldValue: "UNDER_REVIEW",
    newValue: "APPROVED",
    description:
        comments ||
        "ESG report approved"
});

res.json({
    message: "Report approved successfully"
});
        }
    );
};


// --------------------------------------------------
// REJECT REPORT
// --------------------------------------------------

const rejectReport = (req, res) => {

    const {
        projectId,
        reportingYear,
        reason
    } = req.body;

    if (!reason) {
        return res.status(400).json({
            message: "Rejection reason is required"
        });
    }

    const sql = `
        UPDATE esg_submissions

        SET
            status = 'REJECTED',
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            rejection_reason = ?

        WHERE project_id = ?
        AND reporting_year = ?
        AND status = 'UNDER_REVIEW'
    `;

    db.query(
        sql,
        [
            req.user.id,
            reason,
            projectId,
            reportingYear
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to reject report"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(400).json({
                    message:
                        "Only reports under review can be rejected"
                });

            }
// report rejection
            createAuditLog({
    userId: req.user.id,
    action: "REJECT_REPORT",
    module: "WORKFLOW",
    projectId,
    reportingYear,
    oldValue: "UNDER_REVIEW",
    newValue: "REJECTED",
    description: reason
});

res.json({
    message: "Report rejected successfully"
});
        }
    );
};


// --------------------------------------------------
// LOCK APPROVED REPORT
// --------------------------------------------------

const lockReport = (req, res) => {

    const {
        projectId,
        reportingYear
    } = req.body;

    const sql = `
        UPDATE esg_submissions

        SET
            status = 'LOCKED'

        WHERE project_id = ?
        AND reporting_year = ?
        AND status = 'APPROVED'
    `;

    db.query(
        sql,
        [
            projectId,
            reportingYear
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to lock report"
                });
            }

            if (result.affectedRows === 0) {

                return res.status(400).json({
                    message:
                        "Only approved reports can be locked"
                });

            }
// report locking
            createAuditLog({
    userId: req.user.id,
    action: "LOCK_REPORT",
    module: "WORKFLOW",
    projectId,
    reportingYear,
    oldValue: "APPROVED",
    newValue: "LOCKED",
    description:
        "ESG report permanently locked"
});

res.json({
    message: "Report locked successfully"
});
        }
    );
};


module.exports = {
    saveDraft,
    getSubmission,
    submitReport,
    startReview,
    approveReport,
    rejectReport,
    lockReport
};