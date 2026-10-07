const db = require("../config/db");

const saveEnvironmentalData = (req, res) => {
    const {
        projectId,
        reportingYear,
        energyConsumption,
        renewableEnergy,
        waterConsumption,
        wasteGenerated,
        wasteRecycled,
        scope1,
        scope2,
        scope3
    } = req.body;

    if (!projectId || !reportingYear) {
        return res.status(400).json({
            message: "Project and reporting year are required"
        });
    }

    // First create/update the main environmental record
    const environmentalSql = `
        INSERT INTO environmental_data
        (
            project_id,
            reporting_year,
            energy_consumption,
            renewable_energy,
            water_consumption,
            waste_generated,
            waste_recycled
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            energy_consumption = VALUES(energy_consumption),
            renewable_energy = VALUES(renewable_energy),
            water_consumption = VALUES(water_consumption),
            waste_generated = VALUES(waste_generated),
            waste_recycled = VALUES(waste_recycled)
    `;

    db.query(
        environmentalSql,
        [
            projectId,
            reportingYear,
            energyConsumption || 0,
            renewableEnergy || 0,
            waterConsumption || 0,
            wasteGenerated || 0,
            wasteRecycled || 0
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to save environmental data"
                });
            }

            // Find the environmental record ID
            const findSql = `
                SELECT id
                FROM environmental_data
                WHERE project_id = ?
                AND reporting_year = ?
            `;

            db.query(
                findSql,
                [projectId, reportingYear],
                (err, results) => {

                    if (err || results.length === 0) {
                        console.error(err);

                        return res.status(500).json({
                            message: "Environmental record not found"
                        });
                    }

                    const environmentalDataId = results[0].id;

                    const scopes = [
                        {
                            type: "SCOPE_1",
                            data: scope1
                        },
                        {
                            type: "SCOPE_2",
                            data: scope2
                        },
                        {
                            type: "SCOPE_3",
                            data: scope3
                        }
                    ];

                    let completed = 0;

                    scopes.forEach((scope) => {

                        const ghg = scope.data || {};

                        const ghgSql = `
                            INSERT INTO environmental_ghg_emissions
                            (
                                environmental_data_id,
                                scope_type,
                                co2_tco2e,
                                ch4_tco2e,
                                n2o_tco2e,
                                hfcs_tco2e,
                                pfcs_tco2e,
                                sf6_tco2e,
                                nf3_tco2e
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                co2_tco2e = VALUES(co2_tco2e),
                                ch4_tco2e = VALUES(ch4_tco2e),
                                n2o_tco2e = VALUES(n2o_tco2e),
                                hfcs_tco2e = VALUES(hfcs_tco2e),
                                pfcs_tco2e = VALUES(pfcs_tco2e),
                                sf6_tco2e = VALUES(sf6_tco2e),
                                nf3_tco2e = VALUES(nf3_tco2e)
                        `;

                        db.query(
                            ghgSql,
                            [
                                environmentalDataId,
                                scope.type,
                                ghg.co2 || 0,
                                ghg.ch4 || 0,
                                ghg.n2o || 0,
                                ghg.hfcs || 0,
                                ghg.pfcs || 0,
                                ghg.sf6 || 0,
                                ghg.nf3 || 0
                            ],
                            (err) => {

                                if (err) {
                                    console.error(err);
                                }

                                completed++;

                                if (completed === scopes.length) {

                                    res.status(201).json({
                                        message:
                                            "Environmental data saved successfully"
                                    });

                                }

                            }
                        );

                    });

                }

            );

        }
    );
};


const getEnvironmentalData = (req, res) => {

    const {
        projectId,
        year
    } = req.params;

    const environmentalSql = `
        SELECT *
        FROM environmental_data
        WHERE project_id = ?
        AND reporting_year = ?
    `;

    db.query(
        environmentalSql,
        [projectId, year],
        (err, environmentalResults) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to fetch environmental data"
                });
            }

            if (environmentalResults.length === 0) {
                return res.json(null);
            }

            const environmentalData =
                environmentalResults[0];

            const ghgSql = `
                SELECT *
                FROM environmental_ghg_emissions
                WHERE environmental_data_id = ?
            `;

            db.query(
                ghgSql,
                [environmentalData.id],
                (err, ghgResults) => {

                    if (err) {
                        console.error(err);

                        return res.status(500).json({
                            message: "Failed to fetch GHG data"
                        });
                    }

                    res.json({
                        environmental: environmentalData,
                        ghg: ghgResults
                    });

                }
            );

        }
    );
};

