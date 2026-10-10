const db = require("../config/db");


// CREATE / UPDATE BRSR GENERAL DISCLOSURES
const saveGeneralDisclosures = (req, res) => {

    const {
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
    } = req.body;

    if (!entity_name || !reporting_financial_year) {
        return res.status(400).json({
            message:
                "Entity name and reporting financial year are required"
        });
    }

    const sql = `
        INSERT INTO brsr_general_disclosures (
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
            reporting_boundary,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE

            cin = VALUES(cin),
            year_of_incorporation =
                VALUES(year_of_incorporation),

            registered_office_address =
                VALUES(registered_office_address),

            corporate_address =
                VALUES(corporate_address),

            email = VALUES(email),
            telephone = VALUES(telephone),
            website = VALUES(website),

            stock_exchange =
                VALUES(stock_exchange),

            paid_up_capital =
                VALUES(paid_up_capital),

            contact_person_name =
                VALUES(contact_person_name),

            contact_person_telephone =
                VALUES(contact_person_telephone),

            contact_person_email =
                VALUES(contact_person_email),

            reporting_boundary =
                VALUES(reporting_boundary),

            updated_at = CURRENT_TIMESTAMP
    `;

    const values = [
        cin,
        entity_name,
        year_of_incorporation || null,
        registered_office_address || null,
        corporate_address || null,
        email || null,
        telephone || null,
        website || null,
        reporting_financial_year,
        stock_exchange || null,
        paid_up_capital || 0,
        contact_person_name || null,
        contact_person_telephone || null,
        contact_person_email || null,
        reporting_boundary || "STANDALONE",
        req.user.id
    ];

    db.query(sql, values, (err, result) => {

        if (err) {

            console.error(
                "BRSR General Disclosure error:",
                err
            );

            return res.status(500).json({
                message:
                    "Failed to save BRSR general disclosures"
            });
        }

        res.status(200).json({
            message:
                "BRSR general disclosures saved successfully",
            id: result.insertId
        });
    });
};


// GET BRSR GENERAL DISCLOSURES
const getGeneralDisclosures = (req, res) => {

    const { projectId,year } = req.params;

    const sql = `
        SELECT *
        FROM brsr_general_disclosures
        WHERE reporting_financial_year = ?
        ORDER BY id DESC
        LIMIT 1
    `;

    db.query(sql, [year], (err, results) => {

        if (err) {

            console.error(
                "BRSR General Disclosure fetch error:",
                err.message);

            return res.status(500).json({
                message:
                    "Failed to fetch BRSR general disclosures"
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                message:
                    "No BRSR general disclosures found"
            });
        }

        res.status(200).json(
            results[0]
        );
    });
};


module.exports = {
    saveGeneralDisclosures,
    getGeneralDisclosures
};