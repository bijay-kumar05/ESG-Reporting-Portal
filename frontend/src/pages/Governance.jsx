import { useEffect, useState } from "react";
import axios from "axios";
import {
    ShieldCheck,
    ArrowLeft,
    Save,
    Building2,
    FileCheck,
    Users,
    AlertTriangle,
    MessageSquare,
    Lock,
    Clock
} from "lucide-react";


function Governance({ onBack }) {

    const [projects, setProjects] = useState([]);

    const [selectedProject, setSelectedProject] = useState("");

    const [reportingYear, setReportingYear] = useState("2026");

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");


    const [formData, setFormData] = useState({

        ethicsTrainingEmployees: 0,

        antiCorruptionCases: 0,

        briberyCases: 0,

        whistleblowerComplaints: 0,

        whistleblowerResolved: 0,

        regulatoryActions: 0,

        regulatoryPenalties: 0,

        dataPrivacyIncidents: 0,

        cybersecurityIncidents: 0,

        customerComplaints: 0,

        customerComplaintsResolved: 0,

        governanceTrainingHours: 0,

        boardMeetings: 0,

        managementMeetings: 0

    });


    
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

            } catch (error) {

                console.error(
                    "Failed to fetch projects:",
                    error
                );

            }

        };


        fetchProjects();

    }, []);


    
    // LOAD EXISTING DATA
    

    useEffect(() => {

        if (!selectedProject) {
            return;
        }


        const fetchGovernanceData = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/api/governance/${selectedProject}/${reportingYear}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


                if (response.data) {

                    const data = response.data;


                    setFormData({

                        ethicsTrainingEmployees:
                            data.ethics_training_employees || 0,

                        antiCorruptionCases:
                            data.anti_corruption_cases || 0,

                        briberyCases:
                            data.bribery_cases || 0,

                        whistleblowerComplaints:
                            data.whistleblower_complaints || 0,

                        whistleblowerResolved:
                            data.whistleblower_resolved || 0,

                        regulatoryActions:
                            data.regulatory_actions || 0,

                        regulatoryPenalties:
                            data.regulatory_penalties || 0,

                        dataPrivacyIncidents:
                            data.data_privacy_incidents || 0,

                        cybersecurityIncidents:
                            data.cybersecurity_incidents || 0,

                        customerComplaints:
                            data.customer_complaints || 0,

                        customerComplaintsResolved:
                            data.customer_complaints_resolved || 0,

                        governanceTrainingHours:
                            data.governance_training_hours || 0,

                        boardMeetings:
                            data.board_meetings || 0,

                        managementMeetings:
                            data.management_meetings || 0

                    });

                } else {

                    resetForm();

                }

            } catch (error) {

                console.error(
                    "Failed to fetch governance data:",
                    error
                );

            }

        };


        fetchGovernanceData();

    }, [selectedProject, reportingYear]);


    
    // RESET FORM
    

    const resetForm = () => {

        setFormData({

            ethicsTrainingEmployees: 0,

            antiCorruptionCases: 0,

            briberyCases: 0,

            whistleblowerComplaints: 0,

            whistleblowerResolved: 0,

            regulatoryActions: 0,

            regulatoryPenalties: 0,

            dataPrivacyIncidents: 0,

            cybersecurityIncidents: 0,

            customerComplaints: 0,

            customerComplaintsResolved: 0,

            governanceTrainingHours: 0,

            boardMeetings: 0,

            managementMeetings: 0

        });

    };


    
    // HANDLE INPUT
    

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData({

            ...formData,

            [name]:
                value === ""
                    ? 0
                    : Number(value)

        });

    };


    
    // SAVE DATA
    

    const handleSubmit = async (e) => {

        e.preventDefault();


        if (!selectedProject) {

            setMessage(
                "Please select a project."
            );

            return;

        }


        try {

            setSaving(true);

            setMessage("");


            const token =
                localStorage.getItem("token");


            await axios.post(
                "http://localhost:5000/api/governance",

                {

                    projectId:
                        Number(selectedProject),

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
                "Governance data saved successfully."
            );


        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save governance data."
            );


        } finally {

            setSaving(false);

        }

    };


    
    // UI
    

    return (

        <div className="min-h-screen bg-slate-50">


            {/* HEADER */}

            <div className="bg-slate-900 text-white">

                <div className="max-w-7xl mx-auto px-6 py-5">

                    <div className="flex items-center gap-4">

                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-slate-800"
                        >
                            <ArrowLeft size={22} />
                        </button>


                        <div>

                            <div className="flex items-center gap-2">

                                <ShieldCheck
                                    size={25}
                                />

                                <h1 className="text-xl font-bold">
                                    Governance ESG
                                </h1>

                            </div>

                            <p className="text-slate-400 text-sm">
                                Governance, ethics and compliance reporting
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* PROJECT / YEAR */}

                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

                    <div className="grid md:grid-cols-2 gap-5">


                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Project

                            </label>

                            <select

                                value={selectedProject}

                                onChange={(e) =>
                                    setSelectedProject(
                                        e.target.value
                                    )
                                }

                                className="w-full border rounded-xl px-4 py-3"

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

                            <label className="block text-sm font-medium mb-2">

                                Reporting Year

                            </label>

                            <select

                                value={reportingYear}

                                onChange={(e) =>
                                    setReportingYear(
                                        e.target.value
                                    )
                                }

                                className="w-full border rounded-xl px-4 py-3"

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


                <form onSubmit={handleSubmit}>


                    {/* ETHICS */}

                    <Section
                        icon={<ShieldCheck size={20} />}
                        title="Ethics & Anti-Corruption"
                        description="Track ethics training and anti-corruption activities."
                    >

                        <Input
                            label="Employees Trained on Ethics"
                            name="ethicsTrainingEmployees"
                            value={formData.ethicsTrainingEmployees}
                            onChange={handleChange}
                        />

                        <Input
                            label="Anti-Corruption Cases"
                            name="antiCorruptionCases"
                            value={formData.antiCorruptionCases}
                            onChange={handleChange}
                        />

                        <Input
                            label="Bribery Cases"
                            name="briberyCases"
                            value={formData.briberyCases}
                            onChange={handleChange}
                        />

                        <Input
                            label="Governance Training Hours"
                            name="governanceTrainingHours"
                            value={formData.governanceTrainingHours}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* WHISTLEBLOWER */}

                    <Section
                        icon={<MessageSquare size={20} />}
                        title="Whistleblower & Grievance"
                        description="Monitor whistleblower complaints and resolution."
                    >

                        <Input
                            label="Whistleblower Complaints"
                            name="whistleblowerComplaints"
                            value={formData.whistleblowerComplaints}
                            onChange={handleChange}
                        />

                        <Input
                            label="Complaints Resolved"
                            name="whistleblowerResolved"
                            value={formData.whistleblowerResolved}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* REGULATORY */}

                    <Section
                        icon={<FileCheck size={20} />}
                        title="Regulatory Compliance"
                        description="Record regulatory actions and financial penalties."
                    >

                        <Input
                            label="Regulatory Actions"
                            name="regulatoryActions"
                            value={formData.regulatoryActions}
                            onChange={handleChange}
                        />

                        <Input
                            label="Regulatory Penalties (₹)"
                            name="regulatoryPenalties"
                            value={formData.regulatoryPenalties}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* SECURITY */}

                    <Section
                        icon={<Lock size={20} />}
                        title="Data Privacy & Cybersecurity"
                        description="Track privacy and cybersecurity incidents."
                    >

                        <Input
                            label="Data Privacy Incidents"
                            name="dataPrivacyIncidents"
                            value={formData.dataPrivacyIncidents}
                            onChange={handleChange}
                        />

                        <Input
                            label="Cybersecurity Incidents"
                            name="cybersecurityIncidents"
                            value={formData.cybersecurityIncidents}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* CUSTOMER */}

                    <Section
                        icon={<Users size={20} />}
                        title="Customer Complaints"
                        description="Track customer complaints and resolution."
                    >

                        <Input
                            label="Customer Complaints"
                            name="customerComplaints"
                            value={formData.customerComplaints}
                            onChange={handleChange}
                        />

                        <Input
                            label="Customer Complaints Resolved"
                            name="customerComplaintsResolved"
                            value={formData.customerComplaintsResolved}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* BOARD */}

                    <Section
                        icon={<Building2 size={20} />}
                        title="Board & Management"
                        description="Record governance meeting activity."
                    >

                        <Input
                            label="Board Meetings"
                            name="boardMeetings"
                            value={formData.boardMeetings}
                            onChange={handleChange}
                        />

                        <Input
                            label="Management Meetings"
                            name="managementMeetings"
                            value={formData.managementMeetings}
                            onChange={handleChange}
                        />

                    </Section>


                    {/* MESSAGE */}

                    {message && (

                        <div className="mb-5 p-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">

                            {message}

                        </div>

                    )}


                    {/* SAVE */}

                    <button

                        type="submit"

                        disabled={saving}

                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50"

                    >

                        <Save size={19} />

                        {saving
                            ? "Saving..."
                            : "Save Governance Data"
                        }

                    </button>


                </form>

            </main>

        </div>

    );

}



// SECTION COMPONENT


function Section({
    icon,
    title,
    description,
    children
}) {

    return (

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">

            <div className="flex items-start gap-3 mb-6">

                <div className="p-2 rounded-lg bg-slate-100">

                    {icon}

                </div>

                <div>

                    <h2 className="font-semibold text-lg">

                        {title}

                    </h2>

                    <p className="text-sm text-slate-500">

                        {description}

                    </p>

                </div>

            </div>


            <div className="grid md:grid-cols-2 gap-5">

                {children}

            </div>

        </div>

    );

}



// INPUT COMPONENT


function Input({
    label,
    name,
    value,
    onChange
}) {

    return (

        <div>

            <label className="block text-sm font-medium mb-2">

                {label}

            </label>

            <input

                type="number"

                min="0"

                step="0.01"

                name={name}

                value={value}

                onChange={onChange}

                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-400"

            />

        </div>

    );

}


export default Governance;