const db = require("../config/db");

const createProject = (req, res) => {

    const {
        projectName,
        organization,
        businessUnit,
        location,
        projectManager,
        reportingYear,
        status
    } = req.body;

    if (!projectName || !organization || !location || !reportingYear) {
        return res.status(400).json({
            message: "Project name, organization, location and reporting year are required"
        });
    }

    const sql = `
        INSERT INTO projects
        (
            project_name,
            organization,
            business_unit,
            location,
            project_manager,
            reporting_year,
            status,
            created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            projectName,
            organization,
            businessUnit,
            location,
            projectManager,
            reportingYear,
            status,
            req.user.id
        ],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to create project"
                });
            }

            res.status(201).json({
                message: "Project created successfully",
                projectId: result.insertId
            });
        }
    );
};

const getProjects = (req, res) => {

    const sql = `
        SELECT
            p.*,
            u.name AS created_by_name
        FROM projects p
        LEFT JOIN users u
            ON p.created_by = u.id
        ORDER BY p.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch projects"
            });
        }

        res.json(results);
    });
};

const getProjectCount = (req, res) => {

    const sql = `
        SELECT COUNT(*) AS total
        FROM projects
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to get project count"
            });
        }

        res.json({
            total: results[0].total
        });
    });
};


module.exports = {
    createProject,
    getProjects,
    getProjectCount
};