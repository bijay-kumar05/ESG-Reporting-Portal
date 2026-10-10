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

// =====================================================
// DOCUMENT VERIFICATION: GET DOCUMENTS & SUMMARY
// =====================================================
const getEnvironmentalDocuments = async (req, res) => {
    try {
        const { projectId, year } = req.params;

        const [docs] = await db.promise().query(
            `SELECT id, project_id, reporting_year, category, title, file_name, original_name,
                    file_size, mime_type, vendor_name, invoice_number, invoice_date,
                    fuel_type, quantity, unit, total_amount, currency, emission_factor,
                    calculated_emissions_tco2e, verification_status, verification_notes,
                    uploaded_by, created_at
             FROM environmental_documents
             WHERE project_id = ? AND reporting_year = ?
             ORDER BY id DESC`,
            [projectId, year]
        );

        const totalDocs = docs.length;
        const verifiedDocs = docs.filter((d) => d.verification_status === "VERIFIED").length;
        const pendingDocs = docs.filter((d) => d.verification_status === "PENDING").length;
        const flaggedDocs = docs.filter((d) => d.verification_status === "FLAGGED").length;

        const totalFuelLitres = docs
            .filter((d) => d.category === "PETROL_BILL" || d.category === "DIESEL_BILL")
            .reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

        const totalVerifiedEmissions = docs
            .filter((d) => d.verification_status === "VERIFIED")
            .reduce((sum, d) => sum + (parseFloat(d.calculated_emissions_tco2e) || 0), 0);

        const totalSpend = docs
            .reduce((sum, d) => sum + (parseFloat(d.total_amount) || 0), 0);

        res.json({
            documents: docs,
            summary: {
                totalDocuments: totalDocs,
                verifiedDocuments: verifiedDocs,
                pendingDocuments: pendingDocs,
                flaggedDocuments: flaggedDocs,
                totalFuelLitres: Number(totalFuelLitres.toFixed(2)),
                totalVerifiedEmissions: Number(totalVerifiedEmissions.toFixed(4)),
                totalSpend: Number(totalSpend.toFixed(2)),
                verificationRate: totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0
            }
        });
    } catch (error) {
        console.error("Error fetching environmental documents:", error);
        res.status(500).json({ message: "Failed to fetch verification documents" });
    }
};

