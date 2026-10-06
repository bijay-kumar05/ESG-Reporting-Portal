import { useEffect, useState } from "react";
import axios from "axios";
import { FileText, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000";

function BRSRGeneral({ onBack }) {
    const [form, setForm] = useState({
        cin: "",
        entity_name: "",
        year_of_incorporation: "",
        registered_office_address: "",
        corporate_address: "",
        email: "",
        telephone: "",
        website: "",
        reporting_financial_year: "",
        stock_exchange: "",
        paid_up_capital: "",
        contact_person_name: "",
        contact_person_telephone: "",
        contact_person_email: "",
        reporting_boundary: "STANDALONE"
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const saveDisclosures = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            const token = localStorage.getItem("token");

            const response = await axios.post(
                `${API_URL}/api/brsr/general`,
                {
                    ...form,
                    year_of_incorporation:
                        form.year_of_incorporation
                            ? Number(form.year_of_incorporation)
                            : null,

                    paid_up_capital:
                        form.paid_up_capital
                            ? Number(form.paid_up_capital)
                            : 0
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(
                response.data.message ||
                "BRSR disclosures saved successfully"
            );

        } catch (error) {
            console.error(
                "BRSR save error:",
                error
            );

            setMessage(
                error.response?.data?.message ||
                "Failed to save BRSR disclosures"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">

            <div className="max-w-6xl mx-auto">

                {/* Back Button */}
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">

                    <div className="flex items-center gap-3">

                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText
                                className="text-blue-700"
                                size={28}
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR General Disclosures
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Enter the entity-level information required
                                for BRSR reporting.
                            </p>
                        </div>

                    </div>

                </div>

                <form onSubmit={saveDisclosures}>

                    {/* Entity Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            Entity Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

                            <Input
                                label="Reporting Financial Year *"
                                name="reporting_financial_year"
                                value={form.reporting_financial_year}
                                onChange={handleChange}
                                placeholder="Example: 2025-26"
                                required
                            />

                        </div>

                    </div>

                    {/* Office Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            Office Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5">

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

                        </div>

                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            Contact Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

                        </div>

                    </div>

                    {/* BRSR Contact Person */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">

                        <h2 className="text-xl font-semibold text-slate-800 mb-5">
                            BRSR Contact Person
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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

                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Reporting Boundary
                                </label>

                                <select
                                    name="reporting_boundary"
                                    value={form.reporting_boundary}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                >

                                    <option value="STANDALONE">
                                        Standalone
                                    </option>

                                    <option value="CONSOLIDATED">
                                        Consolidated
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                    {/* Message */}
                    {message && (
                        <div className="mb-5 p-4 rounded-lg bg-blue-50 text-blue-700">
                            {message}
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-between items-center">

                        {/* Back Button at Bottom */}
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-100 transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-7 py-3 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:bg-slate-400 transition"
                        >
                            {loading
                                ? "Saving..."
                                : "Save BRSR Disclosures"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}


// Reusable Input
function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required
}) {
    return (
        <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

        </div>
    );
}


// Reusable Textarea
function Textarea({
    label,
    name,
    value,
    onChange
}) {
    return (
        <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>

            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows="3"
                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

        </div>
    );
}

export default BRSRGeneral;