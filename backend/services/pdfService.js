const puppeteer = require("puppeteer");

const generatePDF = async (report) => {

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    try {

        const page = await browser.newPage();

        const project = report.project || {};
        const environmental = report.environmental || {};
        const social = report.social || {};
        const governance = report.governance || {};
        const workflow = report.workflow || {};
        const ghg = report.ghg || [];

        // -----------------------------------------
        // GHG CALCULATIONS
        // -----------------------------------------

        const getScopeTotal = (scope) => {

            const data = ghg.find(
                item => item.scope_type === scope
            );

            if (!data) {
                return 0;
            }

            return (
                Number(data.co2_tco2e || 0) +
                Number(data.ch4_tco2e || 0) +
                Number(data.n2o_tco2e || 0) +
                Number(data.hfcs_tco2e || 0) +
                Number(data.pfcs_tco2e || 0) +
                Number(data.sf6_tco2e || 0) +
                Number(data.nf3_tco2e || 0)
            );
        };

        const scope1 = getScopeTotal("SCOPE_1");
        const scope2 = getScopeTotal("SCOPE_2");
        const scope3 = getScopeTotal("SCOPE_3");

        const totalGHG =
            scope1 +
            scope2 +
            scope3;

        // -----------------------------------------
        // HTML REPORT
        // -----------------------------------------

        const html = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>ESG Report - ${project.project_name || "Project"}</title>

<style>

* {
    box-sizing: border-box;
}

body {

    font-family: Arial, Helvetica, sans-serif;

    margin: 0;

    padding: 40px;

    color: #1f2937;

    background: #ffffff;

}

.header {

    border-bottom: 4px solid #166534;

    padding-bottom: 20px;

    margin-bottom: 30px;

}

.header h1 {

    margin: 0;

    font-size: 30px;

}

.header h2 {

    margin: 8px 0 0;

    font-size: 20px;

    font-weight: normal;

}

.meta {

    margin-top: 15px;

    color: #4b5563;

}

.section {

    margin-top: 30px;

    page-break-inside: avoid;

}

.section-title {

    background: #166534;

    color: white;

    padding: 10px 14px;

    font-size: 18px;

    font-weight: bold;

}

table {

    width: 100%;

    border-collapse: collapse;

    margin-top: 12px;

}

th {

    background: #f3f4f6;

    text-align: left;

}

th, td {

    border: 1px solid #d1d5db;

    padding: 9px;

    font-size: 13px;

}

.kpi-container {

    display: flex;

    gap: 15px;

    margin-top: 15px;

}

.kpi {

    flex: 1;

    border: 1px solid #d1d5db;

    padding: 15px;

    text-align: center;

}

.kpi-value {

    font-size: 22px;

    font-weight: bold;

}

.kpi-label {

    margin-top: 5px;

    color: #6b7280;

    font-size: 12px;

}

.footer {

    margin-top: 40px;

    padding-top: 15px;

    border-top: 1px solid #d1d5db;

    font-size: 11px;

    color: #6b7280;

    text-align: center;

}

.status {

    font-weight: bold;

    font-size: 16px;

}

</style>

</head>

<body>

<div class="header">

    <h1>ESG Performance Report</h1>

    <h2>${project.project_name || "Project"}</h2>

    <div class="meta">

        Reporting Year: ${project.reporting_year || ""}

    </div>

</div>


<!-- PROJECT INFORMATION -->

<div class="section">

    <div class="section-title">

        1. Project Information

    </div>

    <table>

        <tr>
            <th>Project Name</th>
            <td>${project.project_name || "-"}</td>
        </tr>

        <tr>
            <th>Organization</th>
            <td>${project.organization || "-"}</td>
        </tr>

        <tr>
            <th>Business Unit</th>
            <td>${project.business_unit || "-"}</td>
        </tr>

        <tr>
            <th>Location</th>
            <td>${project.location || "-"}</td>
        </tr>

        <tr>
            <th>Project Manager</th>
            <td>${project.project_manager || "-"}</td>
        </tr>

        <tr>
            <th>Reporting Year</th>
            <td>${project.reporting_year || "-"}</td>
        </tr>

    </table>

</div>


<!-- ENVIRONMENTAL -->

<div class="section">

    <div class="section-title">

        2. Environmental Performance

    </div>

    <div class="kpi-container">

        <div class="kpi">

            <div class="kpi-value">
                ${environmental.energy_consumption || 0}
            </div>

            <div class="kpi-label">
                Energy Consumption
            </div>

        </div>

        <div class="kpi">

            <div class="kpi-value">
                ${environmental.renewable_energy || 0}
            </div>

            <div class="kpi-label">
                Renewable Energy
            </div>

        </div>

        <div class="kpi">

            <div class="kpi-value">
                ${environmental.water_consumption || 0}
            </div>

            <div class="kpi-label">
                Water Consumption
            </div>

        </div>

    </div>

    <table>

        <tr>
            <th>Energy Consumption</th>
            <td>${environmental.energy_consumption || 0}</td>
        </tr>

        <tr>
            <th>Renewable Energy</th>
            <td>${environmental.renewable_energy || 0}</td>
        </tr>

        <tr>
            <th>Water Consumption</th>
            <td>${environmental.water_consumption || 0}</td>
        </tr>

        <tr>
            <th>Waste Generated</th>
            <td>${environmental.waste_generated || 0}</td>
        </tr>

        <tr>
            <th>Waste Recycled</th>
            <td>${environmental.waste_recycled || 0}</td>
        </tr>

    </table>

</div>


<!-- GHG -->

<div class="section">

    <div class="section-title">

        3. Greenhouse Gas Emissions

    </div>

    <div class="kpi-container">

        <div class="kpi">

            <div class="kpi-value">
                ${scope1.toFixed(4)}
            </div>

            <div class="kpi-label">
                Scope 1 (tCO₂e)
            </div>

        </div>

        <div class="kpi">

            <div class="kpi-value">
                ${scope2.toFixed(4)}
            </div>

            <div class="kpi-label">
                Scope 2 (tCO₂e)
            </div>

        </div>

        <div class="kpi">

            <div class="kpi-value">
                ${scope3.toFixed(4)}
            </div>

            <div class="kpi-label">
                Scope 3 (tCO₂e)
            </div>

        </div>

    </div>

    <table>

        <tr>

            <th>Scope</th>

            <th>Total Emissions (tCO₂e)</th>

        </tr>

        <tr>

            <td>Scope 1</td>

            <td>${scope1.toFixed(4)}</td>

        </tr>

        <tr>

            <td>Scope 2</td>

            <td>${scope2.toFixed(4)}</td>

        </tr>

        <tr>

            <td>Scope 3</td>

            <td>${scope3.toFixed(4)}</td>

        </tr>

        <tr>

            <th>Total GHG Emissions</th>

            <th>${totalGHG.toFixed(4)}</th>

        </tr>

    </table>

</div>


<!-- SOCIAL -->

<div class="section">

    <div class="section-title">

        4. Social Performance

    </div>

    <table>

        <tr>
            <th>Total Employees</th>
            <td>${social.total_employees || 0}</td>
        </tr>

        <tr>
            <th>Male Employees</th>
            <td>${social.male_employees || 0}</td>
        </tr>

        <tr>
            <th>Female Employees</th>
            <td>${social.female_employees || 0}</td>
        </tr>

        <tr>
            <th>Permanent Employees</th>
            <td>${social.permanent_employees || 0}</td>
        </tr>

        <tr>
            <th>Contractual Employees</th>
            <td>${social.contractual_employees || 0}</td>
        </tr>

        <tr>
            <th>Employees Trained</th>
            <td>${social.employees_trained || 0}</td>
        </tr>

        <tr>
            <th>Training Hours</th>
            <td>${social.training_hours || 0}</td>
        </tr>

        <tr>
            <th>Workplace Accidents</th>
            <td>${social.workplace_accidents || 0}</td>
        </tr>

        <tr>
            <th>Fatalities</th>
            <td>${social.fatalities || 0}</td>
        </tr>

        <tr>
            <th>Lost Time Injuries</th>
            <td>${social.lost_time_injuries || 0}</td>
        </tr>

        <tr>
            <th>Employee Grievances</th>
            <td>${social.employee_grievances || 0}</td>
        </tr>

        <tr>
            <th>Grievances Resolved</th>
            <td>${social.grievances_resolved || 0}</td>
        </tr>

        <tr>
            <th>Community Investment</th>
            <td>${social.community_investment || 0}</td>
        </tr>

    </table>

</div>


<!-- GOVERNANCE -->

<div class="section">

    <div class="section-title">

        5. Governance Performance

    </div>

    <table>

        <tr>
            <th>Employees Trained on Ethics</th>
            <td>${governance.ethics_training_employees || 0}</td>
        </tr>

        <tr>
            <th>Anti-Corruption Cases</th>
            <td>${governance.anti_corruption_cases || 0}</td>
        </tr>

        <tr>
            <th>Bribery Cases</th>
            <td>${governance.bribery_cases || 0}</td>
        </tr>

        <tr>
            <th>Whistleblower Complaints</th>
            <td>${governance.whistleblower_complaints || 0}</td>
        </tr>

        <tr>
            <th>Whistleblower Complaints Resolved</th>
            <td>${governance.whistleblower_resolved || 0}</td>
        </tr>

        <tr>
            <th>Regulatory Actions</th>
            <td>${governance.regulatory_actions || 0}</td>
        </tr>

        <tr>
            <th>Regulatory Penalties</th>
            <td>${governance.regulatory_penalties || 0}</td>
        </tr>

        <tr>
            <th>Data Privacy Incidents</th>
            <td>${governance.data_privacy_incidents || 0}</td>
        </tr>

        <tr>
            <th>Cybersecurity Incidents</th>
            <td>${governance.cybersecurity_incidents || 0}</td>
        </tr>

        <tr>
            <th>Customer Complaints</th>
            <td>${governance.customer_complaints || 0}</td>
        </tr>

        <tr>
            <th>Customer Complaints Resolved</th>
            <td>${governance.customer_complaints_resolved || 0}</td>
        </tr>

        <tr>
            <th>Governance Training Hours</th>
            <td>${governance.governance_training_hours || 0}</td>
        </tr>

        <tr>
            <th>Board Meetings</th>
            <td>${governance.board_meetings || 0}</td>
        </tr>

        <tr>
            <th>Management Meetings</th>
            <td>${governance.management_meetings || 0}</td>
        </tr>

    </table>

</div>


<!-- WORKFLOW -->

<div class="section">

    <div class="section-title">

        6. Report Workflow

    </div>

    <table>

        <tr>
            <th>Current Status</th>
            <td class="status">
                ${workflow.status || "NOT CREATED"}
            </td>
        </tr>

        <tr>
            <th>Submitted At</th>
            <td>${workflow.submitted_at || "-"}</td>
        </tr>

        <tr>
            <th>Reviewed At</th>
            <td>${workflow.reviewed_at || "-"}</td>
        </tr>

        <tr>
            <th>Reviewer Comments</th>
            <td>${workflow.reviewer_comments || "-"}</td>
        </tr>

    </table>

</div>


<div class="footer">

    ESG Performance Report |
    Reporting Year ${project.reporting_year || year}

    <br>

    Generated electronically by the ESG Reporting Portal

</div>

</body>

</html>

        `;

        await page.setContent(
            html,
            {
                waitUntil: "networkidle0"
            }
        );

        const pdfBuffer =
            await page.pdf({

                format: "A4",

                printBackground: true,

                margin: {
                    top: "20mm",
                    right: "15mm",
                    bottom: "20mm",
                    left: "15mm"
                }

            });

        return pdfBuffer;

    } finally {

        await browser.close();

    }
};

module.exports = {
    generatePDF
};