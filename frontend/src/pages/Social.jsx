import { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    Users,
    GraduationCap,
    ShieldCheck,
    MessageSquare,
    HeartHandshake,
    Save
} from "lucide-react";

function Social({ onBack, selectedProject }) {

    const [projects, setProjects] = useState([]);

    const [selectedProjectId, setSelectedProjectId] = useState(
        selectedProject?.id
            ? String(selectedProject.id)
            : ""
    );

    const [reportingYear, setReportingYear] = useState(
        selectedProject?.reporting_year
            ? String(selectedProject.reporting_year)
            : "2026"
    );


    const [formData, setFormData] = useState({
        totalEmployees: "",
        maleEmployees: "",
        femaleEmployees: "",
        otherGenderEmployees: "",

        permanentEmployees: "",
        contractualEmployees: "",

        employeesTrained: "",
        trainingHours: "",

        workplaceAccidents: "",
        fatalities: "",
        lostTimeInjuries: "",

        employeeGrievances: "",
        grievancesResolved: "",

        communityInvestment: ""
    });


    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [message, setMessage] = useState("");


    
    // FETCH PROJECTS
    

    useEffect(() => {

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


                

                if (selectedProject?.id) {

                    setSelectedProjectId(
                        String(selectedProject.id)
                    );

                }
                else if (response.data.length > 0) {

                    setSelectedProjectId(
                        String(response.data[0].id)
                    );

                }

            } catch (error) {

                console.error(
                    "Failed to fetch projects:",
                    error
                );

            }

        };

        fetchProjects();

    }, [selectedProject]);


    
    // UPDATE SELECTED PROJECT FROM APP
    

    useEffect(() => {

        if (!selectedProject) {
            return;
        }


        setSelectedProjectId(
            String(selectedProject.id)
        );


        setReportingYear(
            selectedProject.reporting_year
                ? String(selectedProject.reporting_year)
                : "2026"
        );

    }, [selectedProject]);


    
    // HANDLE INPUT
    

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    
    // LOAD EXISTING SOCIAL DATA
    

    useEffect(() => {

        if (!selectedProjectId) {
            return;
        }


        const loadSocialData = async () => {

            try {

                setLoadingData(true);

                setMessage("");

                const token =
                    localStorage.getItem("token");


                const response = await axios.get(

                    `http://localhost:5000/api/social/${selectedProjectId}/${reportingYear}`,

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }

                );


                if (response.data) {

                    const data =
                        response.data;


                    setFormData({

                        totalEmployees:
                            data.total_employees ?? "",

                        maleEmployees:
                            data.male_employees ?? "",

                        femaleEmployees:
                            data.female_employees ?? "",

                        otherGenderEmployees:
                            data.other_gender_employees ?? "",

                        permanentEmployees:
                            data.permanent_employees ?? "",

                        contractualEmployees:
                            data.contractual_employees ?? "",

                        employeesTrained:
                            data.employees_trained ?? "",

                        trainingHours:
                            data.training_hours ?? "",

                        workplaceAccidents:
                            data.workplace_accidents ?? "",

                        fatalities:
                            data.fatalities ?? "",

                        lostTimeInjuries:
                            data.lost_time_injuries ?? "",

                        employeeGrievances:
                            data.employee_grievances ?? "",

                        grievancesResolved:
                            data.grievances_resolved ?? "",

                        communityInvestment:
                            data.community_investment ?? ""

                    });

                } else {

                    resetForm();

                }

            } catch (error) {

                console.error(
                    "Failed to load social data:",
                    error
                );

                

                if (
                    error.response?.status === 404
                ) {

                    resetForm();

                }

            } finally {

                setLoadingData(false);

            }

        };


        loadSocialData();

    }, [
        selectedProjectId,
        reportingYear
    ]);


    
    // RESET FORM
    

    const resetForm = () => {

        setFormData({

            totalEmployees: "",
            maleEmployees: "",
            femaleEmployees: "",
            otherGenderEmployees: "",

            permanentEmployees: "",
            contractualEmployees: "",

            employeesTrained: "",
            trainingHours: "",

            workplaceAccidents: "",
            fatalities: "",
            lostTimeInjuries: "",

            employeeGrievances: "",
            grievancesResolved: "",

            communityInvestment: ""

        });

    };


    
    // SAVE SOCIAL DATA
    

    const handleSave = async () => {

        if (!selectedProjectId) {

            setMessage(
                "Please select a project."
            );

            return;

        }


        try {

            setLoading(true);

            setMessage("");


            const token =
                localStorage.getItem("token");


            await axios.post(

                "http://localhost:5000/api/social",

                {

                    projectId:
                        Number(selectedProjectId),

                    reportingYear:
                        Number(reportingYear),

                    ...formData

                },

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            setMessage(
                "Social data saved successfully!"
            );


        } catch (error) {

            console.error(
                "Social save error:",
                error
            );


            setMessage(

                error.response?.data?.message ||

                "Failed to save social data"

            );

        } finally {

            setLoading(false);

        }

    };


    
    // INPUT FIELD COMPONENT
    

    const InputField = ({
        label,
        name,
        type = "number",
        placeholder = "Enter value"
    }) => (

        <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">

                {label}

            </label>


            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

        </div>

    );


    
    // PAGE
    

    return (

        <div className="min-h-screen bg-gray-50">


            {/* 
                HEADER
             */}

            <div className="bg-white border-b">

                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">

                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >

                        <ArrowLeft size={22} />

                    </button>


                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">

                            Social ESG Reporting

                        </h1>

                        <p className="text-sm text-gray-500">

                            Workforce, safety, training and community data

                        </p>

                    </div>

                </div>

            </div>


            {/* 
                MAIN
             */}

            <div className="max-w-7xl mx-auto px-6 py-8">


                {/* 
                    PROJECT / YEAR
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="grid md:grid-cols-2 gap-6">


                        {/* PROJECT */}

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Project

                            </label>


                            <select
                                value={selectedProjectId}
                                onChange={(e) =>
                                    setSelectedProjectId(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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
                                value={
                                    reportingYear
                                }
                                onChange={(e) =>
                                    setReportingYear(
                                        e.target.value
                                    )
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-3"
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


                {/* 
                    LOADING
                 */}

                {loadingData && (

                    <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 mb-6">

                        Loading existing Social ESG data...

                    </div>

                )}


                {/* 
                    WORKFORCE
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="p-3 bg-blue-100 rounded-lg">

                            <Users
                                size={22}
                                className="text-blue-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">

                                Workforce Information

                            </h2>

                            <p className="text-sm text-gray-500">

                                Employee demographics and employment type

                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

                        <InputField
                            label="Total Employees"
                            name="totalEmployees"
                        />

                        <InputField
                            label="Male Employees"
                            name="maleEmployees"
                        />

                        <InputField
                            label="Female Employees"
                            name="femaleEmployees"
                        />

                        <InputField
                            label="Other Gender Employees"
                            name="otherGenderEmployees"
                        />

                        <InputField
                            label="Permanent Employees"
                            name="permanentEmployees"
                        />

                        <InputField
                            label="Contractual Employees"
                            name="contractualEmployees"
                        />

                    </div>

                </div>


                {/* 
                    TRAINING
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="p-3 bg-purple-100 rounded-lg">

                            <GraduationCap
                                size={22}
                                className="text-purple-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">

                                Training & Development

                            </h2>

                            <p className="text-sm text-gray-500">

                                Employee training and development

                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 gap-5">

                        <InputField
                            label="Employees Trained"
                            name="employeesTrained"
                        />

                        <InputField
                            label="Total Training Hours"
                            name="trainingHours"
                        />

                    </div>

                </div>


                {/* 
                    HEALTH & SAFETY
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="p-3 bg-red-100 rounded-lg">

                            <ShieldCheck
                                size={22}
                                className="text-red-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">

                                Health & Safety

                            </h2>

                            <p className="text-sm text-gray-500">

                                Workplace safety performance

                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-3 gap-5">

                        <InputField
                            label="Workplace Accidents"
                            name="workplaceAccidents"
                        />

                        <InputField
                            label="Fatalities"
                            name="fatalities"
                        />

                        <InputField
                            label="Lost Time Injuries"
                            name="lostTimeInjuries"
                        />

                    </div>

                </div>


                {/* 
                    GRIEVANCES
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="p-3 bg-yellow-100 rounded-lg">

                            <MessageSquare
                                size={22}
                                className="text-yellow-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">

                                Employee Grievances

                            </h2>

                            <p className="text-sm text-gray-500">

                                Employee complaints and resolution

                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 gap-5">

                        <InputField
                            label="Employee Grievances Received (in thousands)"
                            name="employeeGrievances"
                        />

                        <InputField
                            label="Grievances Resolved"
                            name="grievancesResolved"
                        />

                    </div>

                </div>


                {/* 
                    COMMUNITY
                 */}

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="p-3 bg-green-100 rounded-lg">

                            <HeartHandshake
                                size={22}
                                className="text-green-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-semibold">

                                Community Investment

                            </h2>

                            <p className="text-sm text-gray-500">

                                Social and community contribution

                            </p>

                        </div>

                    </div>


                    <div className="max-w-md">

                        <InputField
                            label="Community Investment (in cr)"
                            name="communityInvestment"
                        />

                    </div>

                </div>


                {/* 
                    SAVE
                 */}

                <div className="bg-white rounded-xl border p-6 flex items-center justify-between">

                    <div>

                        {message && (

                            <p
                                className={`text-sm font-medium ${
                                    message.includes(
                                        "successfully"
                                    )
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >

                                {message}

                            </p>

                        )}

                    </div>


                    <button
                        onClick={handleSave}
                        disabled={
                            loading ||
                            loadingData ||
                            !selectedProjectId
                        }
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
                    >

                        <Save size={18} />

                        {loading
                            ? "Saving..."
                            : "Save Social Data"
                        }

                    </button>

                </div>

            </div>

        </div>

    );

}

export default Social;