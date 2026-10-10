import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, Leaf, Loader2 } from "lucide-react";

const API_URL = "http://localhost:5000";

function BRSREnvironmental({ onBack }) {

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedYear, setSelectedYear] = useState("2026");

    const [data, setData] = useState(null);
    const [ghgData, setGhgData] = useState([]);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingData, setLoadingData] = useState(false);

    const [message, setMessage] = useState("");

    
    // FETCH PROJECTS
    

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
                    "Failed to load projects"
                );

            } finally {

                setLoadingProjects(false);
            }
        };

        fetchProjects();

    }, []);

    
    // FETCH ENVIRONMENTAL DATA
    

    useEffect(() => {

        if (!selectedProject) {
            return;
        }

        const fetchEnvironmentalData = async () => {

            try {

                setLoadingData(true);
                setMessage("");

                const token =
                    localStorage.getItem("token");

                const summaryResponse =
                    await axios.get(
                        `${API_URL}/api/environmental/summary/${selectedProject}/${selectedYear}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const summary = summaryResponse.data;

const environmentalData =
    Array.isArray(summary)
        ? summary[0]
        : summary?.data
        ? Array.isArray(summary.data)
            ? summary.data[0]
            : summary.data
        : summary;

setData(environmentalData || null);

                // Fetch GHG information
                try {

                    const ghgResponse =
                        await axios.get(
                            `${API_URL}/api/environmental/ghg/${selectedProject}/${selectedYear}`,
                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${token}`
                                }
                            }
                        );

                    const ghg =
                        ghgResponse.data;

                    if (Array.isArray(ghg)) {
                        setGhgData(ghg);
                    } else if (ghg) {
                        setGhgData([ghg]);
                    } else {
                        setGhgData([]);
                    }

                } catch (ghgError) {

                    console.error(
                        "Failed to load GHG data:",
                        ghgError
                    );

                    setGhgData([]);
                }

            } catch (error) {

                console.error(
                    "Failed to load environmental data:",
                    error
                );

                setData(null);
                setGhgData([]);

                if (error.response?.status === 404) {
                    setMessage(
                        "No environmental data found for this project and year."
                    );
                } else {
                    setMessage(
                        "Failed to load environmental data."
                    );
                }

            } finally {

                setLoadingData(false);
            }
        };

        fetchEnvironmentalData();

    }, [selectedProject, selectedYear]);

    
    // HELPER
    

    const formatValue = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        return Number(value).toLocaleString();
    };

    return (

        <div className="min-h-screen bg-slate-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* BACK */}

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

                        <div className="p-4 bg-green-100 rounded-xl">

                            <Leaf
                                size={34}
                                className="text-green-700"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR Environmental Disclosures
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Environmental information derived from
                                the ESG Environmental module.
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
                                    setSelectedProject(e.target.value)
                                }
                                disabled={loadingProjects}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
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
                                    setSelectedYear(e.target.value)
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

                </div>

                {/* LOADING */}

                {loadingData && (

                    <div className="bg-white rounded-2xl border p-10 flex justify-center items-center">

                        <div className="flex items-center gap-3 text-slate-600">

                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            Loading environmental data...

                        </div>

                    </div>

                )}

                {/* MESSAGE */}

                {!loadingData && message && (

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-amber-800">
                        {message}
                    </div>

                )}

                {/* ENVIRONMENTAL DATA */}

                {!loadingData && data && (

                    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            Environmental Performance
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                            <Metric
    label="Energy Consumption"
    value={
        data.energy_consumption ??
        data.energyConsumption
    }
/>

<Metric
    label="Renewable Energy"
    value={
        data.renewable_energy ??
        data.renewableEnergy
    }
/>

<Metric
    label="Water Consumption"
    value={
        data.water_consumption ??
        data.waterConsumption
    }
/>

<Metric
    label="Waste Generated"
    value={
        data.waste_generated ??
        data.wasteGenerated
    }
/>

<Metric
    label="Waste Recycled"
    value={
        data.waste_recycled ??
        data.wasteRecycled
    }
/>

                        </div>

                    </div>

                )}

                {/* GHG */}

                {!loadingData && (

                    <div className="bg-white rounded-2xl shadow-sm border p-6">

                        <h2 className="text-xl font-bold text-slate-800 mb-5">
                            GHG Emissions
                        </h2>

                        {ghgData.length === 0 ? (

                            <p className="text-slate-500">
                                No GHG emissions data available.
                            </p>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full text-sm">

                                    <thead>

                                        <tr className="border-b text-left">

                                            <th className="py-3 px-3">
                                                Scope
                                            </th>

                                            <th className="py-3 px-3">
                                                CO₂
                                            </th>

                                            <th className="py-3 px-3">
                                                CH₄
                                            </th>

                                            <th className="py-3 px-3">
                                                N₂O
                                            </th>

                                            <th className="py-3 px-3">
                                                HFCs
                                            </th>

                                            <th className="py-3 px-3">
                                                PFCs
                                            </th>

                                            <th className="py-3 px-3">
                                                SF₆
                                            </th>

                                            <th className="py-3 px-3">
                                                NF₃
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {ghgData.map((item, index) => (

                                            <tr
                                                key={index}
                                                className="border-b"
                                            >

                                                <td className="py-3 px-3 font-medium">
                                                    {item.scope_type ||
                                                        item.scope ||
                                                        "—"}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.co2_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.ch4_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.n2o_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.hfcs_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.pfcs_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.sf6_tco2e
                                                    )}
                                                </td>

                                                <td className="py-3 px-3">
                                                    {formatValue(
                                                        item.nf3_tco2e
                                                    )}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>
    );
}



// METRIC COMPONENT


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

export default BRSREnvironmental;