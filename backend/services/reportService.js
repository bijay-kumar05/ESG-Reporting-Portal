const db = require("../config/db");

const getReportData = (projectId, year) => {
    return new Promise((resolve, reject) => {

        const report = {};

        // ------------------------------------------------
        // 1. PROJECT INFORMATION
        // ------------------------------------------------

        const projectSQL = `
            SELECT
                id,
                project_name,
                organization,
                business_unit,
                location,
                project_manager,
                reporting_year,
                status
            FROM projects
            WHERE id = ?
        `;

        db.query(projectSQL, [projectId], (err, projectResults) => {

            if (err) {
                return reject(err);
            }

            if (projectResults.length === 0) {
                return reject(
                    new Error("Project not found")
                );
            }

            report.project = projectResults[0];

            // ------------------------------------------------
            // 2. BRSR GENERAL DISCLOSURES
            // ------------------------------------------------

            const generalSQL = `
                SELECT
                    id,
                    organization_id,
                    cin,
                    entity_name,
                    year_of_incorporation,
                    registered_office_address,
                    corporate_address,
                    email,
                    telephone,
                    website,
                    reporting_financial_year,
                    stock_exchange,
                    paid_up_capital,
                    contact_person_name,
                    contact_person_telephone,
                    contact_person_email,
                    reporting_boundary
                FROM brsr_general_disclosures
                WHERE reporting_financial_year = ?
                ORDER BY id DESC
                LIMIT 1
            `;

            db.query(
                generalSQL,
                [String(year) === "2026" ? "2025-26" : year],
                (err, generalResults) => {

                    if (err) {
                        return reject(err);
                    }

                    report.generalDisclosures =
                        generalResults[0] || null;

                    // ------------------------------------------------
                    // 3. ENVIRONMENTAL DATA
                    // ------------------------------------------------

                    const environmentalSQL = `
                        SELECT *
                        FROM environmental_data
                        WHERE project_id = ?
                        AND reporting_year = ?
                    `;

                    db.query(
                        environmentalSQL,
                        [projectId, year],
                        (err, environmentalResults) => {

                            if (err) {
                                return reject(err);
                            }

                            report.environmental =
                                environmentalResults[0] || null;

                            // ------------------------------------------------
                            // 4. GHG EMISSIONS
                            // ------------------------------------------------

                            const ghgSQL = `
                                SELECT
                                    scope_type,
                                    co2_tco2e,
                                    ch4_tco2e,
                                    n2o_tco2e,
                                    hfcs_tco2e,
                                    pfcs_tco2e,
                                    sf6_tco2e,
                                    nf3_tco2e
                                FROM environmental_ghg_emissions
                                WHERE environmental_data_id = (
                                    SELECT id
                                    FROM environmental_data
                                    WHERE project_id = ?
                                    AND reporting_year = ?
                                )
                                ORDER BY scope_type
                            `;

                            db.query(
                                ghgSQL,
                                [projectId, year],
                                (err, ghgResults) => {

                                    if (err) {
                                        return reject(err);
                                    }

                                    report.ghg = ghgResults;

                                    // ------------------------------------------------
                                    // 5. SOCIAL DATA
                                    // ------------------------------------------------

                                    const socialSQL = `
                                        SELECT *
                                        FROM social_data
                                        WHERE project_id = ?
                                        AND reporting_year = ?
                                    `;

                                    db.query(
                                        socialSQL,
                                        [projectId, year],
                                        (err, socialResults) => {

                                            if (err) {
                                                return reject(err);
                                            }

                                            report.social =
                                                socialResults[0] || null;

                                            // ------------------------------------------------
                                            // 6. GOVERNANCE DATA
                                            // ------------------------------------------------

                                            const governanceSQL = `
                                                SELECT *
                                                FROM governance_data
                                                WHERE project_id = ?
                                                AND reporting_year = ?
                                            `;

                                            db.query(
                                                governanceSQL,
                                                [projectId, year],
                                                (err, governanceResults) => {

                                                    if (err) {
                                                        return reject(err);
                                                    }

                                                    report.governance =
                                                        governanceResults[0] || null;

                                                    // ------------------------------------------------
                                                    // 7. WORKFLOW STATUS
                                                    // ------------------------------------------------

                                                    const workflowSQL = `
                                                        SELECT
                                                            status,
                                                            submitted_at,
                                                            reviewed_at,
                                                            rejection_reason,
                                                            reviewer_comments
                                                        FROM esg_submissions
                                                        WHERE project_id = ?
                                                        AND reporting_year = ?
                                                    `;

                                                    db.query(
                                                        workflowSQL,
                                                        [projectId, year],
                                                        (err, workflowResults) => {

                                                            if (err) {
                                                                return reject(err);
                                                            }

                                                            report.workflow =
                                                                workflowResults[0] || null;

                                                            // ------------------------------------------------
                                                            // 8. AUDIT TRAIL
                                                            // ------------------------------------------------

                                                            const auditSQL = `
                                                                SELECT
                                                                    a.id,
                                                                    a.user_id,
                                                                    u.name AS user_name,
                                                                    a.action,
                                                                    a.module,
                                                                    a.project_id,
                                                                    a.reporting_year,
                                                                    a.old_value,
                                                                    a.new_value,
                                                                    a.description,
                                                                    a.created_at
                                                                FROM audit_logs a
                                                                LEFT JOIN users u
                                                                    ON a.user_id = u.id
                                                                WHERE a.project_id = ?
                                                                AND a.reporting_year = ?
                                                                ORDER BY a.created_at ASC
                                                            `;

                                                            db.query(
                                                                auditSQL,
                                                                [projectId, year],
                                                                (err, auditResults) => {

                                                                    if (err) {
                                                                        return reject(err);
                                                                    }

                                                                    report.auditLogs =
                                                                        auditResults;

                                                                    resolve(report);
                                                                }
                                                            );

                                                        }
                                                    );

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        });
    });
};

module.exports = {
    getReportData
};