const getEnvironmentalSummary = async(req, res) => {

    const { projectId, year } = req.params;

    const sql = `
        SELECT
            e.energy_consumption,
            e.renewable_energy,
            e.water_consumption,
            e.waste_generated,
            e.waste_recycled,

            COALESCE(SUM(
                CASE
                    WHEN g.scope_type = 'SCOPE_1'
                    THEN
                        g.co2_tco2e +
                        g.ch4_tco2e +
                        g.n2o_tco2e +
                        g.hfcs_tco2e +
                        g.pfcs_tco2e +
                        g.sf6_tco2e +
                        g.nf3_tco2e
                    ELSE 0
                END
            ), 0) AS scope1_total,

            COALESCE(SUM(
                CASE
                    WHEN g.scope_type = 'SCOPE_2'
                    THEN
                        g.co2_tco2e +
                        g.ch4_tco2e +
                        g.n2o_tco2e +
                        g.hfcs_tco2e +
                        g.pfcs_tco2e +
                        g.sf6_tco2e +
                        g.nf3_tco2e
                    ELSE 0
                END
            ), 0) AS scope2_total,

            COALESCE(SUM(
                CASE
                    WHEN g.scope_type = 'SCOPE_3'
                    THEN
                        g.co2_tco2e +
                        g.ch4_tco2e +
                        g.n2o_tco2e +
                        g.hfcs_tco2e +
                        g.pfcs_tco2e +
                        g.sf6_tco2e +
                        g.nf3_tco2e
                    ELSE 0
                END
            ), 0) AS scope3_total

        FROM environmental_data e

        LEFT JOIN environmental_ghg_emissions g
            ON e.id = g.environmental_data_id

        WHERE e.project_id = ?
        AND e.reporting_year = ?

        GROUP BY
            e.id,
            e.energy_consumption,
            e.renewable_energy,
            e.water_consumption,
            e.waste_generated,
            e.waste_recycled
    `;

    db.query(
        sql,
        [projectId, year],
        (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to calculate environmental summary"
                });
            }

            if (results.length === 0) {

                return res.json({
                    message: "No environmental data found",
                    data: null
                });

            }

            const data = results[0];

            const scope1 = Number(data.scope1_total);
            const scope2 = Number(data.scope2_total);
            const scope3 = Number(data.scope3_total);

            const totalGHG =
                scope1 +
                scope2 +
                scope3;

            res.json({

                projectId: Number(projectId),

                reportingYear: Number(year),

                energyConsumption:
                    Number(data.energy_consumption),

                renewableEnergy:
                    Number(data.renewable_energy),

                waterConsumption:
                    Number(data.water_consumption),

                wasteGenerated:
                    Number(data.waste_generated),

                wasteRecycled:
                    Number(data.waste_recycled),

                scope1: Number(scope1.toFixed(4)),

                scope2: Number(scope2.toFixed(4)),

                scope3: Number(scope3.toFixed(4)),

                totalGHG:
                    Number(totalGHG.toFixed(4))

            });

        }
    );
};

// =====================================================
// GET COMPLETE ENVIRONMENTAL DATA INCLUDING GHG
// =====================================================

const getEnvironmentalDetails = async (req, res) => {

    try {

        const { projectId, year } = req.params;

        // ---------------------------------------------
        // Get environmental data
        // ---------------------------------------------

        const [environmentalRows] = await db.promise().query(
            `
            SELECT
                id,
                project_id,
                reporting_year,
                energy_consumption,
                renewable_energy,
                water_consumption,
                waste_generated,
                waste_recycled
            FROM environmental_data
            WHERE project_id = ?
            AND reporting_year = ?
            LIMIT 1
            `,
            [projectId, year]
        );


        if (environmentalRows.length === 0) {

            return res.json({
                environmental: null,
                scope1: null,
                scope2: null,
                scope3: null
            });

        }


        const environmental =
            environmentalRows[0];


        // ---------------------------------------------
        // Get GHG emissions
        // ---------------------------------------------

        const [ghgRows] = await db.promise().query(
            `
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
            WHERE environmental_data_id = ?
            ORDER BY scope_type
            `,
            [environmental.id]
        );


        // ---------------------------------------------
        // Find each scope
        // ---------------------------------------------

        const scope1Row =
            ghgRows.find(
                row => row.scope_type === "SCOPE_1"
            );

        const scope2Row =
            ghgRows.find(
                row => row.scope_type === "SCOPE_2"
            );

        const scope3Row =
            ghgRows.find(
                row => row.scope_type === "SCOPE_3"
            );


        // ---------------------------------------------
        // Convert DB row to frontend format
        // ---------------------------------------------

        const convertScope = (row) => {

            if (!row) {
                return null;
            }

            return {

                co2:
                    row.co2_tco2e ?? "",

                ch4:
                    row.ch4_tco2e ?? "",

                n2o:
                    row.n2o_tco2e ?? "",

                hfcs:
                    row.hfcs_tco2e ?? "",

                pfcs:
                    row.pfcs_tco2e ?? "",

                sf6:
                    row.sf6_tco2e ?? "",

                nf3:
                    row.nf3_tco2e ?? ""
            };
        };


        // ---------------------------------------------
        // Response
        // ---------------------------------------------

        res.json({

            environmental: environmental,

            scope1: convertScope(scope1Row),

            scope2: convertScope(scope2Row),

            scope3: convertScope(scope3Row)

        });

    } catch (error) {

        console.error(
            "Error fetching environmental details:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch environmental details"
        });

    }

};

const getEnvironmentalGHG = async (req, res) => {
    try {
        const { projectId, year } = req.params;

        const [rows] = await db.promise().query(
            `
            SELECT
                g.scope_type,
                g.co2_tco2e,
                g.ch4_tco2e,
                g.n2o_tco2e,
                g.hfcs_tco2e,
                g.pfcs_tco2e,
                g.sf6_tco2e,
                g.nf3_tco2e
            FROM environmental_ghg_emissions g
            INNER JOIN environmental_data e
                ON g.environmental_data_id = e.id
            WHERE e.project_id = ?
            AND e.reporting_year = ?
            ORDER BY g.scope_type
            `,
            [projectId, year]
        );

        res.json(rows);

    } catch (error) {
        console.error(
            "Error fetching GHG data:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch GHG data"
        });
    }
};

module.exports = {
    saveEnvironmentalData,
    getEnvironmentalSummary,
    getEnvironmentalDetails,
    getEnvironmentalGHG
};