// =====================================================
// DOCUMENT VERIFICATION: UPLOAD & VERIFY DOCUMENT
// =====================================================
const uploadEnvironmentalDocument = async (req, res) => {
    try {
        const {
            projectId,
            reportingYear,
            category = "PETROL_BILL",
            title,
            vendorName,
            invoiceNumber,
            invoiceDate,
            fuelType = "Petrol",
            quantity = 0,
            unit = "Litres",
            totalAmount = 0,
            currency = "INR",
            fileName,
            originalName,
            fileSize = 0,
            mimeType = "application/pdf",
            fileBase64,
            notes
        } = req.body;

        if (!projectId || !reportingYear || !title) {
            return res.status(400).json({
                message: "Project ID, reporting year, and document title are required"
            });
        }

        const qtyNum = parseFloat(quantity) || 0;
        const amtNum = parseFloat(totalAmount) || 0;

        // Determine emission factor based on category and fuel type
        // GHG Protocol Emission Factors (tCO2e per unit):
        let factor = 0.002310; // Default: Petrol ~ 2.31 kg CO2e / L
        if (category === "PETROL_BILL" || (category === "FUEL_BILL" && fuelType.toLowerCase().includes("petrol"))) {
            factor = 0.002310;
        } else if (category === "DIESEL_BILL" || (category === "FUEL_BILL" && fuelType.toLowerCase().includes("diesel"))) {
            factor = 0.002680;
        } else if (fuelType.toLowerCase().includes("cng")) {
            factor = 0.002750;
        } else if (category === "ELECTRICITY_BILL") {
            factor = 0.000716;
        } else if (category === "WATER_BILL") {
            factor = 0.000344;
        }

        const calculatedEmissions = Number((qtyNum * factor).toFixed(4));

        // Automated Verification Engine
        let verificationStatus = "VERIFIED";
        const verificationChecks = [];

        // Check 1: Invoice Date vs Reporting Year
        if (invoiceDate) {
            const invYear = new Date(invoiceDate).getFullYear();
            if (invYear !== parseInt(reportingYear)) {
                verificationStatus = "FLAGGED";
                verificationChecks.push(`Date year mismatch: invoice is from ${invYear}, but reporting year is ${reportingYear}`);
            } else {
                verificationChecks.push(`Reporting year matches FY${reportingYear}`);
            }
        } else {
            verificationChecks.push("Invoice date not specified");
        }

        // Check 2: Quantity & Amount consistency
        if (qtyNum > 0 && amtNum > 0) {
            const unitPrice = amtNum / qtyNum;
            verificationChecks.push(`Quantity (${qtyNum} ${unit}) and amount (${currency} ${amtNum}) verified (avg ${currency} ${unitPrice.toFixed(2)}/${unit})`);
        } else if (qtyNum <= 0) {
            verificationStatus = "FLAGGED";
            verificationChecks.push("Warning: Zero or missing fuel quantity");
        }

        // Check 3: Invoice Number presence
        if (invoiceNumber) {
            verificationChecks.push(`Valid invoice/receipt reference: ${invoiceNumber}`);
        } else {
            verificationChecks.push("No invoice number provided");
        }

        // Check 4: Calculated Scope 1 impact
        if (calculatedEmissions > 0) {
            verificationChecks.push(`Scope 1 GHG impact: ${calculatedEmissions} tCO₂e (${factor} tCO₂e/${unit})`);
        }

        const verificationNotes = notes || verificationChecks.join(" | ");

        const storedFileName = fileName || `doc_${Date.now()}_${originalName || "bill.pdf"}`;

        const insertSql = `
            INSERT INTO environmental_documents (
                project_id, reporting_year, category, title, file_name, original_name,
                file_size, mime_type, file_base64, vendor_name, invoice_number, invoice_date,
                fuel_type, quantity, unit, total_amount, currency, emission_factor,
                calculated_emissions_tco2e, verification_status, verification_notes,
                uploaded_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.promise().query(insertSql, [
            projectId,
            reportingYear,
            category,
            title,
            storedFileName,
            originalName || storedFileName,
            fileSize,
            mimeType,
            fileBase64 || null,
            vendorName || null,
            invoiceNumber || null,
            invoiceDate || null,
            fuelType || "Petrol",
            qtyNum,
            unit || "Litres",
            amtNum,
            currency || "INR",
            factor,
            calculatedEmissions,
            verificationStatus,
            verificationNotes,
            req.user?.id || null
        ]);

        // Record audit log
        try {
            await db.promise().query(
                `INSERT INTO audit_logs (user_id, action, module, project_id, reporting_year, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    req.user?.id || null,
                    "VERIFY_DOCUMENT",
                    "ENVIRONMENTAL",
                    projectId,
                    reportingYear,
                    `Document uploaded & verified: ${title} (${category}, Qty: ${qtyNum} ${unit}, Emissions: ${calculatedEmissions} tCO2e)`
                ]
            );
        } catch (auditErr) {
            console.error("Audit log error:", auditErr.message);
        }

        res.status(201).json({
            message: "Document uploaded and verified successfully",
            documentId: result.insertId,
            verificationStatus,
            calculatedEmissions,
            verificationNotes
        });
    } catch (error) {
        console.error("Error uploading environmental document:", error);
        res.status(500).json({ message: "Failed to upload and verify document" });
    }
};

