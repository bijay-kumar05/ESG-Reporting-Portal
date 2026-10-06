import { useEffect, useState } from "react";
import axios from "axios";

const gases = [
    { key: "co2", name: "Carbon Dioxide (CO₂)" },
    { key: "ch4", name: "Methane (CH₄)" },
    { key: "n2o", name: "Nitrous Oxide (N₂O)" },
    { key: "hfcs", name: "Hydrofluorocarbons (HFCs)" },
    { key: "pfcs", name: "Perfluorocarbons (PFCs)" },
    { key: "sf6", name: "Sulphur Hexafluoride (SF₆)" },
    { key: "nf3", name: "Nitrogen Trifluoride (NF₃)" }
];

const emptyScope = () => ({
    co2: "",
    ch4: "",
    n2o: "",
    hfcs: "",
    pfcs: "",
    sf6: "",
    nf3: ""
});


function Environmental({ onBack, selectedProject }) {

    const [projects, setProjects] = useState([]);

    const [formData, setFormData] = useState({
        projectId: selectedProject?.id || "",
        reportingYear:
            selectedProject?.reporting_year?.toString() || "2026",

        energyConsumption: "",
        renewableEnergy: "",
        waterConsumption: "",
        wasteGenerated: "",
        wasteRecycled: ""
    });

    const [scope1, setScope1] = useState(emptyScope());
    const [scope2, setScope2] = useState(emptyScope());
    const [scope3, setScope3] = useState(emptyScope());

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);


    // =====================================================
    // FETCH PROJECTS
    // =====================================================

    const fetchProjects = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                "http://localhost:5000/api/projects",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setProjects(response.data);

        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error
            );

        }
    };


    // =====================================================
    // FETCH EXISTING ENVIRONMENTAL + GHG DATA
    // =====================================================

    const fetchEnvironmentalData = async (
        projectId,
        year
    ) => {

        if (!projectId) {
            return;
        }

        try {

            setLoadingData(true);

            const token =
                localStorage.getItem("token");


            // =================================================
            // GET COMPLETE ENVIRONMENTAL DATA
            // =================================================

            const response = await axios.get(
                `http://localhost:5000/api/environmental/details/${projectId}/${year}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            const result = response.data;


            // =================================================
            // ENVIRONMENTAL DATA
            // =================================================

            if (result.environmental) {

                const environmental =
                    result.environmental;

                setFormData((prev) => ({
                    ...prev,

                    projectId:
                        projectId,

                    reportingYear:
                        year.toString(),

                    energyConsumption:
                        environmental.energy_consumption ??
                        "",

                    renewableEnergy:
                        environmental.renewable_energy ??
                        "",

                    waterConsumption:
                        environmental.water_consumption ??
                        "",

                    wasteGenerated:
                        environmental.waste_generated ??
                        "",

                    wasteRecycled:
                        environmental.waste_recycled ??
                        ""
                }));

            }


            // =================================================
            // SCOPE 1
            // =================================================

            if (result.scope1) {

                setScope1({

                    co2:
                        result.scope1.co2 ?? "",

                    ch4:
                        result.scope1.ch4 ?? "",

                    n2o:
                        result.scope1.n2o ?? "",

                    hfcs:
                        result.scope1.hfcs ?? "",

                    pfcs:
                        result.scope1.pfcs ?? "",

                    sf6:
                        result.scope1.sf6 ?? "",

                    nf3:
                        result.scope1.nf3 ?? ""

                });

            } else {

                setScope1(emptyScope());

            }


            // =================================================
            // SCOPE 2
            // =================================================

            if (result.scope2) {

                setScope2({

                    co2:
                        result.scope2.co2 ?? "",

                    ch4:
                        result.scope2.ch4 ?? "",

                    n2o:
                        result.scope2.n2o ?? "",

                    hfcs:
                        result.scope2.hfcs ?? "",

                    pfcs:
                        result.scope2.pfcs ?? "",

                    sf6:
                        result.scope2.sf6 ?? "",

                    nf3:
                        result.scope2.nf3 ?? ""

                });

            } else {

                setScope2(emptyScope());

            }


            // =================================================
            // SCOPE 3
            // =================================================

            if (result.scope3) {

                setScope3({

                    co2:
                        result.scope3.co2 ?? "",

                    ch4:
                        result.scope3.ch4 ?? "",

                    n2o:
                        result.scope3.n2o ?? "",

                    hfcs:
                        result.scope3.hfcs ?? "",

                    pfcs:
                        result.scope3.pfcs ?? "",

                    sf6:
                        result.scope3.sf6 ?? "",

                    nf3:
                        result.scope3.nf3 ?? ""

                });

            } else {

                setScope3(emptyScope());

            }


        } catch (error) {

            console.error(
                "Failed to load environmental data:",
                error
            );

            // =====================================================
// FETCH GHG DATA
// =====================================================

const ghgResponse = await axios.get(
    `http://localhost:5000/api/environmental/ghg/${projectId}/${year}`,
    {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

const ghgRows = ghgResponse.data;

console.log("GHG DATA FROM SERVER:", ghgRows);


// =====================================================
// SCOPE 1
// =====================================================

const scope1Data = ghgRows.find(
    (row) => row.scope_type === "SCOPE_1"
);

if (scope1Data) {

    setScope1({
        co2: scope1Data.co2_tco2e ?? "",
        ch4: scope1Data.ch4_tco2e ?? "",
        n2o: scope1Data.n2o_tco2e ?? "",
        hfcs: scope1Data.hfcs_tco2e ?? "",
        pfcs: scope1Data.pfcs_tco2e ?? "",
        sf6: scope1Data.sf6_tco2e ?? "",
        nf3: scope1Data.nf3_tco2e ?? ""
    });

}


// =====================================================
// SCOPE 2
// =====================================================

const scope2Data = ghgRows.find(
    (row) => row.scope_type === "SCOPE_2"
);

if (scope2Data) {

    setScope2({
        co2: scope2Data.co2_tco2e ?? "",
        ch4: scope2Data.ch4_tco2e ?? "",
        n2o: scope2Data.n2o_tco2e ?? "",
        hfcs: scope2Data.hfcs_tco2e ?? "",
        pfcs: scope2Data.pfcs_tco2e ?? "",
        sf6: scope2Data.sf6_tco2e ?? "",
        nf3: scope2Data.nf3_tco2e ?? ""
    });

}


// =====================================================
// SCOPE 3
// =====================================================

const scope3Data = ghgRows.find(
    (row) => row.scope_type === "SCOPE_3"
);

if (scope3Data) {

    setScope3({
        co2: scope3Data.co2_tco2e ?? "",
        ch4: scope3Data.ch4_tco2e ?? "",
        n2o: scope3Data.n2o_tco2e ?? "",
        hfcs: scope3Data.hfcs_tco2e ?? "",
        pfcs: scope3Data.pfcs_tco2e ?? "",
        sf6: scope3Data.sf6_tco2e ?? "",
        nf3: scope3Data.nf3_tco2e ?? ""
    });

}

            // =================================================
            // FALLBACK TO SUMMARY API
            // =================================================

            try {

                const token =
                    localStorage.getItem("token");


                const response = await axios.get(
                    `http://localhost:5000/api/environmental/summary/${projectId}/${year}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                const summary =
                    response.data?.data ??
                    response.data;


                if (summary) {

                    setFormData((prev) => ({
                        ...prev,

                        projectId:
                            projectId,

                        reportingYear:
                            year.toString(),

                        energyConsumption:
                            summary.energy_consumption ??
                            summary.energyConsumption ??
                            "",

                        renewableEnergy:
                            summary.renewable_energy ??
                            summary.renewableEnergy ??
                            "",

                        waterConsumption:
                            summary.water_consumption ??
                            summary.waterConsumption ??
                            "",

                        wasteGenerated:
                            summary.waste_generated ??
                            summary.wasteGenerated ??
                            "",

                        wasteRecycled:
                            summary.waste_recycled ??
                            summary.wasteRecycled ??
                            ""
                    }));

                }

            } catch (summaryError) {

                console.error(
                    "Failed to load environmental summary:",
                    summaryError
                );

            }

        } finally {

            setLoadingData(false);

        }
    };


    // =====================================================
    // INITIAL PROJECT FETCH
    // =====================================================

    useEffect(() => {

        fetchProjects();

    }, []);


    // =====================================================
    // LOAD SELECTED PROJECT
    // =====================================================

    useEffect(() => {

        if (!selectedProject) {
            return;
        }


        const projectId =
            selectedProject.id;


        const year =
            selectedProject.reporting_year
                ?.toString() ||
            "2026";


        // Automatically select project + year

        setFormData((prev) => ({

            ...prev,

            projectId:
                projectId,

            reportingYear:
                year

        }));


        // Load existing data

        fetchEnvironmentalData(
            projectId,
            year
        );

    }, [selectedProject]);


    // =====================================================
    // HANDLE NORMAL FORM CHANGE
    // =====================================================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]:
                e.target.value

        });

    };


    // =====================================================
    // UPDATE GHG SCOPE
    // =====================================================

    const updateScope = (
        scopeSetter,
        scope,
        key,
        value
    ) => {

        scopeSetter({

            ...scope,

            [key]:
                value

        });

    };


    // =====================================================
    // CALCULATE GHG TOTAL
    // =====================================================

    const calculateTotal = (scope) => {

        return Object.values(scope)

            .reduce(
                (total, value) =>
                    total +
                    (parseFloat(value) || 0),
                0
            )

            .toFixed(4);

    };


    // =====================================================
    // SAVE ENVIRONMENTAL DATA
    // =====================================================

    const saveEnvironmentalData = async (e) => {

        e.preventDefault();


        if (!formData.projectId) {

            alert(
                "Please select a project"
            );

            return;
        }


        try {

            setLoading(true);


            const token =
                localStorage.getItem("token");


            await axios.post(
                "http://localhost:5000/api/environmental",

                {

                    projectId:
                        formData.projectId,

                    reportingYear:
                        formData.reportingYear,

                    energyConsumption:
                        formData.energyConsumption,

                    renewableEnergy:
                        formData.renewableEnergy,

                    waterConsumption:
                        formData.waterConsumption,

                    wasteGenerated:
                        formData.wasteGenerated,

                    wasteRecycled:
                        formData.wasteRecycled,

                    scope1,

                    scope2,

                    scope3

                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


            alert(
                "Environmental data saved successfully!"
            );


            // Reload saved data

            await fetchEnvironmentalData(
                formData.projectId,
                formData.reportingYear
            );


        } catch (error) {

            console.error(
                "Environmental save error:",
                error
            );


            alert(
                error.response?.data?.message ||
                "Failed to save environmental data"
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // RENDER SCOPE
    // =====================================================

    const renderScope = (
        title,
        scope,
        setScope
    ) => (

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h3 className="text-xl font-bold text-gray-800">

                        {title}

                    </h3>

                    <p className="text-sm text-gray-500 mt-1">

                        Greenhouse gas emissions

                    </p>

                </div>


                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-semibold">

                    Total:
                    {" "}
                    {calculateTotal(scope)}
                    {" "}
                    tCO₂e

                </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {gases.map((gas) => (

                    <div key={gas.key}>

                        <label className="block text-sm font-medium text-gray-700 mb-1">

                            {gas.name}

                        </label>


                        <div className="flex">

                            <input
                                type="number"
                                min="0"
                                step="0.0001"
                                value={
                                    scope[gas.key]
                                }
                                onChange={(e) =>
                                    updateScope(
                                        setScope,
                                        scope,
                                        gas.key,
                                        e.target.value
                                    )
                                }
                                placeholder="0.0000"
                                className="w-full border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />


                            <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 flex items-center text-sm text-gray-500 rounded-r-lg">

                                tCO₂e

                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="min-h-screen bg-slate-100">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">

                <div>

                    <h1 className="text-2xl font-bold text-gray-800">

                        Environmental ESG Data

                    </h1>

                    <p className="text-sm text-gray-500">

                        Environmental performance and greenhouse gas reporting

                    </p>

                </div>


                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >

                    ← Back

                </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
                onSubmit={
                    saveEnvironmentalData
                }
                className="max-w-7xl mx-auto p-6 space-y-6"
            >


                {/* =================================================
                    REPORTING INFORMATION
                ================================================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                    <h2 className="text-lg font-bold text-gray-800 mb-4">

                        Reporting Information

                    </h2>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">


                        {/* PROJECT */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Project

                            </label>


                            <select
                                name="projectId"
                                value={
                                    formData.projectId
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="w-full border border-gray-300 rounded-lg p-3"
                            >

                                <option value="">

                                    Select Project

                                </option>


                                {projects.map(
                                    (project) => (

                                        <option
                                            key={
                                                project.id
                                            }
                                            value={
                                                project.id
                                            }
                                        >

                                            {
                                                project.project_name
                                            }

                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* REPORTING YEAR */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Reporting Year

                            </label>


                            <select
                                name="reportingYear"
                                value={
                                    formData.reportingYear
                                }
                                onChange={
                                    handleChange
                                }
                                className="w-full border border-gray-300 rounded-lg p-3"
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


                {/* =================================================
                    RESOURCE CONSUMPTION & WASTE
                ================================================= */}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

                    <h2 className="text-lg font-bold text-gray-800 mb-5">

                        Resource Consumption & Waste

                    </h2>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


                        {/* ENERGY */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Energy Consumption

                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="energyConsumption"
                                value={
                                    formData.energyConsumption
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />

                        </div>


                        {/* RENEWABLE ENERGY */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Renewable Energy

                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="renewableEnergy"
                                value={
                                    formData.renewableEnergy
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />

                        </div>


                        {/* WATER */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Water Consumption

                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="waterConsumption"
                                value={
                                    formData.waterConsumption
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />

                        </div>


                        {/* WASTE GENERATED */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Waste Generated

                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="wasteGenerated"
                                value={
                                    formData.wasteGenerated
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />

                        </div>


                        {/* WASTE RECYCLED */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Waste Recycled

                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                name="wasteRecycled"
                                value={
                                    formData.wasteRecycled
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg p-3"
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    GHG EMISSIONS
                ================================================= */}

                <div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">

                        Greenhouse Gas Emissions

                    </h2>


                    <p className="text-sm text-gray-500 mb-5">

                        Enter emissions by gas. Values are reported in tonnes of CO₂ equivalent (tCO₂e).

                    </p>


                    {loadingData && (

                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-5">

                            Loading existing environmental data...

                        </div>

                    )}


                    <div className="space-y-6">


                        {/* SCOPE 1 */}

                        {renderScope(
                            "Scope 1 — Direct GHG Emissions",
                            scope1,
                            setScope1
                        )}


                        {/* SCOPE 2 */}

                        {renderScope(
                            "Scope 2 — Indirect GHG Emissions",
                            scope2,
                            setScope2
                        )}


                        {/* SCOPE 3 */}

                        {renderScope(
                            "Scope 3 — Other Indirect GHG Emissions",
                            scope3,
                            setScope3
                        )}

                    </div>

                </div>


                {/* =================================================
                    SAVE BUTTON
                ================================================= */}

                <div className="flex justify-end">

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            loadingData
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-8 py-3 rounded-xl font-semibold shadow-sm"
                    >

                        {loading
                            ? "Saving..."
                            : "Save Environmental Data"}

                    </button>

                </div>

            </form>

        </div>

    );
}

export default Environmental;