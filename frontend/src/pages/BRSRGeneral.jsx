import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, ArrowLeft, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000";

const EMPTY_FORM = {
    cin: "",
    entity_name: "",
    year_of_incorporation: "",
    registered_office_address: "",
    corporate_address: "",
    email: "",
    telephone: "",
    website: "",
    reporting_financial_year: "2025-26",
    stock_exchange: "",
    paid_up_capital: "",
    contact_person_name: "",
    contact_person_telephone: "",
    contact_person_email: "",
    reporting_boundary: "STANDALONE"
};

function BRSRGeneral({ onBack }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [form, setForm] = useState(EMPTY_FORM);

    const [loadingProjects, setLoadingProjects] = useState(true);
    const [loadingDisclosures, setLoadingDisclosures] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("info");

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // Load projects
    useEffect(() => {
        let cancelled = false;

        const loadProjects = async () => {
            try {
                setLoadingProjects(true);

                const response = await axios.get(
                    `${API_URL}/api/projects`,
                    authConfig
                );

                if (cancelled) return;

                // Supports common API response structures.
                const data = response.data;
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data.projects)
                        ? data.projects
                        : Array.isArray(data.data)
                            ? data.data
                            : [];

                setProjects(list);

            } catch (error) {
                if (!cancelled) {
                    console.error("Project loading error:", error);

                    setMessage(
                        error.response?.data?.message ||
                        "Could not load projects. Check your projects API."
                    );

                    setMessageType("error");
                }
            } finally {
                if (!cancelled) {
                    setLoadingProjects(false);
                }
            }
        };

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, []);

    // Load disclosures 
    useEffect(() => {
        if (!selectedProject || !form.reporting_financial_year) {
            setForm((previous) => ({
                ...EMPTY_FORM,
                reporting_financial_year:
                    previous.reporting_financial_year
            }));

            return;
        }

        let cancelled = false;

        const loadDisclosures = async () => {
            try {
                setLoadingDisclosures(true);
                setMessage("");

                const year = encodeURIComponent(
                    form.reporting_financial_year
                );

                const response = await axios.get(
                    `${API_URL}/api/brsr/general/${selectedProject}/${year}`,
                    authConfig
                );

                if (cancelled) return;

                const saved = response.data;

                if (saved && typeof saved === "object") {
                    setForm({
                        ...EMPTY_FORM,
                        ...saved,
                        reporting_financial_year:
                            saved.reporting_financial_year ||
                            form.reporting_financial_year,
                        year_of_incorporation:
                            saved.year_of_incorporation ?? "",
                        paid_up_capital:
                            saved.paid_up_capital ?? "",
                        reporting_boundary:
                            saved.reporting_boundary || "STANDALONE"
                    });

                    setMessage("Saved disclosures loaded.");
                    setMessageType("success");
                } else {
                    setForm({
                        ...EMPTY_FORM,
                        reporting_financial_year:
                            form.reporting_financial_year
                    });

                    setMessage(
                        "No disclosures saved for this project and year. Enter the details below."
                    );

                    setMessageType("info");
                }

            } catch (error) {
                if (!cancelled) {
                    console.error("Disclosure loading error:", error);

                    setForm({
                        ...EMPTY_FORM,
                        reporting_financial_year:
                            form.reporting_financial_year
                    });

                    setMessage(
                        error.response?.status === 404
                            ? "The disclosure API was not found. Check your backend route."
                            : error.response?.data?.message ||
                              "Could not load disclosures."
                    );

                    setMessageType("error");
                }
            } finally {
                if (!cancelled) {
                    setLoadingDisclosures(false);
                }
            }
        };

        loadDisclosures();

        return () => {
            cancelled = true;
        };
    }, [selectedProject, form.reporting_financial_year]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
        setMessage("");
    };

    const saveDisclosures = async (e) => {
        e.preventDefault();

        if (!selectedProject) {
            setMessage("Please select a project first.");
            setMessageType("error");
            return;
        }

        if (!form.reporting_financial_year.trim()) {
            setMessage("Please select or enter a reporting financial year.");
            setMessageType("error");
            return;
        }

        try {
            setSaving(true);
            setMessage("");

            const payload = {
                ...form,
                project_id: Number(selectedProject),
                year_of_incorporation:
                    form.year_of_incorporation
                        ? Number(form.year_of_incorporation)
                        : null,
                paid_up_capital:
                    form.paid_up_capital
                        ? Number(form.paid_up_capital)
                        : 0
            };

            const response = await axios.post(
                `${API_URL}/api/brsr/general`,
                payload,
                authConfig
            );

            setMessage(
                response.data.message ||
                "BRSR disclosures saved successfully."
            );

            setMessageType("success");

        } catch (error) {
            console.error("BRSR save error:", error);

            setMessage(
                error.response?.data?.message ||
                "Failed to save disclosures. Check the backend and database."
            );

            setMessageType("error");

        } finally {
            setSaving(false);
        }
    };

    const projectName = (project) =>
        project.project_name ||
        project.name ||
        `Project ${project.id}`;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="mx-auto max-w-6xl">

                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition hover:bg-slate-700"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-3">
                        <FileText
                            className="text-blue-700"
                            size={28}
                        />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            BRSR General Disclosures
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Manage disclosures separately for each project.
                        </p>
                    </div>
                </div>

                {/* Project and financial year */}
                <div className="mb-6 grid grid-cols-1 gap-5 rounded-xl bg-white p-6 shadow-sm md:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Select Project *
                        </label>

                        <select
                            value={selectedProject}
                            onChange={handleProjectChange}
                            disabled={loadingProjects || saving}
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">
                                {loadingProjects
                                    ? "Loading projects..."
                                    : "Choose a project"}
                            </option>

                            {projects.map((project) => (
                                <option
                                    key={project.id}
                                    value={project.id}
                                >
                                    {projectName(project)}
                                </option>
                            ))}
                        </select>

                        {!loadingProjects && projects.length === 0 && (
                            <p className="mt-2 text-sm text-amber-700">
                                No projects were returned by the projects API.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Reporting Financial Year *
                        </label>

                        <select
                            name="reporting_financial_year"
                            value={form.reporting_financial_year}
                            onChange={handleChange}
                            disabled={loadingDisclosures || saving}
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2024-25">2024-25</option>
                            <option value="2025-26">2025-26</option>
                            <option value="2026-27">2026-27</option>
                        </select>
                    </div>
                </div>

                {loadingDisclosures && (
                    <div className="mb-6 flex items-center gap-2 rounded-lg bg-blue-50 p-4 text-blue-700">
                        <RefreshCw size={18} className="animate-spin" />
                        Loading disclosures...
                    </div>
                )}

                <form onSubmit={saveDisclosures}>

                    {/* Entity Information */}
                    <Section title="Entity Information">
                        <Input
                            label="Corporate Identity Number (CIN)"
                            name="cin"
                            value={form.cin}
                            onChange={handleChange}
                            placeholder="Enter CIN"
                        />

                        <Input
                            label="Entity Name *"
                            name="entity_name"
                            value={form.entity_name}
                            onChange={handleChange}
                            placeholder="Enter entity name"
                            required
                        />

                        <Input
                            label="Year of Incorporation"
                            name="year_of_incorporation"
                            type="number"
                            value={form.year_of_incorporation}
                            onChange={handleChange}
                        />
                    </Section>

                    {/* Office Information */}
                    <Section title="Office Information" singleColumn>
                        <Textarea
                            label="Registered Office Address"
                            name="registered_office_address"
                            value={form.registered_office_address}
                            onChange={handleChange}
                        />

                        <Textarea
                            label="Corporate Office Address"
                            name="corporate_address"
                            value={form.corporate_address}
                            onChange={handleChange}
                        />
                    </Section>

                    {/* Contact Information */}
                    <Section title="Contact Information">
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                        />

                        <Input
                            label="Telephone"
                            name="telephone"
                            value={form.telephone}
                            onChange={handleChange}
                        />

                        <Input
                            label="Website"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            placeholder="https://"
                        />

                        <Input
                            label="Stock Exchange"
                            name="stock_exchange"
                            value={form.stock_exchange}
                            onChange={handleChange}
                            placeholder="Example: NSE, BSE"
                        />

                        <Input
                            label="Paid-up Capital"
                            name="paid_up_capital"
                            type="number"
                            value={form.paid_up_capital}
                            onChange={handleChange}
                        />
                    </Section>

                    {/* BRSR Contact Person */}
                    <Section title="BRSR Contact Person">
                        <Input
                            label="Contact Person Name"
                            name="contact_person_name"
                            value={form.contact_person_name}
                            onChange={handleChange}
                        />

                        <Input
                            label="Contact Person Telephone"
                            name="contact_person_telephone"
                            value={form.contact_person_telephone}
                            onChange={handleChange}
                        />

                        <Input
                            label="Contact Person Email"
                            name="contact_person_email"
                            type="email"
                            value={form.contact_person_email}
                            onChange={handleChange}
                        />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Reporting Boundary
                            </label>

                            <select
                                name="reporting_boundary"
                                value={form.reporting_boundary}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="STANDALONE">
                                    Standalone
                                </option>

                                <option value="CONSOLIDATED">
                                    Consolidated
                                </option>
                            </select>
                        </div>
                    </Section>

                    {message && (
                        <div
                            role="status"
                            className={`mb-5 rounded-lg p-4 ${
                                messageType === "error"
                                    ? "bg-red-50 text-red-700"
                                    : messageType === "success"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-blue-50 text-blue-700"
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                        <button
                            type="submit"
                            disabled={
                                saving ||
                                loadingProjects ||
                                loadingDisclosures ||
                                !selectedProject
                            }
                            className="rounded-lg bg-blue-700 px-7 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:bg-slate-400"
                        >
                            {saving
                                ? "Saving..."
                                : "Save BRSR Disclosures"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Section({ title, children, singleColumn = false }) {
    return (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-800">
                {title}
            </h2>

            <div
                className={`grid grid-cols-1 gap-5 ${
                    singleColumn ? "" : "md:grid-cols-2"
                }`}
            >
                {children}
            </div>
        </div>
    );
}

function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value ?? ""}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function Textarea({ label, name, value, onChange }) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
            </label>

            <textarea
                name={name}
                value={value ?? ""}
                onChange={onChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export default BRSRGeneral;