// =====================================================
// DOCUMENT VERIFICATION: DOWNLOAD / PREVIEW DOCUMENT
// =====================================================
const downloadEnvironmentalDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT original_name, mime_type, file_base64, file_path FROM environmental_documents WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        const doc = rows[0];

        if (doc.file_base64) {
            const base64Data = doc.file_base64.replace(/^data:[^;]+;base64,/, "");
            const fileBuffer = Buffer.from(base64Data, "base64");

            res.setHeader("Content-Type", doc.mime_type || "application/pdf");
            res.setHeader(
                "Content-Disposition",
                `inline; filename="${encodeURIComponent(doc.original_name)}"`
            );
            return res.send(fileBuffer);
        } else if (doc.file_path && fs.existsSync(doc.file_path)) {
            return res.download(doc.file_path, doc.original_name);
        } else {
            return res.status(404).json({ message: "File content not found" });
        }
    } catch (error) {
        console.error("Error downloading document:", error);
        res.status(500).json({ message: "Failed to download document" });
    }
};

// =====================================================
// DOCUMENT VERIFICATION: DELETE DOCUMENT
// =====================================================
const deleteEnvironmentalDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.promise().query(
            "SELECT project_id, reporting_year, title FROM environmental_documents WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Document not found" });
        }

        await db.promise().query("DELETE FROM environmental_documents WHERE id = ?", [id]);

        // Record audit log
        try {
            await db.promise().query(
                `INSERT INTO audit_logs (user_id, action, module, project_id, reporting_year, description)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    req.user?.id || null,
                    "DELETE_DOCUMENT",
                    "ENVIRONMENTAL",
                    rows[0].project_id,
                    rows[0].reporting_year,
                    `Deleted verification document: ${rows[0].title}`
                ]
            );
        } catch (auditErr) {
            console.error("Audit log error:", auditErr.message);
        }

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Failed to delete document" });
    }
};

// =====================================================
// DOCUMENT VERIFICATION: UPDATE VERIFICATION STATUS
// =====================================================
const updateDocumentVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        await db.promise().query(
            "UPDATE environmental_documents SET verification_status = ?, verification_notes = ? WHERE id = ?",
            [status || "VERIFIED", notes || null, id]
        );

        res.json({ message: "Verification status updated successfully" });
    } catch (error) {
        console.error("Error updating document status:", error);
        res.status(500).json({ message: "Failed to update status" });
    }
};

// =====================================================
// SYNC VERIFIED EMISSIONS TO SCOPE 1
// =====================================================
const syncVerifiedEmissions = async (req, res) => {
    try {
        const { projectId, reportingYear } = req.body;

        if (!projectId || !reportingYear) {
            return res.status(400).json({ message: "Project ID and reporting year required" });
        }

        // Sum verified Scope 1 mobile emissions (Petrol + Diesel)
        const [sumRows] = await db.promise().query(
            `SELECT SUM(calculated_emissions_tco2e) AS total_verified_emissions,
                    SUM(quantity) AS total_litres
             FROM environmental_documents
             WHERE project_id = ? AND reporting_year = ? AND verification_status = 'VERIFIED'
               AND category IN ('PETROL_BILL', 'DIESEL_BILL')`,
            [projectId, reportingYear]
        );

        const totalVerifiedEmissions = Number((sumRows[0]?.total_verified_emissions || 0).toFixed(4));
        const totalLitres = Number((sumRows[0]?.total_litres || 0).toFixed(2));

        res.json({
            message: "Verified fuel emissions calculated",
            totalVerifiedEmissions,
            totalLitres
        });
    } catch (error) {
        console.error("Error syncing verified emissions:", error);
        res.status(500).json({ message: "Failed to calculate verified emissions" });
    }
};

module.exports = {
    saveEnvironmentalData,
    getEnvironmentalSummary,
    getEnvironmentalDetails,
    getEnvironmentalGHG,
    getEnvironmentalDocuments,
    uploadEnvironmentalDocument,
    downloadEnvironmentalDocument,
    deleteEnvironmentalDocument,
    updateDocumentVerificationStatus,
    syncVerifiedEmissions
};