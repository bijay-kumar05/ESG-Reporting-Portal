import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Users, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000";

function BRSRSocial({ onBack }) {

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
    // FETCH SOCIAL DATA
    // -----------------------------------------

    useEffect(() => {

        if (!selectedProject) {
            return;
        }

        const fetchSocialData = async () => {

            try {

                setLoadingData(true);
                setMessage("");

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `${API_URL}/api/social/${selectedProject}/${selectedYear}`,
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
                    "Failed to load social data:",
                    error
                );

                setData(null);

                if (error.response?.status === 404) {

                    setMessage(
                        "No social data found for this project and year."
                    );

                } else {

                    setMessage(
                        "Failed to load social data."
                    );
                }

            } finally {

                setLoadingData(false);
            }
        };

        fetchSocialData();

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

                        <div className="p-4 bg-purple-100 rounded-xl">

                            <Users
                                size={34}
                                className="text-purple-700"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR Social Disclosures
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Social information derived from
                                the ESG Social module.
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
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

                            Loading social data...

                        </div>

                    </div>

                )}

                {/* MESSAGE */}

                {!loadingData && message && (

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-amber-800">
                        {message}
                    </div>

                )}

                {/* SOCIAL DATA */}

                {!loadingData && data && (

                    <>

                        {/* EMPLOYEE INFORMATION */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Workforce Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                <Metric
                                    label="Total Employees"
                                    value={data.total_employees}
                                />

                                <Metric
                                    label="Male Employees"
                                    value={data.male_employees}
                                />

                                <Metric
                                    label="Female Employees"
                                    value={data.female_employees}
                                />

                                <Metric
                                    label="Other Gender Employees"
                                    value={data.other_gender_employees}
                                />

                                <Metric
                                    label="Permanent Employees"
                                    value={data.permanent_employees}
                                />

                                <Metric
                                    label="Contractual Employees"
                                    value={data.contractual_employees}
                                />

                            </div>

                        </div>

                        {/* TRAINING */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Training & Development
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Employees Trained"
                                    value={data.employees_trained}
                                />

                                <Metric
                                    label="Training Hours"
                                    value={data.training_hours}
                                />

                            </div>

                        </div>

                        {/* HEALTH & SAFETY */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Health & Safety
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                                <Metric
                                    label="Workplace Accidents"
                                    value={data.workplace_accidents}
                                />

                                <Metric
                                    label="Fatalities"
                                    value={data.fatalities}
                                />

                                <Metric
                                    label="Lost Time Injuries"
                                    value={data.lost_time_injuries}
                                />

                            </div>

                        </div>

                        {/* GRIEVANCES */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Employee Grievances
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Employee Grievances"
                                    value={data.employee_grievances}
                                />

                                <Metric
                                    label="Grievances Resolved"
                                    value={data.grievances_resolved}
                                />

                            </div>

                        </div>

                        {/* COMMUNITY */}

                        <div className="bg-white rounded-2xl shadow-sm border p-6">

                            <h2 className="text-xl font-bold text-slate-800 mb-5">
                                Community Investment
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <Metric
                                    label="Community Investment"
                                    value={data.community_investment}
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

export default BRSRSocial;