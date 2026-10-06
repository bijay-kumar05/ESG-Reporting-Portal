const db = require("../config/db");


// =========================
// SAVE GOVERNANCE DATA
// =========================

const saveGovernanceData = (req, res) => {

    const {
        projectId,
        reportingYear,

        ethicsTrainingEmployees,
        antiCorruptionCases,
        briberyCases,

        whistleblowerComplaints,
        whistleblowerResolved,

        regulatoryActions,
        regulatoryPenalties,

        dataPrivacyIncidents,
        cybersecurityIncidents,

        customerComplaints,
        customerComplaintsResolved,

        governanceTrainingHours,

        boardMeetings,
        managementMeetings
    } = req.body;


    // Required fields

    if (!projectId || !reportingYear) {

        return res.status(400).json({
            message: "Project and reporting year are required"
        });

    }


    const sql = `
        INSERT INTO governance_data
        (
            project_id,
            reporting_year,

            ethics_training_employees,
            anti_corruption_cases,
            bribery_cases,

            whistleblower_complaints,
            whistleblower_resolved,

            regulatory_actions,
            regulatory_penalties,

            data_privacy_incidents,
            cybersecurity_incidents,

            customer_complaints,
            customer_complaints_resolved,

            governance_training_hours,

            board_meetings,
            management_meetings
        )

        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

            ethics_training_employees = VALUES(ethics_training_employees),
            anti_corruption_cases = VALUES(anti_corruption_cases),
            bribery_cases = VALUES(bribery_cases),

            whistleblower_complaints = VALUES(whistleblower_complaints),
            whistleblower_resolved = VALUES(whistleblower_resolved),

            regulatory_actions = VALUES(regulatory_actions),
            regulatory_penalties = VALUES(regulatory_penalties),

            data_privacy_incidents = VALUES(data_privacy_incidents),
            cybersecurity_incidents = VALUES(cybersecurity_incidents),

            customer_complaints = VALUES(customer_complaints),
            customer_complaints_resolved = VALUES(customer_complaints_resolved),

            governance_training_hours = VALUES(governance_training_hours),

            board_meetings = VALUES(board_meetings),
            management_meetings = VALUES(management_meetings)
    `;


    db.query(
        sql,
        [
            projectId,
            reportingYear,

            ethicsTrainingEmployees || 0,
            antiCorruptionCases || 0,
            briberyCases || 0,

            whistleblowerComplaints || 0,
            whistleblowerResolved || 0,

            regulatoryActions || 0,
            regulatoryPenalties || 0,

            dataPrivacyIncidents || 0,
            cybersecurityIncidents || 0,

            customerComplaints || 0,
            customerComplaintsResolved || 0,

            governanceTrainingHours || 0,

            boardMeetings || 0,
            managementMeetings || 0
        ],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "Failed to save governance data"
                });

            }


            res.status(201).json({

                message:
                    "Governance data saved successfully"

            });

        }
    );

};


// =========================
// GET GOVERNANCE DATA
// =========================

const getGovernanceData = (req, res) => {

    const {
        projectId,
        year
    } = req.params;


    const sql = `
        SELECT *
        FROM governance_data

        WHERE project_id = ?
        AND reporting_year = ?
    `;


    db.query(
        sql,
        [projectId, year],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "Failed to fetch governance data"
                });

            }


            if (results.length === 0) {

                return res.json(null);

            }


            res.json(results[0]);

        }
    );

};


// =========================
// GOVERNANCE SUMMARY
// =========================

const getGovernanceSummary = (req, res) => {

    const {
        projectId,
        year
    } = req.params;


    const sql = `
        SELECT *

        FROM governance_data

        WHERE project_id = ?
        AND reporting_year = ?
    `;


    db.query(
        sql,
        [projectId, year],

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message:
                        "Failed to calculate governance summary"
                });

            }


            if (results.length === 0) {

                return res.json({
                    message: "No governance data found",
                    data: null
                });

            }


            const data = results[0];


            // Whistleblower resolution

            let whistleblowerResolutionRate = 0;

            if (
                Number(data.whistleblower_complaints) > 0
            ) {

                whistleblowerResolutionRate =
                    (
                        Number(data.whistleblower_resolved) /
                        Number(data.whistleblower_complaints)
                    ) * 100;

            }


            // Customer complaint resolution

            let customerResolutionRate = 0;

            if (
                Number(data.customer_complaints) > 0
            ) {

                customerResolutionRate =
                    (
                        Number(data.customer_complaints_resolved) /
                        Number(data.customer_complaints)
                    ) * 100;

            }


            res.json({

                projectId: Number(projectId),

                reportingYear: Number(year),

                ethicsTrainingEmployees:
                    Number(
                        data.ethics_training_employees
                    ),

                antiCorruptionCases:
                    Number(
                        data.anti_corruption_cases
                    ),

                briberyCases:
                    Number(
                        data.bribery_cases
                    ),

                whistleblowerComplaints:
                    Number(
                        data.whistleblower_complaints
                    ),

                whistleblowerResolved:
                    Number(
                        data.whistleblower_resolved
                    ),

                whistleblowerResolutionRate:
                    Number(
                        whistleblowerResolutionRate.toFixed(2)
                    ),

                regulatoryActions:
                    Number(
                        data.regulatory_actions
                    ),

                regulatoryPenalties:
                    Number(
                        data.regulatory_penalties
                    ),

                dataPrivacyIncidents:
                    Number(
                        data.data_privacy_incidents
                    ),

                cybersecurityIncidents:
                    Number(
                        data.cybersecurity_incidents
                    ),

                customerComplaints:
                    Number(
                        data.customer_complaints
                    ),

                customerComplaintsResolved:
                    Number(
                        data.customer_complaints_resolved
                    ),

                customerResolutionRate:
                    Number(
                        customerResolutionRate.toFixed(2)
                    ),

                governanceTrainingHours:
                    Number(
                        data.governance_training_hours
                    ),

                boardMeetings:
                    Number(
                        data.board_meetings
                    ),

                managementMeetings:
                    Number(
                        data.management_meetings
                    )

            });

        }
    );

};


module.exports = {

    saveGovernanceData,

    getGovernanceData,

    getGovernanceSummary

};