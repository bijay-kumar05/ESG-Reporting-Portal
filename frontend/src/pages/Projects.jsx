import { useState, useEffect } from "react";
import axios from "axios";
import {
    FolderKanban,
    ArrowLeft,
    Plus,
    X
} from "lucide-react";

function Projects({ onBack, onOpenProject }) {
    const [projects, setProjects] = useState([]);
const [loading, setLoading] = useState(true);

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

    } catch (error) {
        console.error("Failed to load projects:", error);
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchProjects();
}, []);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        projectName: "",
        organization: "",
        businessUnit: "",
        location: "",
        projectManager: "",
        reportingYear: "2026",
        status: "ACTIVE"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            "http://localhost:5000/api/projects",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        alert(response.data.message);

        setShowForm(false);
        fetchProjects();    
    
        // Clear form
        setFormData({
            projectName: "",
            organization: "",
            businessUnit: "",
            location: "",
            projectManager: "",
            reportingYear: "2026",
            status: "ACTIVE"
        });

    } catch (error) {

        console.error(error);

        alert(
            error.response?.data?.message ||
            "Failed to create project"
        );
    }
};
    return (
        <div className="min-h-screen bg-slate-100">

            {/* HEADER */}
            <header className="bg-white border-b px-6 py-4 flex items-center gap-4">

                <button
                    onClick={onBack}
                    className="p-2 rounded-lg hover:bg-slate-100"
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Projects
                    </h1>

                    <p className="text-sm text-slate-500">
                        ESG Project Management
                    </p>
                </div>

            </header>

            <main className="p-6">

                {/* TITLE + ADD BUTTON */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                            All Projects
                        </h2>

                        <p className="text-sm text-slate-500">
                            Manage your organization's ESG projects.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg"
                    >
                        <Plus size={18} />
                        Add Project
                    </button>

                </div>

                {/* EMPTY PROJECT LIST */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

    {loading ? (

        <div className="p-10 text-center text-slate-500">
            Loading projects...
        </div>

    ) : projects.length === 0 ? (

        <div className="p-12 text-center">

            <FolderKanban
                size={60}
                className="mx-auto text-slate-300"
            />

            <h3 className="text-xl font-semibold text-slate-700 mt-4">
                No Projects Yet
            </h3>

            <p className="text-slate-500 mt-2">
                Add your first project to start ESG reporting.
            </p>

        </div>

    ) : (

        <div className="overflow-x-auto">

            <table className="w-full">

                <thead className="bg-slate-50 border-b">

                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Project
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Organization
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Location
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Manager
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Year
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                            Status
                        </th>

                        <th className="text-left px-6 py-4 text-sm font-semibold">
                        Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    {projects.map((project) => (

                        <tr
                            key={project.id}
                            className="border-b hover:bg-slate-50"
                        >

                            <td className="px-6 py-4 font-medium text-slate-800">
                                {project.project_name}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                                {project.organization}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                                {project.location}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                                {project.project_manager || "-"}
                            </td>

                            <td className="px-6 py-4 text-slate-600">
                                {project.reporting_year}
                            </td>

                            <td className="px-6 py-4">

                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                    {project.status}
                                </span>

                            </td>

                            <td className="px-6 py-4">

                            <button
                                onClick={() => onOpenProject(project)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                            >
                                    Open
                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )}

</div>

            </main>

            {/* ADD PROJECT MODAL */}
            {showForm && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

                        {/* MODAL HEADER */}
                        <div className="flex justify-between items-center p-6 border-b">

                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Add New Project
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Enter project information
                                </p>
                            </div>

                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X size={22} />
                            </button>

                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSubmit}
                            className="p-6 space-y-5"
                        >

                            {/* PROJECT NAME */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Project Name *
                                </label>

                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    placeholder="Enter project name"
                                    required
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* ORGANIZATION + BUSINESS UNIT */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Organization *
                                    </label>

                                    <input
                                        type="text"
                                        name="organization"
                                        value={formData.organization}
                                        onChange={handleChange}
                                        placeholder="MEIL"
                                        required
                                        className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Business Unit
                                    </label>

                                    <input
                                        type="text"
                                        name="businessUnit"
                                        value={formData.businessUnit}
                                        onChange={handleChange}
                                        placeholder="Infrastructure"
                                        className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                            </div>

                            {/* LOCATION */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Project Location *
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="City, State"
                                    required
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* MANAGER */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Project Manager
                                </label>

                                <input
                                    type="text"
                                    name="projectManager"
                                    value={formData.projectManager}
                                    onChange={handleChange}
                                    placeholder="Enter manager name"
                                    className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* YEAR + STATUS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Reporting Year *
                                    </label>

                                    <select
                                        name="reportingYear"
                                        value={formData.reportingYear}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="2026">2026</option>
                                        <option value="2025">2025</option>
                                        <option value="2024">2024</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="INACTIVE">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {/* BUTTONS */}
                            <div className="flex justify-end gap-3 pt-4 border-t">

                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2.5 border rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                                >
                                    Save Project
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Projects;