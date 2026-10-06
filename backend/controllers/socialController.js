const db = require("../config/db");


// ==========================================
// SAVE SOCIAL DATA
// ==========================================

const saveSocialData = (req, res) => {

    const {
        projectId,
        reportingYear,

        totalEmployees,
        maleEmployees,
        femaleEmployees,
        otherGenderEmployees,

        permanentEmployees,
        contractualEmployees,

        employeesTrained,
        trainingHours,

        workplaceAccidents,
        fatalities,
        lostTimeInjuries,

        employeeGrievances,
        grievancesResolved,

        communityInvestment
    } = req.body;


    // Basic validation
    if (!projectId || !reportingYear) {

        return res.status(400).json({
            message: "Project and reporting year are required"
        });

    }


    const sql = `
        INSERT INTO social_data
        (
            project_id,
            reporting_year,

            total_employees,
            male_employees,
            female_employees,
            other_gender_employees,

            permanent_employees,
            contractual_employees,

            employees_trained,
            training_hours,

            workplace_accidents,
            fatalities,
            lost_time_injuries,

            employee_grievances,
            grievances_resolved,

            community_investment
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        ON DUPLICATE KEY UPDATE

            total_employees = VALUES(total_employees),
            male_employees = VALUES(male_employees),
            female_employees = VALUES(female_employees),
            other_gender_employees = VALUES(other_gender_employees),

            permanent_employees = VALUES(permanent_employees),
            contractual_employees = VALUES(contractual_employees),

            employees_trained = VALUES(employees_trained),
            training_hours = VALUES(training_hours),

            workplace_accidents = VALUES(workplace_accidents),
            fatalities = VALUES(fatalities),
            lost_time_injuries = VALUES(lost_time_injuries),

            employee_grievances = VALUES(employee_grievances),
            grievances_resolved = VALUES(grievances_resolved),

            community_investment = VALUES(community_investment)
    `;


    db.query(
        sql,
        [
            projectId,
            reportingYear,

            totalEmployees || 0,
            maleEmployees || 0,
            femaleEmployees || 0,
            otherGenderEmployees || 0,

            permanentEmployees || 0,
            contractualEmployees || 0,

            employeesTrained || 0,
            trainingHours || 0,

            workplaceAccidents || 0,
            fatalities || 0,
            lostTimeInjuries || 0,

            employeeGrievances || 0,
            grievancesResolved || 0,

            communityInvestment || 0
        ],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    message: "Failed to save social data"
                });

            }


            res.status(201).json({
                message: "Social data saved successfully"
            });

        }
    );
};



// ==========================================
// GET SOCIAL DATA
// ==========================================

const getSocialData = (req, res) => {

    const {
        projectId,
        year
    } = req.params;


    const sql = `
        SELECT *
        FROM social_data

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
                    message: "Failed to fetch social data"
                });

            }


            if (results.length === 0) {

                return res.json(null);

            }


            res.json(results[0]);

        }
    );
};



// ==========================================
// SOCIAL SUMMARY
// ==========================================

const getSocialSummary = (req, res) => {

    const {
        projectId,
        year
    } = req.params;


    const sql = `
        SELECT

            total_employees,
            male_employees,
            female_employees,
            other_gender_employees,

            permanent_employees,
            contractual_employees,

            employees_trained,
            training_hours,

            workplace_accidents,
            fatalities,
            lost_time_injuries,

            employee_grievances,
            grievances_resolved,

            community_investment

        FROM social_data

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
                    message: "Failed to calculate social summary"
                });

            }


            if (results.length === 0) {

                return res.json({
                    message: "No social data found",
                    data: null
                });

            }


            const data = results[0];


            const totalEmployees =
                Number(data.total_employees);

            const maleEmployees =
                Number(data.male_employees);

            const femaleEmployees =
                Number(data.female_employees);

            const otherGenderEmployees =
                Number(data.other_gender_employees);


            // Gender percentages

            const malePercentage =
                totalEmployees > 0
                    ? (maleEmployees / totalEmployees) * 100
                    : 0;

            const femalePercentage =
                totalEmployees > 0
                    ? (femaleEmployees / totalEmployees) * 100
                    : 0;

            const otherGenderPercentage =
                totalEmployees > 0
                    ? (otherGenderEmployees / totalEmployees) * 100
                    : 0;


            // Grievance resolution percentage

            const grievances =
                Number(data.employee_grievances);

            const resolved =
                Number(data.grievances_resolved);

            const grievanceResolutionRate =
                grievances > 0
                    ? (resolved / grievances) * 100
                    : 0;


            res.json({

                projectId: Number(projectId),

                reportingYear: Number(year),

                totalEmployees,

                maleEmployees,

                femaleEmployees,

                otherGenderEmployees,

                malePercentage:
                    Number(malePercentage.toFixed(2)),

                femalePercentage:
                    Number(femalePercentage.toFixed(2)),

                otherGenderPercentage:
                    Number(otherGenderPercentage.toFixed(2)),

                permanentEmployees:
                    Number(data.permanent_employees),

                contractualEmployees:
                    Number(data.contractual_employees),

                employeesTrained:
                    Number(data.employees_trained),

                trainingHours:
                    Number(data.training_hours),

                workplaceAccidents:
                    Number(data.workplace_accidents),

                fatalities:
                    Number(data.fatalities),

                lostTimeInjuries:
                    Number(data.lost_time_injuries),

                employeeGrievances:
                    grievances,

                grievancesResolved:
                    resolved,

                grievanceResolutionRate:
                    Number(
                        grievanceResolutionRate.toFixed(2)
                    ),

                communityInvestment:
                    Number(data.community_investment)

            });

        }
    );
};



module.exports = {
    saveSocialData,
    getSocialData,
    getSocialSummary
};