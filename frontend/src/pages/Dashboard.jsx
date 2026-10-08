import {
    LayoutDashboard,
    FolderKanban,
    Leaf,
    FileText,
    BarChart3,
    Users,
    ShieldCheck,
    Settings,
    LogOut,
    Menu
} from "lucide-react";

import { useState, useEffect } from "react";
import axios from "axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";


function Dashboard({ onLogout, onNavigate }) {

    // =========================
    // BASIC DASHBOARD DATA
    // =========================

    const [projectCount, setProjectCount] = useState(0);
    const [projects, setProjects] = useState([]);

    // =========================
    // ENVIRONMENTAL DATA
    // =========================

    const [environmentalSummary, setEnvironmentalSummary] =
        useState(null);

    const [socialSummary, setSocialSummary] = useState(null);

    const [governanceSummary, setGovernanceSummary] = useState(null);

    const [workflowStatus, setWorkflowStatus] = useState(null);

    const [selectedProject, setSelectedProject] =
        useState("");

    const [selectedYear, setSelectedYear] =
        useState("2026");

   
    // =========================
    // USER
    // =========================

    const user = JSON.parse(
        localStorage.getItem("user")
    );


    // =========================
    // FETCH PROJECTS
    // =========================

    const fetchProjects = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/projects",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProjects(response.data);

            // Automatically select first project
            if (
                response.data.length > 0 &&
                !selectedProject
            ) {

                setSelectedProject(
                    response.data[0].id
                );

            }

        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error
            );

        }

    };


    // =========================
    // FETCH PROJECT COUNT
    // =========================

    const fetchProjectCount = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/projects/count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProjectCount(
                response.data.total
            );

        } catch (error) {

            console.error(
                "Failed to fetch project count:",
                error
            );

        }

    };

// =========================
// FETCH ENVIRONMENTAL SUMMARY
// =========================

const fetchEnvironmentalSummary = async () => {

    if (!selectedProject) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/environmental/summary/${selectedProject}/${selectedYear}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (
            response.data &&
            response.data.data === null
        ) {

            setEnvironmentalSummary(null);

        } else {

            setEnvironmentalSummary(
                response.data
            );

        }

    } catch (error) {

        console.error(
            "Failed to fetch environmental summary:",
            error
        );

        setEnvironmentalSummary(null);

    }

};


// =========================
// FETCH SOCIAL SUMMARY
// =========================

const fetchSocialSummary = async () => {

    if (!selectedProject) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/social/summary/${selectedProject}/${selectedYear}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (
            response.data &&
            response.data.data === null
        ) {

            setSocialSummary(null);

        } else {

            setSocialSummary(
                response.data
            );

        }

    } catch (error) {

        console.error(
            "Failed to fetch social summary:",
            error
        );

        setSocialSummary(null);

    }

};
    
// =========================
// FETCH GOVERNANCE SUMMARY
// =========================

const fetchGovernanceSummary = async () => {

    if (!selectedProject) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/governance/summary/${selectedProject}/${selectedYear}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (
            response.data &&
            response.data.data === null
        ) {

            setGovernanceSummary(null);

        } else {

            setGovernanceSummary(
                response.data
            );

        }

    } catch (error) {

        console.error(
            "Failed to fetch governance summary:",
            error
        );

        setGovernanceSummary(null);

    }

};

// =========================
// FETCH WORKFLOW STATUS
// =========================

