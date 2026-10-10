import { useEffect, useState } from "react";
import axios from "axios";
import {
    FileText,
    Download,
    ArrowLeft,
    Loader2,
    FileSpreadsheet
} from "lucide-react";

function Reports({ onBack, selectedProject: projectFromOverview }) {

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(
    projectFromOverview?.id || ""
);

const [selectedYear, setSelectedYear] = useState(
    projectFromOverview?.reporting_year?.toString() || "2026"
);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatingExcel, setGeneratingExcel] = useState(false);
    const [message, setMessage] = useState("");

    
    // FETCH PROJECTS
    

    useEffect(() => {

        const fetchProjects = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response =
                    await axios.get(
                        "http://localhost:5000/api/projects",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                setProjects(response.data);

                if (response.data.length > 0 && !projectFromOverview?.id) {
    setSelectedProject(response.data[0].id);
}

            } catch (error) {

                console.error(
                    "Failed to fetch projects:",
                    error
                );

                setMessage(
                    "Failed to load projects"
                );

            } finally {

                setLoadingProjects(false);

            }
        };

        fetchProjects();

    }, [projectFromOverview]);

    useEffect(() => {
    if (projectFromOverview?.id) {
        setSelectedProject(String(projectFromOverview.id));

        if (projectFromOverview.reporting_year) {
            setSelectedYear(
                String(projectFromOverview.reporting_year)
            );
        }
    }
}, [projectFromOverview]);

    
    // GENERATE PDF
    

    const generatePDF = async () => {

        if (!selectedProject) {

            setMessage(
                "Please select a project"
            );

            return;
        }

        try {

            setGenerating(true);
            setMessage("");

            const token =
                localStorage.getItem("token");

            const response =
                await axios.get(
                    `http://localhost:5000/api/reports/${selectedProject}/${selectedYear}/pdf`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },
                        responseType: "blob"
                    }
                );

            // Create downloadable file
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

            const project =
                projects.find(
                    p =>
                        Number(p.id) ===
                        Number(selectedProject)
                );

            const projectName =
                project?.project_name
                    ?.replace(/[^a-z0-9]/gi, "_") ||
                "Project";

            link.download =
                `ESG_Report_${projectName}_${selectedYear}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            setMessage(
                "PDF generated and downloaded successfully!"
            );

        } catch (error) {

            console.error(
                "PDF generation failed:",
                error
            );

            setMessage(
                "Failed to generate PDF report"
            );

        } finally {

            setGenerating(false);

        }
    };

// excel generate

    const generateExcel = async () => {

    if (!selectedProject) {
        setMessage("Please select a project");
        return;
    }

    try {

        setGeneratingExcel(true);
        setMessage("");

        const token =
            localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/reports/${selectedProject}/${selectedYear}/excel`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                },
                responseType: "blob"
            }
        );

        const blob = new Blob(
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

        const project =
            projects.find(
                p =>
                    Number(p.id) ===
                    Number(selectedProject)
            );

        const projectName =
            project?.project_name?.replace(
                /[^a-z0-9]/gi,
                "_"
            ) || "Project";

        link.download =
            `ESG_Report_${projectName}_${selectedYear}.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        setMessage(
            "Excel report generated and downloaded successfully!"
        );

    } catch (error) {

        console.error(
            "Excel generation failed:",
            error
        );

        setMessage(
            "Failed to generate Excel report"
        );

    } finally {

        setGeneratingExcel(false);

    }
};


    return (

        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}

            <div className="bg-white border-b">

                <div className="max-w-6xl mx-auto px-6 py-5">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-slate-100"
                        >
                            <ArrowLeft size={22} />
                        </button>

                        <div>

                            <h1 className="text-2xl font-bold text-slate-800">
                                ESG Reports
                            </h1>

                            <p className="text-sm text-slate-500">
                                Generate and download ESG performance reports
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* MAIN CONTENT */}

            <div className="max-w-4xl mx-auto px-6 py-10">

                <div className="bg-white rounded-2xl shadow-sm border p-8">

                    {/* ICON */}

                    <div className="flex justify-center mb-5">

                        <div className="p-4 rounded-2xl bg-green-100">

                            <FileText
                                size={42}
                                className="text-green-700"
                            />

                        </div>

                    </div>


                    <h2 className="text-2xl font-bold text-center text-slate-800">

                        Generate ESG Report

                    </h2>

                    <p className="text-center text-slate-500 mt-2 mb-8">

                        Select a project and reporting year to generate
                        the ESG performance report.

                    </p>


                    {/* FORM */}

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* PROJECT */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">

                                Project

                            </label>

                            <select
                                value={selectedProject}
                                onChange={(e) =>
                                    setSelectedProject(
                                        e.target.value
                                    )
                                }
                                disabled={loadingProjects}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
                            >

                                <option value="">

                                    Select Project

                                </option>

                                {projects.map(
                                    (project) => (

                                        <option
                                            key={project.id}
                                            value={project.id}
                                        >

                                            {project.project_name}

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* YEAR */}

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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
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


                    {/* GENERATE BUTTON */}

                    <div className="flex justify-center gap-4 mt-8">

    {/* PDF BUTTON */}

    <button
        onClick={generatePDF}
        disabled={
            generating ||
            generatingExcel ||
            !selectedProject
        }
        className="flex items-center gap-2 px-7 py-3 rounded-lg bg-green-700 text-white font-semibold hover:bg-green-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
    >
        {generating ? (
            <>
                <Loader2
                    size={20}
                    className="animate-spin"
                />
                Generating PDF...
            </>
        ) : (
            <>
                <Download size={20} />
                Generate PDF
            </>
        )}
    </button>

    {/* EXCEL BUTTON */}

    <button
        onClick={generateExcel}
        disabled={
            generating ||
            generatingExcel ||
            !selectedProject
        }
        className="flex items-center gap-2 px-7 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
    >
        {generatingExcel ? (
            <>
                <Loader2
                    size={20}
                    className="animate-spin"
                />
                Generating Excel...
            </>
        ) : (
            <>
                <FileSpreadsheet size={20} />
                Generate Excel
            </>
        )}
    </button>

</div>


                    {/* MESSAGE */}

                    {message && (

                        <div className="mt-6 text-center">

                            <p className="text-sm font-medium text-slate-700">

                                {message}

                            </p>

                        </div>

                    )}

                </div>


                {/* REPORT INFORMATION */}

                <div className="mt-6 bg-white rounded-2xl border p-6">

                    <h3 className="font-semibold text-slate-800 mb-4">

                        Report Contents

                    </h3>

                    <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">

                        <div>✓ Project Information</div>

                        <div>✓ Environmental Performance</div>

                        <div>✓ Scope 1 / 2 / 3 Emissions</div>

                        <div>✓ Social Performance</div>

                        <div>✓ Governance Performance</div>

                        <div>✓ Workflow Status</div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Reports;