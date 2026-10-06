const {
    getReportData
} = require("../services/reportService");

const {
    generatePDF
} = require("../services/pdfService");

const {
    generateExcel
} = require("../services/excelService");

const getESGReport = async (req, res) => {

    const {
        projectId,
        year
    } = req.params;

    if (!projectId || !year) {
        return res.status(400).json({
            message: "Project and year are required"
        });
    }

    try {

        const report =
            await getReportData(
                projectId,
                year
            );

        res.json({
            message: "ESG report data fetched successfully",
            report
        });

    } catch (error) {

        console.error(
            "Report error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate ESG report data"
        });
    }
};


const generateESGReportPDF = async (req, res) => {

    const {
        projectId,
        year
    } = req.params;

    if (!projectId || !year) {
        return res.status(400).json({
            message: "Project and year are required"
        });
    }

    try {

        // Get ESG data
        const report =
            await getReportData(
                projectId,
                year
            );

        // Generate PDF
        const pdfBuffer =
            await generatePDF(report);

        const safeProjectName =
            (report.project.project_name || "Project")
                .replace(/[^a-z0-9]/gi, "_");

        const filename =
            `ESG_Report_${safeProjectName}_${year}.pdf`;

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.send(pdfBuffer);

    } catch (error) {

        console.error(
            "PDF generation error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate PDF report"
        });
    }
};

const generateESGReportExcel = async (req, res) => {

    const { projectId, year } = req.params;

    if (!projectId || !year) {
        return res.status(400).json({
            message: "Project and year are required"
        });
    }

    try {

        const report =
            await getReportData(
                projectId,
                year
            );

        const excelBuffer =
            await generateExcel(
                report,
                report.auditLogs || []
            );

        const safeProjectName =
            (report.project.project_name || "Project")
                .replace(/[^a-z0-9]/gi, "_");

        const filename =
            `ESG_Report_${safeProjectName}_${year}.xlsx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        res.send(excelBuffer);

    } catch (error) {

        console.error(
            "Excel generation error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to generate Excel report"
        });
    }
};

module.exports = {
    getESGReport,
    generateESGReportPDF,
    generateESGReportExcel
};