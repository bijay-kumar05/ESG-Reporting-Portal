const ExcelJS = require("exceljs");

const generateExcel = async (report, auditLogs = []) => {

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "ESG Reporting Portal";
    workbook.lastModifiedBy = "ESG Reporting Portal";
    workbook.created = new Date();
    workbook.modified = new Date();

    const project = report.project || {};
    const environmental = report.environmental || {};
    const social = report.social || {};
    const governance = report.governance || {};
    const workflow = report.workflow || {};
    const ghg = report.ghg || [];

    // ------------------------------------------------
    // HELPER FUNCTIONS
    // ------------------------------------------------

    const styleHeader = (row) => {

        row.font = {
            bold: true,
            color: {
                argb: "FFFFFFFF"
            }
        };

        row.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "166534"
            }
        };

        row.alignment = {
            vertical: "middle"
        };
    };

    const styleTitle = (cell) => {

        cell.font = {
            bold: true,
            size: 16
        };

        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
                argb: "DCFCE7"
            }
        };
    };

    const addKeyValue = (
        sheet,
        key,
        value
    ) => {

        const row = sheet.addRow([
            key,
            value ?? "-"
        ]);

        row.getCell(1).font = {
            bold: true
        };
    };


    // =================================================
    // 1. PROJECT INFORMATION
    // =================================================

    const projectSheet =
        workbook.addWorksheet(
            "Project Information"
        );

    projectSheet.mergeCells("A1:B1");

    projectSheet.getCell("A1").value =
        "ESG PROJECT INFORMATION";

    styleTitle(
        projectSheet.getCell("A1")
    );

    projectSheet.addRow([]);

    addKeyValue(
        projectSheet,
        "Project Name",
        project.project_name
    );

    addKeyValue(
        projectSheet,
        "Organization",
        project.organization
    );

    addKeyValue(
        projectSheet,
        "Business Unit",
        project.business_unit
    );

    addKeyValue(
        projectSheet,
        "Location",
        project.location
    );

    addKeyValue(
        projectSheet,
        "Project Manager",
        project.project_manager
    );

    addKeyValue(
        projectSheet,
        "Reporting Year",
        project.reporting_year
    );

    addKeyValue(
        projectSheet,
        "Project Status",
        project.status
    );

    projectSheet.getColumn(1).width = 30;
    projectSheet.getColumn(2).width = 40;


    // =================================================
    // 2. ENVIRONMENTAL
    // =================================================

    const environmentalSheet =
        workbook.addWorksheet(
            "Environmental"
        );

    environmentalSheet.mergeCells("A1:B1");

    environmentalSheet.getCell("A1").value =
        "ENVIRONMENTAL PERFORMANCE";

    styleTitle(
        environmentalSheet.getCell("A1")
    );

    environmentalSheet.addRow([]);

    const environmentalHeader =
        environmentalSheet.addRow([
            "Metric",
            "Value"
        ]);

    styleHeader(
        environmentalHeader
    );

    addKeyValue(
        environmentalSheet,
        "Energy Consumption",
        environmental.energy_consumption
    );

    addKeyValue(
        environmentalSheet,
        "Renewable Energy",
        environmental.renewable_energy
    );

    addKeyValue(
        environmentalSheet,
        "Water Consumption",
        environmental.water_consumption
    );

    addKeyValue(
        environmentalSheet,
        "Waste Generated",
        environmental.waste_generated
    );

    addKeyValue(
        environmentalSheet,
        "Waste Recycled",
        environmental.waste_recycled
    );

    environmentalSheet.getColumn(1).width = 35;
    environmentalSheet.getColumn(2).width = 25;


    // =================================================
    // 3. GHG EMISSIONS
    // =================================================

    const ghgSheet =
        workbook.addWorksheet(
            "GHG Emissions"
        );

    ghgSheet.mergeCells("A1:I1");

    ghgSheet.getCell("A1").value =
        "GREENHOUSE GAS EMISSIONS";

    styleTitle(
        ghgSheet.getCell("A1")
    );

    ghgSheet.addRow([]);

    const ghgHeader =
        ghgSheet.addRow([
            "Scope",
            "CO₂",
            "CH₄",
            "N₂O",
            "HFCs",
            "PFCs",
            "SF₆",
            "NF₃",
            "Total tCO₂e"
        ]);

    styleHeader(
        ghgHeader
    );

    ghg.forEach((item) => {

        const total =
            Number(item.co2_tco2e || 0) +
            Number(item.ch4_tco2e || 0) +
            Number(item.n2o_tco2e || 0) +
            Number(item.hfcs_tco2e || 0) +
            Number(item.pfcs_tco2e || 0) +
            Number(item.sf6_tco2e || 0) +
            Number(item.nf3_tco2e || 0);

        ghgSheet.addRow([
            item.scope_type,
            Number(item.co2_tco2e || 0),
            Number(item.ch4_tco2e || 0),
            Number(item.n2o_tco2e || 0),
            Number(item.hfcs_tco2e || 0),
            Number(item.pfcs_tco2e || 0),
            Number(item.sf6_tco2e || 0),
            Number(item.nf3_tco2e || 0),
            total
        ]);

    });

    ghgSheet.columns.forEach(
        column => {
            column.width = 18;
        }
    );


    // =================================================
    // 4. SOCIAL
    // =================================================

    const socialSheet =
        workbook.addWorksheet(
            "Social"
        );

    socialSheet.mergeCells("A1:B1");

    socialSheet.getCell("A1").value =
        "SOCIAL PERFORMANCE";

    styleTitle(
        socialSheet.getCell("A1")
    );

    socialSheet.addRow([]);

    const socialHeader =
        socialSheet.addRow([
            "Metric",
            "Value"
        ]);

    styleHeader(
        socialHeader
    );

    addKeyValue(
        socialSheet,
        "Total Employees",
        social.total_employees
    );

    addKeyValue(
        socialSheet,
        "Male Employees",
        social.male_employees
    );

    addKeyValue(
        socialSheet,
        "Female Employees",
        social.female_employees
    );

    addKeyValue(
        socialSheet,
        "Other Gender Employees",
        social.other_gender_employees
    );

    addKeyValue(
        socialSheet,
        "Permanent Employees",
        social.permanent_employees
    );

    addKeyValue(
        socialSheet,
        "Contractual Employees",
        social.contractual_employees
    );

    addKeyValue(
        socialSheet,
        "Employees Trained",
        social.employees_trained
    );

    addKeyValue(
        socialSheet,
        "Training Hours",
        social.training_hours
    );

    addKeyValue(
        socialSheet,
        "Workplace Accidents",
        social.workplace_accidents
    );

    addKeyValue(
        socialSheet,
        "Fatalities",
        social.fatalities
    );

    addKeyValue(
        socialSheet,
        "Lost Time Injuries",
        social.lost_time_injuries
    );

    addKeyValue(
        socialSheet,
        "Employee Grievances",
        social.employee_grievances
    );

    addKeyValue(
        socialSheet,
        "Grievances Resolved",
        social.grievances_resolved
    );

    addKeyValue(
        socialSheet,
        "Community Investment",
        social.community_investment
    );

    socialSheet.getColumn(1).width = 35;
    socialSheet.getColumn(2).width = 25;


    // =================================================
    // 5. GOVERNANCE
    // =================================================

    const governanceSheet =
        workbook.addWorksheet(
            "Governance"
        );

    governanceSheet.mergeCells("A1:B1");

    governanceSheet.getCell("A1").value =
        "GOVERNANCE PERFORMANCE";

    styleTitle(
        governanceSheet.getCell("A1")
    );

    governanceSheet.addRow([]);

    const governanceHeader =
        governanceSheet.addRow([
            "Metric",
            "Value"
        ]);

    styleHeader(
        governanceHeader
    );

    addKeyValue(
        governanceSheet,
        "Employees Trained on Ethics",
        governance.ethics_training_employees
    );

    addKeyValue(
        governanceSheet,
        "Anti-Corruption Cases",
        governance.anti_corruption_cases
    );

    addKeyValue(
        governanceSheet,
        "Bribery Cases",
        governance.bribery_cases
    );

    addKeyValue(
        governanceSheet,
        "Whistleblower Complaints",
        governance.whistleblower_complaints
    );

    addKeyValue(
        governanceSheet,
        "Whistleblower Complaints Resolved",
        governance.whistleblower_resolved
    );

    addKeyValue(
        governanceSheet,
        "Regulatory Actions",
        governance.regulatory_actions
    );

    addKeyValue(
        governanceSheet,
        "Regulatory Penalties",
        governance.regulatory_penalties
    );

    addKeyValue(
        governanceSheet,
        "Data Privacy Incidents",
        governance.data_privacy_incidents
    );

    addKeyValue(
        governanceSheet,
        "Cybersecurity Incidents",
        governance.cybersecurity_incidents
    );

    addKeyValue(
        governanceSheet,
        "Customer Complaints",
        governance.customer_complaints
    );

    addKeyValue(
        governanceSheet,
        "Customer Complaints Resolved",
        governance.customer_complaints_resolved
    );

    addKeyValue(
        governanceSheet,
        "Governance Training Hours",
        governance.governance_training_hours
    );

    addKeyValue(
        governanceSheet,
        "Board Meetings",
        governance.board_meetings
    );

    addKeyValue(
        governanceSheet,
        "Management Meetings",
        governance.management_meetings
    );

    governanceSheet.getColumn(1).width = 40;
    governanceSheet.getColumn(2).width = 25;


    // =================================================
    // 6. WORKFLOW
    // =================================================

    const workflowSheet =
        workbook.addWorksheet(
            "Workflow"
        );

    workflowSheet.mergeCells("A1:B1");

    workflowSheet.getCell("A1").value =
        "REPORT WORKFLOW";

    styleTitle(
        workflowSheet.getCell("A1")
    );

    workflowSheet.addRow([]);

    addKeyValue(
        workflowSheet,
        "Current Status",
        workflow.status
    );

    addKeyValue(
        workflowSheet,
        "Submitted At",
        workflow.submitted_at
    );

    addKeyValue(
        workflowSheet,
        "Reviewed At",
        workflow.reviewed_at
    );

    addKeyValue(
        workflowSheet,
        "Rejection Reason",
        workflow.rejection_reason
    );

    addKeyValue(
        workflowSheet,
        "Reviewer Comments",
        workflow.reviewer_comments
    );

    workflowSheet.getColumn(1).width = 30;
    workflowSheet.getColumn(2).width = 60;


    // =================================================
    // 7. AUDIT TRAIL
    // =================================================

    const auditSheet =
        workbook.addWorksheet(
            "Audit Trail"
        );

    auditSheet.mergeCells("A1:H1");

    auditSheet.getCell("A1").value =
        "AUDIT TRAIL";

    styleTitle(
        auditSheet.getCell("A1")
    );

    auditSheet.addRow([]);

    const auditHeader =
    auditSheet.addRow([
        "Date",
        "User",
        "Action",
        "Module",
        "Project ID",
        "Reporting Year",
        "Old Value",
        "New Value",
        "Description"
    ]);

    styleHeader(
        auditHeader
    );

    auditLogs.forEach((log) => {

    auditSheet.addRow([
        log.created_at || "-",
        log.user_name || log.user_id || "-",
        log.action || "-",
        log.module || "-",
        log.project_id || "-",
        log.reporting_year || "-",
        log.old_value || "-",
        log.new_value || "-",
        log.description || "-"
    ]);

});

    auditSheet.columns.forEach(
        column => {
            column.width = 22;
        }
    );
    auditSheet.getColumn(9).width = 45;

    // =================================================
    // RETURN EXCEL BUFFER
    // =================================================

    const buffer =
        await workbook.xlsx.writeBuffer();

    return buffer;
};

module.exports = {
    generateExcel
};