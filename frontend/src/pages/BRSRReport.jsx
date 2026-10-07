import { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    FileText,
    Download,
    Loader2,
    CheckCircle,
    AlertCircle
} from "lucide-react";

const API_URL = "http://localhost:5000";

function BRSRReport({ onBack }) {

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedProjectData, setSelectedProjectData] = useState(null);
    const [selectedYear, setSelectedYear] = useState("2026");

    const [report, setReport] = useState(null);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);

    const [message, setMessage] = useState("");

    // -----------------------------------------
    // FETCH PROJECTS
    // -----------------------------------------

    useEffect(() => {

        const fetchProjects = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/projects`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setProjects(response.data);

                if (response.data.length > 0) {
    const firstProject = response.data[0];

    setSelectedProject(
        String(firstProject.id)
    );

    setSelectedProjectData(firstProject);
}

            } catch (error) {

                console.error(
                    "Failed to load projects:",
                    error
                );

                setMessage(
                    "Failed to load projects."
                );

            } finally {

                setLoadingProjects(false);
            }
        };

        fetchProjects();

    }, []);

    // -----------------------------------------
    // FETCH BRSR REPORT DATA
    // -----------------------------------------

    useEffect(() => {

        if (!selectedProject) {
            return;
        }

        const fetchReport = async () => {

            try {

                setLoadingReport(true);
                setMessage("");

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/reports/${selectedProject}/${selectedYear}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                const reportData = response.data;

console.log("BRSR Report API Response:", reportData);

setReport(reportData);

            } catch (error) {

                console.error(
                    "Failed to load report:",
                    error
                );

                setReport(null);

                setMessage(
                    "Unable to load BRSR report data."
                );

            } finally {

                setLoadingReport(false);
            }
        };

        fetchReport();

    }, [selectedProject, selectedYear]);

    // -----------------------------------------
    // DOWNLOAD PDF
    // -----------------------------------------

    const downloadPDF = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/reports/${selectedProject}/${selectedYear}/pdf`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type: "application/pdf"
                    }
                );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `BRSR_Report_${selectedProject}_${selectedYear}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "PDF download failed:",
                error
            );

            setMessage(
                "Failed to generate PDF report."
            );
        }
    };

    // -----------------------------------------
    // DOWNLOAD EXCEL
    // -----------------------------------------

    const downloadExcel = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `${API_URL}/api/reports/${selectedProject}/${selectedYear}/excel`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    }
                );

            const url =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `BRSR_Report_${selectedProject}_${selectedYear}.xlsx`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "Excel download failed:",
                error
            );

            setMessage(
                "Failed to generate Excel report."
            );
        }
    };

    // -----------------------------------------
    // DATA STATUS
    // -----------------------------------------

    const hasProject =
    !!selectedProjectData;

const hasEnvironmental =
    !!(
        report?.environmental ||
        report?.environmentalData ||
        report?.environmental_summary
    );

const hasSocial =
    !!(
        report?.social ||
        report?.socialData
    );

const hasGovernance =
    !!(
        report?.governance ||
        report?.governanceData
    );

const completedSections = [
    hasProject,
    hasEnvironmental,
    hasSocial,
    hasGovernance
].filter(Boolean).length;

const progress =
    (completedSections / 4) * 100;

    return (

        <div className="min-h-screen bg-slate-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* BACK BUTTON */}

                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                >
                    <ArrowLeft size={18} />
                    Back to BRSR Dashboard
                </button>

                {/* HEADER */}

                <div className="bg-white rounded-2xl shadow-sm border p-8 mb-6">

                    <div className="flex items-center gap-4">

                        <div className="p-4 bg-indigo-100 rounded-xl">

                            <FileText
                                size={34}
                                className="text-indigo-700"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR Report
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Review ESG information and generate
                                the BRSR report.
                            </p>

                        </div>

                    </div>

                </div>

                {/* PROJECT / YEAR */}

                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                    <div className="grid md:grid-cols-2 gap-6">

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Project
                            </label>

                            <select
                                value={selectedProject}
                                onChange={(e) => {
    const projectId = e.target.value;

    setSelectedProject(projectId);

    const project = projects.find(
        (item) => String(item.id) === String(projectId)
    );

    setSelectedProjectData(project || null);
}}
                                disabled={loadingProjects}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            >

                                <option value="">
                                    Select Project
                                </option>

                                {projects.map((project) => (

                                    <option
                                        key={project.id}
                                        value={project.id}
                                    >
                                        {project.project_name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Reporting Year
                            </label>

                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                            >

                                <option value="2026">
                                    2026
                                </option>

                                <option value="2025">
                                    2025
                                </option>

                                <option value="2024">
                                    2024
                                </option>

                            </select>

                        </div>

                    </div>

                </div>

                {/* LOADING */}

                {loadingReport && (

                    <div className="bg-white rounded-2xl border p-10 flex justify-center items-center">

                        <div className="flex items-center gap-3 text-slate-600">

                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            Loading report data...

                        </div>

                    </div>

                )}

                {/* ERROR */}

                {!loadingReport && message && (

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-center gap-3 text-amber-800">

                        <AlertCircle size={20} />

                        {message}

                    </div>

                )}

                {/* REPORT */}

                {!loadingReport && report && (

                    <>

                        {/* PROJECT INFORMATION */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Project Information
                            </h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                                <Info
    label="Project"
    value={
        selectedProjectData?.project_name
    }
/>

<Info
    label="Organization"
    value={
        selectedProjectData?.organization
    }
/>

<Info
    label="Location"
    value={
        selectedProjectData?.location
    }
/>

<Info
    label="Manager"
    value={
        selectedProjectData?.manager
    }
/>

                                <Info
                                    label="Reporting Year"
                                    value={
                                        selectedYear
                                    }
                                />

                                <Info
                                    label="Status"
                                    value={
                                        report.workflow?.status ||
                                        "DRAFT"
                                    }
                                />

                            </div>

                        </div>

                        {/* COMPLETION STATUS */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <div className="flex items-center justify-between mb-4">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-800">
                                        BRSR Data Completion
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Status of the major ESG
                                        reporting sections.
                                    </p>

                                </div>

                                <span className="text-2xl font-bold text-indigo-700">
                                    {Math.round(progress)}%
                                </span>

                            </div>

                            <div className="w-full bg-slate-200 rounded-full h-3">

                                <div
                                    className="bg-indigo-600 h-3 rounded-full transition-all"
                                    style={{
                                        width:
                                            `${progress}%`
                                    }}
                                />

                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                                <Status
                                    label="Project"
                                    completed={
                                        hasProject
                                    }
                                />

                                <Status
                                    label="Environmental"
                                    completed={
                                        hasEnvironmental
                                    }
                                />

                                <Status
                                    label="Social"
                                    completed={
                                        hasSocial
                                    }
                                />

                                <Status
                                    label="Governance"
                                    completed={
                                        hasGovernance
                                    }
                                />

                            </div>

                        </div>

                        {/* REPORT ACTIONS */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-2">
                                Generate BRSR Report
                            </h2>

                            <p className="text-sm text-slate-500 mb-6">
                                Download the collected ESG information
                                in PDF or Excel format.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">

                                <button
                                    type="button"
                                    onClick={downloadPDF}
                                    disabled={!selectedProject}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >

                                    <Download size={18} />

                                    Generate PDF

                                </button>

                                <button
                                    type="button"
                                    onClick={downloadExcel}
                                    disabled={!selectedProject}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >

                                    <Download size={18} />

                                    Generate Excel

                                </button>

                            </div>

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}


// -----------------------------------------
// INFORMATION COMPONENT
// -----------------------------------------

function Info({ label, value }) {

    return (

        <div className="bg-slate-50 border rounded-xl p-5">

            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="text-lg font-semibold text-slate-800 mt-2">
                {value || "—"}
            </p>

        </div>
    );
}


// -----------------------------------------
// STATUS COMPONENT
// -----------------------------------------

function Status({ label, completed }) {

    return (

        <div
            className={`border rounded-xl p-4 ${
                completed
                    ? "bg-green-50 border-green-200"
                    : "bg-slate-50 border-slate-200"
            }`}
        >

            <div className="flex items-center gap-3">

                {completed ? (

                    <CheckCircle
                        size={20}
                        className="text-green-600"
                    />

                ) : (

                    <AlertCircle
                        size={20}
                        className="text-slate-400"
                    />

                )}

                <span
                    className={`font-medium ${
                        completed
                            ? "text-green-800"
                            : "text-slate-600"
                    }`}
                >
                    {label}
                </span>

            </div>

            <p className="text-xs mt-2 text-slate-500">

                {completed
                    ? "Available"
                    : "Pending"}

            </p>

        </div>
    );
}

export default BRSRReport;