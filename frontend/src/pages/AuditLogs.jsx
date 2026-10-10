import { useEffect, useState } from "react";
import axios from "axios";
import {
    ShieldCheck,
    Activity,
    Users,
    Clock,
    Search,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Eye,
    X,
    AlertCircle
} from "lucide-react";

const API = "http://localhost:5000/api/audit";

export default function AuditLogs({ onBack }) {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        totalLogs: 0,
        activeUsers: 0,
        todayLogs: 0,
        changeLogs: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [module, setModule] = useState("");
    const [action, setAction] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    const [selectedLog, setSelectedLog] = useState(null);

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    const fetchData = async () => {
        setLoading(true);
        setError("");

        try {
            if (!token) {
                throw new Error(
                    "Login token not found. Please log in again."
                );
            }

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [logsResponse, statsResponse] = await Promise.all([
                axios.get(API, {
                    headers,
                    params: {
                        search,
                        module,
                        action,
                        page,
                        limit: 20
                    }
                }),
                axios.get(`${API}/stats`, { headers })
            ]);

            setLogs(logsResponse.data.logs || []);
            setPagination(
                logsResponse.data.pagination || {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0
                }
            );

            setStats({
                totalLogs: Number(statsResponse.data.totalLogs) || 0,
                activeUsers: Number(statsResponse.data.activeUsers) || 0,
                todayLogs: Number(statsResponse.data.todayLogs) || 0,
                changeLogs: Number(statsResponse.data.changeLogs) || 0
            });
        } catch (err) {
            console.error("Audit logs error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load audit logs."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, search, module, action]);

    const formatDate = (value) => {
        if (!value) return "—";

        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    };

    const getActionStyle = (value = "") => {
        const normalized = value.toUpperCase();

        if (
            normalized.includes("DELETE") ||
            normalized.includes("REJECT")
        ) {
            return "bg-red-100 text-red-700";
        }

        if (
            normalized.includes("APPROVE") ||
            normalized.includes("LOCK")
        ) {
            return "bg-green-100 text-green-700";
        }

        if (
            normalized.includes("UPDATE") ||
            normalized.includes("EDIT")
        ) {
            return "bg-amber-100 text-amber-700";
        }

        return "bg-blue-100 text-blue-700";
    };

    const statsCards = [
        {
            title: "Total Activities",
            value: stats.totalLogs,
            icon: Activity,
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Active Users",
            value: stats.activeUsers,
            icon: Users,
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: "Today's Activities",
            value: stats.todayLogs,
            icon: Clock,
            color: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Data Changes",
            value: stats.changeLogs,
            icon: ShieldCheck,
            color: "bg-amber-50 text-amber-600"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
                            >
                                <ChevronLeft
                                    size={16}
                                    className="mr-1 inline"
                                />
                                Back
                            </button>
                        )}

                        <div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck
                                    size={30}
                                    className="text-indigo-600"
                                />
                                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                                    Audit Logs
                                </h1>
                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                                Track user activity and ESG reporting changes.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {statsCards.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">
                                            {item.title}
                                        </p>

                                        <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                            {item.value}
                                        </h2>
                                    </div>

                                    <div className={`rounded-xl p-3 ${item.color}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-3 text-slate-400"
                            />

                            <input
                                type="text"
                                placeholder="Search activity..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-indigo-500"
                            />
                        </div>

                        <select
                            value={module}
                            onChange={(e) => {
                                setModule(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"
                        >
                            <option value="">All Modules</option>
                            <option value="Environmental">Environmental</option>
                            <option value="Social">Social</option>
                            <option value="Governance">Governance</option>
                            <option value="Workflow">Workflow</option>
                            <option value="Reports">Reports</option>
                            <option value="BRSR">BRSR</option>
                        </select>

                        <select
                            value={action}
                            onChange={(e) => {
                                setAction(e.target.value);
                                setPage(1);
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-indigo-500"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE_DRAFT">Create Draft</option>
                            <option value="SUBMIT_REPORT">Submit Report</option>
                            <option value="START_REVIEW">Start Review</option>
                            <option value="APPROVE_REPORT">Approve Report</option>
                            <option value="REJECT_REPORT">Reject Report</option>
                            <option value="LOCK_REPORT">Lock Report</option>
                            <option value="UPDATE">Update</option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />

                        <div>
                            <p className="font-semibold">
                                Unable to load audit logs
                            </p>

                            <p className="mt-1 text-sm">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Activity History
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                {pagination.total} records found
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-5 py-4 font-medium">User</th>
                                    <th className="px-5 py-4 font-medium">Action</th>
                                    <th className="px-5 py-4 font-medium">Module</th>
                                    <th className="px-5 py-4 font-medium">Project</th>
                                    <th className="px-5 py-4 font-medium">Year</th>
                                    <th className="px-5 py-4 font-medium">Date & Time</th>
                                    <th className="px-5 py-4 font-medium">Details</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            Loading audit records...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-5 py-12 text-center text-slate-500"
                                        >
                                            No audit records found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {log.user_name || `User #${log.user_id || "Unknown"}`}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {log.user_email || ""}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {log.module || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {log.project_name || (log.project_id ? `Project #${log.project_id}` : "—")}
                                            </td>

                                            <td className="px-5 py-4 text-slate-600">
                                                {log.reporting_year || "—"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                {formatDate(log.created_at)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-100"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">
                        <p className="text-sm text-slate-500">
                            Page {pagination.page || 1} of {pagination.totalPages || 1}
                        </p>

                        <div className="flex gap-2">
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <button
                                disabled={
                                    loading ||
                                    page >= (pagination.totalPages || 1)
                                }
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details modal */}
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
                        <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 p-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Audit Record #{selectedLog.id}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(selectedLog.created_at)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="rounded-lg p-2 hover:bg-slate-100"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-5 p-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Description
                                    </p>

                                    <p className="mt-1 text-slate-800">
                                        {selectedLog.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Action</p>
                                        <p className="mt-1 font-semibold text-slate-800">
                                            {selectedLog.action}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-4">
                                        <p className="text-sm text-slate-500">Module</p>
                                        <p className="mt-1 font-semibold text-slate-800">
                                            {selectedLog.module}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-semibold text-slate-700">
                                        Previous Value
                                    </p>

                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-red-50 p-4 text-xs text-red-800">
                                        {selectedLog.old_value ?? "No previous value recorded"}
                                    </pre>
                                </div>

                                <div>
                                    <p className="mb-2 text-sm font-semibold text-slate-700">
                                        New Value
                                    </p>

                                    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-green-50 p-4 text-xs text-green-800">
                                        {selectedLog.new_value ?? "No new value recorded"}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-end border-t border-slate-200 p-5">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}