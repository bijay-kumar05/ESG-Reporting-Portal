import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000";

function BRSRGovernance({ onBack }) {

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedYear, setSelectedYear] = useState("2026");

    const [data, setData] = useState(null);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

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
                    setSelectedProject(
                        String(response.data[0].id)
                    );
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
    // FETCH GOVERNANCE DATA
    // -----------------------------------------

    useEffect(() => {

        if (!selectedProject) {
            return;
        }

        const fetchGovernanceData = async () => {

            try {

                setLoadingData(true);
                setMessage("");

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/governance/${selectedProject}/${selectedYear}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

                setData(response.data);

            } catch (error) {

                console.error(
                    "Failed to load governance data:",
                    error
                );

                setData(null);

                if (error.response?.status === 404) {

                    setMessage(
                        "No governance data found for this project and year."
                    );

                } else {

                    setMessage(
                        "Failed to load governance data."
                    );
                }

            } finally {

                setLoadingData(false);
            }
        };

        fetchGovernanceData();

    }, [selectedProject, selectedYear]);

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

                        <div className="p-4 bg-orange-100 rounded-xl">

                            <ShieldCheck
                                size={34}
                                className="text-orange-700"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR Governance Disclosures
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Governance information derived from
                                the ESG Governance module.
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
                                onChange={(e) =>
                                    setSelectedProject(
                                        e.target.value
                                    )
                                }
                                disabled={loadingProjects}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
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

                {loadingData && (

                    <div className="bg-white rounded-2xl border p-10 flex justify-center items-center">

                        <div className="flex items-center gap-3 text-slate-600">

                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            Loading governance data...

                        </div>

                    </div>

                )}

                {/* MESSAGE */}

                {!loadingData && message && (

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-amber-800">
                        {message}
                    </div>

                )}

                {/* GOVERNANCE DATA */}

                {!loadingData && data && (

                    <>

                        {/* ETHICS & ANTI-CORRUPTION */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Ethics & Anti-Corruption
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                <Metric
                                    label="Employees Trained in Ethics"
                                    value={
                                        data.ethics_training_employees
                                    }
                                />

                                <Metric
                                    label="Anti-Corruption Cases"
                                    value={
                                        data.anti_corruption_cases
                                    }
                                />

                                <Metric
                                    label="Bribery Cases"
                                    value={
                                        data.bribery_cases
                                    }
                                />

                            </div>

                        </div>

                        {/* WHISTLEBLOWER */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Whistleblower Mechanism
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Whistleblower Complaints"
                                    value={
                                        data.whistleblower_complaints
                                    }
                                />

                                <Metric
                                    label="Complaints Resolved"
                                    value={
                                        data.whistleblower_resolved
                                    }
                                />

                            </div>

                        </div>

                        {/* REGULATORY COMPLIANCE */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Regulatory Compliance
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Regulatory Actions"
                                    value={
                                        data.regulatory_actions
                                    }
                                />

                                <Metric
                                    label="Regulatory Penalties"
                                    value={
                                        data.regulatory_penalties
                                    }
                                />

                            </div>

                        </div>

                        {/* DATA PRIVACY & CYBERSECURITY */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Data Privacy & Cybersecurity
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Data Privacy Incidents"
                                    value={
                                        data.data_privacy_incidents
                                    }
                                />

                                <Metric
                                    label="Cybersecurity Incidents"
                                    value={
                                        data.cybersecurity_incidents
                                    }
                                />

                            </div>

                        </div>

                        {/* CUSTOMER COMPLAINTS */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Customer Complaints
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Customer Complaints"
                                    value={
                                        data.customer_complaints
                                    }
                                />

                                <Metric
                                    label="Complaints Resolved"
                                    value={
                                        data.customer_complaints_resolved
                                    }
                                />

                            </div>

                        </div>

                        {/* GOVERNANCE TRAINING */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Governance Training
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Governance Training Hours"
                                    value={
                                        data.governance_training_hours
                                    }
                                />

                            </div>

                        </div>

                        {/* MEETINGS */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Board & Management Meetings
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Board Meetings"
                                    value={
                                        data.board_meetings
                                    }
                                />

                                <Metric
                                    label="Management Meetings"
                                    value={
                                        data.management_meetings
                                    }
                                />

                            </div>

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}


// -----------------------------------------
// METRIC COMPONENT
// -----------------------------------------

function Metric({ label, value }) {

    return (

        <div className="bg-slate-50 border rounded-xl p-5">

            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="text-2xl font-bold text-slate-800 mt-2">

                {value === null ||
                value === undefined ||
                value === ""
                    ? "—"
                    : Number(value).toLocaleString()}

            </p>

        </div>
    );
}

export default BRSRGovernance;