const fetchWorkflowStatus = async () => {

    if (!selectedProject) {
        return;
    }

    try {

        const token = localStorage.getItem("token");

        const response = await axios.get(
            `http://localhost:5000/api/workflow/${selectedProject}/${selectedYear}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log(
            "WORKFLOW STATUS:",
            response.data
        );

        setWorkflowStatus(
            response.data?.status ||
            response.data?.data?.status ||
            null
        );

    } catch (error) {

        console.error(
            "Failed to fetch workflow status:",
            error
        );

        setWorkflowStatus(null);

    }

};

    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {

        fetchProjects();
        fetchProjectCount();

    }, []);


    // =========================
    // LOAD ENVIRONMENTAL DATA
    // =========================

    useEffect(() => {

    if (selectedProject) {

        fetchEnvironmentalSummary();
        fetchSocialSummary();
        fetchGovernanceSummary();
        fetchWorkflowStatus();
    }

    }, [selectedProject, selectedYear]);

    // =========================
    // CHART DATA
    // =========================

    const ghgChartData = environmentalSummary
        ? [
            {
                name: "Scope 1",
                emissions:
                    Number(
                        environmentalSummary.scope1
                    )
            },
            {
                name: "Scope 2",
                emissions:
                    Number(
                        environmentalSummary.scope2
                    )
            },
            {
                name: "Scope 3",
                emissions:
                    Number(
                        environmentalSummary.scope3
                    )
            }
        ]
        : [];


        const workflowChartData = [
    {
        name: "Draft",
        count: workflowStatus === "DRAFT" ? 1 : 0
    },
    {
        name: "Submitted",
        count: workflowStatus === "SUBMITTED" ? 1 : 0
    },
    {
        name: "Under Review",
        count: workflowStatus === "UNDER_REVIEW" ? 1 : 0
    },
    {
        name: "Approved",
        count: workflowStatus === "APPROVED" ? 1 : 0
    },
    {
        name: "Locked",
        count: workflowStatus === "LOCKED" ? 1 : 0
    }
];

    return (

        <div className="min-h-screen bg-slate-100 flex">


            {/* ================= SIDEBAR ================= */}

            <aside className="w-64 bg-slate-900 text-white min-h-screen hidden md:block">

                {/* Logo */}

                <div className="p-6 border-b border-slate-700">

                    <h1 className="text-xl font-bold text-emerald-400">
                        ESG Portal
                    </h1>

                    <p className="text-xs text-slate-400 mt-1">
                        ESG & BRSR Management
                    </p>

                </div>


                {/* Navigation */}

                <nav className="p-4 space-y-2">


                    {/* Dashboard */}

                    <button
                        onClick={() =>
                            onNavigate("dashboard")
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-600"
                    >

                        <LayoutDashboard size={20} />

                        <span>
                            Dashboard
                        </span>

                    </button>


                    {/* Projects */}

                    <button
                        onClick={() =>
                            onNavigate("projects")
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <FolderKanban size={20} />

                        <span>
                            Projects
                        </span>

                    </button>

<button
    onClick={() => onNavigate("social")}
    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-slate-800 transition"
>
    <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
            <Users size={20} className="text-blue-600" />
        </div>

        <div>
            <h3 className="font-semibold text-green-300">
                Social ESG
            </h3>

            <p className="text-sm text-white-500">
                Workforce, safety & community reporting
            </p>
        </div>
    </div>
</button>

<button
    onClick={() => onNavigate("governance")}
    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-800 transition"
>
    <ShieldCheck size={20} />

    <span>
        Governance ESG
    </span>
</button>

{/* workflow */}
<button
    onClick={() => onNavigate("workflow")}
    className="p-5 bg-white rounded-xl shadow hover:shadow-lg text-left"
>
    <h3 className="font-semibold text-slate-800">
        ESG Status
    </h3>

    <p className="text-sm text-gray-500 mt-1">
        Submit, review and approve ESG reports
    </p>
</button>

<button
    onClick={() => onNavigate("reports")}
    className="w-full text-left p-5 bg-white border rounded-xl hover:shadow-md transition"
>
    <div className="flex items-center gap-3">

        <FileText
            size={24}
            className="text-green-700"
        />

        <div>

            <h3 className="font-semibold text-slate-800">
                ESG Reports
            </h3>

            <p className="text-sm text-slate-500">
                Generate and download ESG reports
            </p>

        </div>

    </div>
</button>

                   { /* ESG Data */ }
                    <button
                        onClick={() =>
                            onNavigate("environmental")
                        }
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <Leaf size={20} />

                        <span>
                            ESG Data
                        </span>

                    </button>


                    {/* BRSR */}

<button
    onClick={() => onNavigate("brsr-dashboard")}
    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-slate-800 transition"
>
    <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg">
    <FileText className="text-emerald-600 mb-2" />
    </div>
    <p className="font-semibold">
        BRSR Report
    </p>

    <p className="text-xs text-slate-500">
        Manage BRSR reporting
    </p>
    </div>
</button>


                    {/* Reports */}

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <BarChart3 size={20} />

                        <span>
                            Reports
                        </span>

                    </button>


                    {/* Users */}

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <Users size={20} />

                        <span>
                            Users
                        </span>

                    </button>


                    {/* Audit Logs */}

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <ShieldCheck size={20} />

                        <span>
                            Audit Logs
                        </span>

                    </button>


                    {/* Settings */}

                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800"
                    >

                        <Settings size={20} />

                        <span>
                            Settings
                        </span>

                    </button>

                </nav>

            </aside>


            {/* ================= MAIN AREA ================= */}

            <div className="flex-1 min-w-0">


                {/* ================= TOP BAR ================= */}

                <header className="bg-white border-b px-6 py-4 flex justify-between items-center">

                    <div className="flex items-center gap-3">

                        <Menu className="md:hidden" />

                        <div>

                            <h2 className="text-xl font-semibold text-slate-800">
                                Dashboard
                            </h2>

                            <p className="text-sm text-slate-500">
                                ESG performance overview
                            </p>

                        </div>

                    </div>


                    {/* User */}

                    <div className="flex items-center gap-4">

                        <div className="text-right hidden sm:block">

                            <p className="font-semibold text-slate-700">
                                {user?.name}
                            </p>

                            <p className="text-xs text-slate-500">
                                {user?.role}
                            </p>

                        </div>


                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        >

                            <LogOut size={17} />

                            Logout

                        </button>

                    </div>

                </header>


                {/* ================= CONTENT ================= */}

                <main className="p-6">


                    {/* Welcome */}

                    <div className="mb-6">

                        <h1 className="text-3xl font-bold text-slate-800">
                            Welcome back 👋
                        </h1>

                        <p className="text-slate-500 mt-1">
                            Monitor your organization's ESG and BRSR reporting activities.
                        </p>

                    </div>


                    {/* ================= KPI CARDS ================= */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                        {/* Total Projects */}

                        <div className="bg-white rounded-xl p-6 shadow-sm border">

                            <p className="text-sm text-slate-500">
                                Total Projects
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                {projectCount}
                            </h3>

                            <p className="text-xs text-emerald-600 mt-2">
                                Active projects
                            </p>

                        </div>


                        {/* ESG Submissions */}

                        <div className="bg-white rounded-xl p-6 shadow-sm border">

                            <p className="text-sm text-slate-500">
                                ESG Submissions
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                0
                            </h3>

                            <p className="text-xs text-blue-600 mt-2">
                                This reporting period
                            </p>

                        </div>


                        {/* Pending Review */}

                        <div className="bg-white rounded-xl p-6 shadow-sm border">

                            <p className="text-sm text-slate-500">
                                Pending Review
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                0
                            </h3>

                            <p className="text-xs text-orange-600 mt-2">
                                Requires attention
                            </p>

                        </div>


                        {/* Reports */}

                        <div className="bg-white rounded-xl p-6 shadow-sm border">

                            <p className="text-sm text-slate-500">
                                Reports Generated
                            </p>

                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                0
                            </h3>

                            <p className="text-xs text-purple-600 mt-2">
                                ESG / BRSR reports
                            </p>

                        </div>

                    </div>


                    {/* ================= ENVIRONMENTAL PERFORMANCE ================= */}

                    <div className="mt-6">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">

                            <div>

                                <h2 className="text-xl font-bold text-slate-800">
                                    Environmental Performance
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Environmental metrics for the selected project
                                </p>

                            </div>


                            {/* Filters */}

                            <div className="flex gap-3 mt-4 md:mt-0">

                                <select
                                    value={selectedProject}
                                    onChange={(e) =>
                                        setSelectedProject(
                                            e.target.value
                                        )
                                    }
                                    className="border bg-white rounded-lg px-3 py-2 text-sm"
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


                                <select
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(
                                            e.target.value
                                        )
                                    }
                                    className="border bg-white rounded-lg px-3 py-2 text-sm"
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


                        {/* Environmental Cards */}

                        {!environmentalSummary ? (

                            <div className="bg-white rounded-xl border shadow-sm p-8 text-center">

                                <Leaf
                                    size={45}
                                    className="mx-auto text-slate-300"
                                />

                                <p className="text-slate-500 mt-3">
                                    No environmental data available for this project and year.
                                </p>

                                <button
                                    onClick={() =>
                                        onNavigate("environmental")
                                    }
                                    className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg"
                                >
                                    Enter Environmental Data
                                </button>

                            </div>

                        ) : (

                            <>

                                {/* GHG Cards */}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                                    {/* Scope 1 */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Scope 1
                                        </p>

                                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                            {Number(
                                                environmentalSummary.scope1
                                            ).toFixed(4)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            tCO₂e • Direct emissions
                                        </p>

                                    </div>


                                    {/* Scope 2 */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Scope 2
                                        </p>

                                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                            {Number(
                                                environmentalSummary.scope2
                                            ).toFixed(4)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            tCO₂e • Indirect emissions
                                        </p>

                                    </div>


                                    {/* Scope 3 */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Scope 3
                                        </p>

                                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                            {Number(
                                                environmentalSummary.scope3
                                            ).toFixed(4)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            tCO₂e • Other indirect emissions
                                        </p>

                                    </div>


                                    {/* Total GHG */}

                                    <div className="bg-emerald-50 rounded-xl p-5 shadow-sm border border-emerald-200">

                                        <p className="text-sm text-emerald-700">
                                            Total GHG Emissions
                                        </p>

                                        <h3 className="text-2xl font-bold text-emerald-800 mt-2">
                                            {Number(
                                                environmentalSummary.totalGHG
                                            ).toFixed(4)}
                                        </h3>

                                        <p className="text-xs text-emerald-600 mt-1">
                                            tCO₂e • Scope 1 + 2 + 3
                                        </p>

                                    </div>

                                </div>


                                {/* Resource Cards */}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">


                                    {/* Energy */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Energy Consumption
                                        </p>

                                        <h3 className="text-2xl font-bold text-slate-800 mt-2">
                                            {Number(
                                                environmentalSummary.energyConsumption
                                            ).toFixed(2)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Energy consumption
                                        </p>

                                    </div>


                                    {/* Renewable */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Renewable Energy
                                        </p>

                                        <h3 className="text-2xl font-bold text-emerald-600 mt-2">
                                            {Number(
                                                environmentalSummary.renewableEnergy
                                            ).toFixed(2)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Renewable energy
                                        </p>

                                    </div>


                                    {/* Water */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Water Consumption
                                        </p>

                                        <h3 className="text-2xl font-bold text-blue-600 mt-2">
                                            {Number(
                                                environmentalSummary.waterConsumption
                                            ).toFixed(2)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Water consumption
                                        </p>

                                    </div>


                                    {/* Waste */}

                                    <div className="bg-white rounded-xl p-5 shadow-sm border">

                                        <p className="text-sm text-slate-500">
                                            Waste Generated
                                        </p>

                                        <h3 className="text-2xl font-bold text-orange-600 mt-2">
                                            {Number(
                                                environmentalSummary.wasteGenerated
                                            ).toFixed(2)}
                                        </h3>

                                        <p className="text-xs text-slate-500 mt-1">
                                            Recycled:{" "}
                                            {Number(
                                                environmentalSummary.wasteRecycled
                                            ).toFixed(2)}
                                        </p>

                                    </div>

                                </div>


                                {/* Chart */}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">


                                    {/* GHG Chart */}

                                    <div className="bg-white rounded-xl shadow-sm border p-6">

                                        <h2 className="text-lg font-semibold text-slate-800">
                                            GHG Emissions by Scope
                                        </h2>

                                        <p className="text-sm text-slate-500 mb-5">
                                            Emissions in tCO₂e
                                        </p>

                                        <div className="h-72">

                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >

                                                <BarChart
                                                    data={ghgChartData}
                                                >

                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                    />

                                                    <XAxis
                                                        dataKey="name"
                                                    />

                                                    <YAxis />

                                                    <Tooltip />

                                                    <Bar
                                                        dataKey="emissions"
                                                        fill="#10b981"
                                                        radius={[
                                                            6,
                                                            6,
                                                            0,
                                                            0
                                                        ]}
                                                    />

                                                </BarChart>

                                            </ResponsiveContainer>

                                        </div>

                                    </div>


                                    {/* Environmental Summary */}

                                    <div className="bg-white rounded-xl shadow-sm border p-6">

                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Environmental Summary
                                        </h2>

                                        <p className="text-sm text-slate-500 mb-5">
                                            Selected project performance
                                        </p>


                                        <div className="space-y-4">


                                            <div className="flex justify-between border-b pb-3">

                                                <span className="text-slate-600">
                                                    Energy Consumption
                                                </span>

                                                <span className="font-semibold">
                                                    {Number(
                                                        environmentalSummary.energyConsumption
                                                    ).toFixed(2)}
                                                </span>

                                            </div>


                                            <div className="flex justify-between border-b pb-3">

                                                <span className="text-slate-600">
                                                    Renewable Energy
                                                </span>

                                                <span className="font-semibold text-emerald-600">
                                                    {Number(
                                                        environmentalSummary.renewableEnergy
                                                    ).toFixed(2)}
                                                </span>

                                            </div>


                                            <div className="flex justify-between border-b pb-3">

                                                <span className="text-slate-600">
                                                    Water Consumption
                                                </span>

                                                <span className="font-semibold text-blue-600">
                                                    {Number(
                                                        environmentalSummary.waterConsumption
                                                    ).toFixed(2)}
                                                </span>

                                            </div>


                                            <div className="flex justify-between border-b pb-3">

                                                <span className="text-slate-600">
                                                    Waste Generated
                                                </span>

                                                <span className="font-semibold text-orange-600">
                                                    {Number(
                                                        environmentalSummary.wasteGenerated
                                                    ).toFixed(2)}
                                                </span>

                                            </div>


                                            <div className="flex justify-between border-b pb-3">

                                                <span className="text-slate-600">
                                                    Waste Recycled
                                                </span>

                                                <span className="font-semibold text-emerald-600">
                                                    {Number(
                                                        environmentalSummary.wasteRecycled
                                                    ).toFixed(2)}
                                                </span>

                                            </div>


                                            <div className="flex justify-between pt-2">

                                                <span className="font-semibold text-slate-700">
                                                    Total GHG
                                                </span>

                                                <span className="font-bold text-emerald-700">
                                                    {Number(
                                                        environmentalSummary.totalGHG
                                                    ).toFixed(4)}
                                                    {" "}tCO₂e
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </>

                        )}

                    </div>

                        {/* SOCIAL ESG PERFORMANCE */}

<div className="mt-8">

    <div className="mb-5">

        <h2 className="text-xl font-bold text-gray-900">
            Social ESG Performance
        </h2>

        <p className="text-sm text-gray-500">
            Workforce, safety, training and community performance
        </p>

    </div>


    {socialSummary ? (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Total Employees */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Total Employees
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.totalEmployees}
                </p>

            </div>


            {/* Employees Trained */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Employees Trained
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.employeesTrained}
                </p>

            </div>


            {/* Workplace Accidents */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Workplace Accidents
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.workplaceAccidents}
                </p>

            </div>


            {/* Fatalities */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Fatalities
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.fatalities}
                </p>

            </div>


            {/* Female Employees */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Female Employees
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.femaleEmployees}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                    {socialSummary.femalePercentage}%
                </p>

            </div>


            {/* Training Hours */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Training Hours
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.trainingHours}
                </p>

            </div>


            {/* Grievance Resolution */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Grievance Resolution
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-2">
                    {socialSummary.grievanceResolutionRate}%
                </p>

            </div>


            {/* Community Investment */}

            <div className="bg-white border rounded-xl p-5 shadow-sm">

                <p className="text-sm text-gray-500">
                    Community Investment
                </p>

                <p className="text-2xl font-bold text-gray-900 mt-2">
                    ₹{Number(
                        socialSummary.communityInvestment
                    ).toLocaleString("en-IN")}
                </p>

            </div>

        </div>

    ) : (

        <div className="bg-white border rounded-xl p-8 text-center">

            <p className="text-gray-500">
                No social data available for this project and year.
            </p>

        </div>

    )}

</div>

{/* =========================
    GOVERNANCE PERFORMANCE
========================= */}

<div className="mt-8">

    <div className="mb-5">

        <h2 className="text-xl font-bold text-slate-900">
            Governance Performance
        </h2>

        <p className="text-sm text-slate-500">
            Governance, ethics, compliance and accountability metrics
        </p>

    </div>


    {!governanceSummary ? (

        <div className="bg-white border rounded-2xl p-8 text-center">

            <ShieldCheck
                size={40}
                className="mx-auto mb-3 text-slate-400"
            />

            <p className="text-slate-500">
                No governance data available for this project and year.
            </p>

        </div>

    ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">


            {/* ETHICS TRAINING */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Ethics Training
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.ethicsTrainingEmployees}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Employees trained
                </p>

            </div>


            {/* ANTI-CORRUPTION */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Anti-Corruption Cases
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.antiCorruptionCases}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Reported cases
                </p>

            </div>


            {/* WHISTLEBLOWER */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Whistleblower Resolution
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.whistleblowerResolutionRate}%
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Complaints resolved
                </p>

            </div>


            {/* REGULATORY */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Regulatory Actions
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.regulatoryActions}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Actions recorded
                </p>

            </div>


            {/* CYBERSECURITY */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Cybersecurity Incidents
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.cybersecurityIncidents}
                </p>

            </div>


            {/* PRIVACY */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Data Privacy Incidents
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.dataPrivacyIncidents}
                </p>

            </div>


            {/* CUSTOMER COMPLAINTS */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Customer Complaints
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.customerComplaints}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    {governanceSummary.customerResolutionRate}%
                    {" "}resolved
                </p>

            </div>


            {/* BOARD MEETINGS */}

            <div className="bg-white border rounded-2xl p-5">

                <p className="text-sm text-slate-500">
                    Board Meetings
                </p>

                <p className="text-2xl font-bold mt-2">
                    {governanceSummary.boardMeetings}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                    Meetings conducted
                </p>

            </div>

        </div>

    )}

</div>

                    {/* ================= OVERVIEW + STATUS ================= */}

                    <div className="mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">


                            {/* ESG Reporting Overview */}

                            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">

                                <div className="flex justify-between items-center mb-6">

                                    <div>

                                        <h2 className="text-lg font-semibold text-slate-800">
                                            ESG Reporting Overview
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Reporting activity
                                        </p>

                                    </div>

                                    <span className="text-sm text-slate-500">
                                        {selectedYear}
                                    </span>

                                </div>


                                <div className="h-56">

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <BarChart
                                            data={workflowChartData}
                                        >

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                            />

                                            <XAxis
                                                dataKey="name"
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                            />

                                            <Tooltip />

                                            <Bar
                                                dataKey="count"
                                                fill="#10b981"
                                                radius={[6, 6, 0, 0]}
                                            />

                                        </BarChart>

                                    </ResponsiveContainer>

                                </div>

                            </div>


                            {/* Submission Status */}

                            <div className="bg-white rounded-xl shadow-sm border p-6">

                                <h2 className="text-lg font-semibold text-slate-800">
                                    Submission Status
                                </h2>

                                <p className="text-sm text-slate-500 mb-6">
                                    Current reporting workflow
                                </p>


                                <div className="space-y-4">

                                    {/* Current Status */}

                                    <div className="bg-slate-50 rounded-xl p-5">

                                        <p className="text-sm text-slate-500">
                                            Current Status
                                        </p>

                                        <p className="text-2xl font-bold text-slate-800 mt-2">
                                            {workflowStatus
                                                ? workflowStatus.replace("_", " ")
                                                : "Not Started"}
                                        </p>

                                    </div>


                                    {/* Status Indicator */}

                                    <div className="flex items-center gap-3">

                                        <div
                                            className={`w-3 h-3 rounded-full ${
                                                workflowStatus === "APPROVED" ||
                                                workflowStatus === "LOCKED"
                                                    ? "bg-emerald-500"
                                                    : workflowStatus === "UNDER_REVIEW"
                                                    ? "bg-orange-400"
                                                    : workflowStatus === "SUBMITTED"
                                                    ? "bg-blue-500"
                                                    : workflowStatus === "REJECTED"
                                                    ? "bg-red-500"
                                                    : "bg-slate-400"
                                            }`}
                                        />

                                        <span className="text-sm text-slate-600">
                                            {workflowStatus
                                                ? `Report is currently ${workflowStatus.replace("_", " ").toLowerCase()}`
                                                : "No submission has been created yet."}
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>


                    {/* ================= RECENT PROJECTS ================= */}

                    <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">

                        <div className="flex items-center justify-between mb-5">

                            <div>

                                <h2 className="text-xl font-bold text-gray-800">
                                    Recent Projects
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Projects registered in the ESG Reporting Portal
                                </p>

                            </div>


                            <button
                                onClick={() =>
                                    onNavigate("projects")
                                }
                                className="text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                View All
                            </button>

                        </div>


                        {projects.length === 0 ? (

                            <div className="text-center py-8 text-gray-500">

                                No projects found.

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b text-left text-sm text-gray-500">

                                            <th className="py-3 px-3">
                                                Project
                                            </th>

                                            <th className="py-3 px-3">
                                                Organization
                                            </th>

                                            <th className="py-3 px-3">
                                                Location
                                            </th>

                                            <th className="py-3 px-3">
                                                Manager
                                            </th>

                                            <th className="py-3 px-3">
                                                Year
                                            </th>

                                            <th className="py-3 px-3">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {projects
                                            .slice(0, 5)
                                            .map((project) => (

                                                <tr
                                                    key={project.id}
                                                    className="border-b last:border-0 hover:bg-gray-50"
                                                >

                                                    <td className="py-4 px-3 font-medium text-gray-800">

                                                        {project.project_name}

                                                    </td>


                                                    <td className="py-4 px-3">

                                                        {project.organization}

                                                    </td>


                                                    <td className="py-4 px-3">

                                                        {project.location}

                                                    </td>


                                                    <td className="py-4 px-3">

                                                        {project.project_manager || "—"}

                                                    </td>


                                                    <td className="py-4 px-3">

                                                        {project.reporting_year}

                                                    </td>


                                                    <td className="py-4 px-3">

                                                        <span
                                                            className={
                                                                project.status === "ACTIVE"
                                                                    ? "px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"
                                                                    : "px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600"
                                                            }
                                                        >

                                                            {project.status}

                                                        </span>

                                                    </td>

                                                </tr>

                                            ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>


                    {/* ================= QUICK ACTIONS ================= */}

                    <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">

                        <h2 className="text-lg font-semibold text-slate-800">
                            Quick Actions
                        </h2>


                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">


                            {/* Add Project */}

                            <button
                                onClick={() =>
                                    onNavigate("projects")
                                }
                                className="p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50"
                            >

                                <FolderKanban className="text-emerald-600 mb-2" />

                                <p className="font-semibold">
                                    Add Project
                                </p>

                                <p className="text-xs text-slate-500">
                                    Create a new project
                                </p>

                            </button>


                            {/* ESG Data */}

                            <button
                                onClick={() =>
                                    onNavigate("environmental")
                                }
                                className="p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50"
                            >

                                <Leaf className="text-emerald-600 mb-2" />

                                <p className="font-semibold">
                                    Enter ESG Data
                                </p>

                                <p className="text-xs text-slate-500">
                                    Submit ESG information
                                </p>

                            </button>


                            {/* BRSR */}

                            <button
                             onClick={() =>
                                 onNavigate("brsr-report")}
                                className="p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50"
                            >

                                <FileText className="text-emerald-600 mb-2" />

                                <p className="font-semibold">
                                    BRSR Report
                                </p>

                                <p className="text-xs text-slate-500">
                                    Manage BRSR reporting
                                </p>

                            </button>


                            {/* Generate Report */}

                            <button onClick={() => 
                                onNavigate("reports")}
                                className="p-4 border rounded-lg text-left hover:border-emerald-500 hover:bg-emerald-50"
                            >

                                <BarChart3 className="text-emerald-600 mb-2" />

                                <p className="font-semibold">
                                    Generate Report
                                </p>

                                <p className="text-xs text-slate-500">
                                    Create ESG report
                                </p>

                            </button>

                        </div>

                    </div>

                </main>

            </div>

        </div>

    );
}


export default Dashboard;