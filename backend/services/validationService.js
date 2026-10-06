const db = require("../config/db");

const validateEnvironmentalData = (projectId, year) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                energy_consumption,
                renewable_energy,
                water_consumption,
                waste_generated,
                waste_recycled
            FROM environmental_data
            WHERE project_id = ?
            AND reporting_year = ?
        `;

        db.query(
            sql,
            [projectId, year],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                const errors = [];

                if (results.length === 0) {
                    errors.push(
                        "Environmental data has not been entered"
                    );

                    return resolve(errors);
                }

                const data = results[0];

                const fields = {
                    "Energy consumption":
                        data.energy_consumption,

                    "Renewable energy":
                        data.renewable_energy,

                    "Water consumption":
                        data.water_consumption,

                    "Waste generated":
                        data.waste_generated,

                    "Waste recycled":
                        data.waste_recycled
                };

                Object.entries(fields).forEach(
                    ([name, value]) => {

                        if (Number(value) < 0) {
                            errors.push(
                                `${name} cannot be negative`
                            );
                        }

                    }
                );

                if (
                    Number(data.renewable_energy) >
                    Number(data.energy_consumption)
                ) {

                    errors.push(
                        "Renewable energy cannot exceed total energy consumption"
                    );

                }

                if (
                    Number(data.waste_recycled) >
                    Number(data.waste_generated)
                ) {

                    errors.push(
                        "Waste recycled cannot exceed waste generated"
                    );

                }

                resolve(errors);

            }
        );

    });

};


// --------------------------------------------------
// SOCIAL VALIDATION
// --------------------------------------------------

const validateSocialData = (projectId, year) => {

    return new Promise((resolve, reject) => {

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
                    return reject(err);
                }

                const errors = [];

                if (results.length === 0) {

                    errors.push(
                        "Social data has not been entered"
                    );

                    return resolve(errors);

                }

                const data = results[0];

                // Negative value validation

                const numericFields = [
                    "total_employees",
                    "male_employees",
                    "female_employees",
                    "other_gender_employees",
                    "permanent_employees",
                    "contractual_employees",
                    "employees_trained",
                    "training_hours",
                    "workplace_accidents",
                    "fatalities",
                    "lost_time_injuries",
                    "employee_grievances",
                    "grievances_resolved",
                    "community_investment"
                ];

                numericFields.forEach((field) => {

                    if (Number(data[field]) < 0) {

                        errors.push(
                            `${field.replaceAll("_", " ")} cannot be negative`
                        );

                    }

                });


                // Employee consistency

                const genderTotal =
                    Number(data.male_employees) +
                    Number(data.female_employees) +
                    Number(data.other_gender_employees);

                if (
                    genderTotal >
                    Number(data.total_employees)
                ) {

                    errors.push(
                        "Male + female + other employees cannot exceed total employees"
                    );

                }


                const employmentTotal =
                    Number(data.permanent_employees) +
                    Number(data.contractual_employees);

                if (
                    employmentTotal >
                    Number(data.total_employees)
                ) {

                    errors.push(
                        "Permanent + contractual employees cannot exceed total employees"
                    );

                }


                if (
                    Number(data.employees_trained) >
                    Number(data.total_employees)
                ) {

                    errors.push(
                        "Employees trained cannot exceed total employees"
                    );

                }


                if (
                    Number(data.grievances_resolved) >
                    Number(data.employee_grievances)
                ) {

                    errors.push(
                        "Resolved grievances cannot exceed grievances received"
                    );

                }


                if (
                    Number(data.fatalities) >
                    Number(data.workplace_accidents)
                ) {

                    errors.push(
                        "Fatalities cannot exceed workplace accidents"
                    );

                }


                if (
                    Number(data.lost_time_injuries) >
                    Number(data.workplace_accidents)
                ) {

                    errors.push(
                        "Lost-time injuries cannot exceed workplace accidents"
                    );

                }

                resolve(errors);

            }
        );

    });

};


// --------------------------------------------------
// GOVERNANCE VALIDATION
// --------------------------------------------------

const validateGovernanceData = (
    projectId,
    year
) => {

    return new Promise((resolve, reject) => {

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
                    return reject(err);
                }

                const errors = [];

                if (results.length === 0) {

                    errors.push(
                        "Governance data has not been entered"
                    );

                    return resolve(errors);

                }

                const data = results[0];


                const numericFields = [
                    "ethics_training_employees",
                    "anti_corruption_cases",
                    "bribery_cases",
                    "whistleblower_complaints",
                    "whistleblower_resolved",
                    "regulatory_actions",
                    "regulatory_penalties",
                    "data_privacy_incidents",
                    "cybersecurity_incidents",
                    "customer_complaints",
                    "customer_complaints_resolved",
                    "governance_training_hours",
                    "board_meetings",
                    "management_meetings"
                ];


                numericFields.forEach((field) => {

                    if (Number(data[field]) < 0) {

                        errors.push(
                            `${field.replaceAll("_", " ")} cannot be negative`
                        );

                    }

                });


                if (
                    Number(data.whistleblower_resolved) >
                    Number(data.whistleblower_complaints)
                ) {

                    errors.push(
                        "Resolved whistleblower complaints cannot exceed complaints received"
                    );

                }


                if (
                    Number(data.customer_complaints_resolved) >
                    Number(data.customer_complaints)
                ) {

                    errors.push(
                        "Resolved customer complaints cannot exceed complaints received"
                    );

                }

                resolve(errors);

            }
        );

    });

};


// --------------------------------------------------
// COMPLETE ESG VALIDATION
// --------------------------------------------------

const validateESGData = async (
    projectId,
    year
) => {

    const errors = [];

    try {

        const environmentalErrors =
            await validateEnvironmentalData(
                projectId,
                year
            );

        errors.push(...environmentalErrors);


        const socialErrors =
            await validateSocialData(
                projectId,
                year
            );

        errors.push(...socialErrors);


        const governanceErrors =
            await validateGovernanceData(
                projectId,
                year
            );

        errors.push(...governanceErrors);


        return errors;

    } catch (error) {

        console.error(
            "ESG validation error:",
            error
        );

        throw error;

    }

};


module.exports = {
    validateEnvironmentalData,
    validateSocialData,
    validateGovernanceData,
    validateESGData
};