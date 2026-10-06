import { useEffect, useState } from "react";
import axios from "axios";

function Workflow({ onBack }) {

    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedYear, setSelectedYear] = useState("2026");

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(false);

    const [rejectionReason, setRejectionReason] = useState("");
    const [comments, setComments] = useState("");

    // --------------------------------------------------
    // FETCH PROJECTS
    // --------------------------------------------------

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

            if (response.data.length > 0) {
                setSelectedProject(
                    response.data[0].id.toString()
                );
            }

        } catch (error) {

            console.error(
                "Failed to fetch projects:",
                error
            );

        }

    };


    // --------------------------------------------------
    // FETCH SUBMISSION
    // --------------------------------------------------

    const fetchSubmission = async () => {

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

            if (
                response.data &&
                response.data.data === null
            ) {

                setSubmission(null);

            } else {

                setSubmission(response.data);

            }

        } catch (error) {

            console.error(
                "Failed to fetch workflow:",
                error
            );

            setSubmission(null);
        }

    };


    useEffect(() => {

        fetchProjects();

    }, []);


    useEffect(() => {

        if (selectedProject) {
            fetchSubmission();
        }

    }, [selectedProject, selectedYear]);


    // --------------------------------------------------
    // SAVE DRAFT
    // --------------------------------------------------

    const saveDraft = async () => {

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/draft",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Draft saved successfully");

            fetchSubmission();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to save draft"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // SUBMIT REPORT
    // --------------------------------------------------

    const submitReport = async () => {

        if (
            !window.confirm(
                "Are you sure you want to submit this report?"
            )
        ) {
            return;
        }

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/submit",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Report submitted successfully");

            fetchSubmission();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to submit report"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // START REVIEW
    // --------------------------------------------------

    const startReview = async () => {

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/review",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Review started successfully");

            fetchSubmission();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to start review"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // APPROVE
    // --------------------------------------------------

    const approveReport = async () => {

        if (
            !window.confirm(
                "Are you sure you want to approve this report?"
            )
        ) {
            return;
        }

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/approve",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear,
                    comments: comments
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Report approved successfully");

            setComments("");

            fetchSubmission();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to approve report"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // REJECT
    // --------------------------------------------------

    const rejectReport = async () => {

        if (!rejectionReason.trim()) {

            alert(
                "Please enter a rejection reason"
            );

            return;

        }

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/reject",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear,
                    reason: rejectionReason
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Report rejected");

            setRejectionReason("");

            fetchSubmission();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to reject report"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // LOCK
    // --------------------------------------------------

    const lockReport = async () => {

        if (
            !window.confirm(
                "Locking this report will finalize it. Continue?"
            )
        ) {
            return;
        }

        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:5000/api/workflow/lock",
                {
                    projectId: selectedProject,
                    reportingYear: selectedYear
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Report locked successfully");

            fetchSubmission();

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to lock report"
            );

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    const status =
        submission?.status || "NOT CREATED";


    const statusColor = {

        "DRAFT": "bg-gray-100 text-gray-700",

        "SUBMITTED": "bg-blue-100 text-blue-700",

        "UNDER_REVIEW": "bg-yellow-100 text-yellow-700",

        "APPROVED": "bg-green-100 text-green-700",

        "REJECTED": "bg-red-100 text-red-700",

        "LOCKED": "bg-purple-100 text-purple-700",

        "NOT CREATED": "bg-gray-100 text-gray-500"

    };


    return (

        <div className="min-h-screen bg-gray-50 p-6">

            {/* HEADER */}

            <div className="max-w-6xl mx-auto">

                <div className="flex items-center justify-between mb-6">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            ESG Reporting Workflow
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Manage report submission, review and approval
                        </p>

                    </div>

                    <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                        ← Back to Dashboard
                    </button>

                </div>


                {/* PROJECT SELECTION */}

                <div className="bg-white rounded-xl shadow p-6 mb-6">

                    <h2 className="text-lg font-semibold mb-4">
                        Report Selection
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Project
                            </label>

                            <select
                                value={selectedProject}
                                onChange={(e) =>
                                    setSelectedProject(e.target.value)
                                }
                                className="w-full border rounded-lg p-3"
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
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                                className="w-full border rounded-lg p-3"
                            >

                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>

                            </select>

                        </div>

                    </div>

                </div>


                {/* STATUS */}

                <div className="bg-white rounded-xl shadow p-6 mb-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Current Status
                            </p>

                            <div className="mt-2">

                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                        statusColor[status]
                                    }`}
                                >
                                    {status.replace("_", " ")}
                                </span>

                            </div>

                        </div>


                        <div className="text-right">

                            <p className="text-sm text-gray-500">
                                Project
                            </p>

                            <p className="font-semibold">
                                {submission?.project_name || "—"}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                Year: {selectedYear}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ACTIONS */}

                <div className="bg-white rounded-xl shadow p-6">

                    <h2 className="text-lg font-semibold mb-5">
                        Workflow Actions
                    </h2>


                    {/* NO SUBMISSION */}

                    {!submission && (

                        <div>

                            <p className="text-gray-500 mb-4">
                                No workflow record exists for this project
                                and reporting year.
                            </p>

                            <button
                                onClick={saveDraft}
                                disabled={loading}
                                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading
                                    ? "Saving..."
                                    : "Create Draft"}
                            </button>

                        </div>

                    )}


                    {/* DRAFT */}

                    {status === "DRAFT" && (

                        <div className="flex gap-3">

                            <button
                                onClick={saveDraft}
                                disabled={loading}
                                className="px-5 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                            >
                                Save Draft
                            </button>

                            <button
                                onClick={submitReport}
                                disabled={loading}
                                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Submit Report
                            </button>

                        </div>

                    )}


                    {/* SUBMITTED */}

                    {status === "SUBMITTED" && (

                        <div>

                            <p className="text-blue-700 mb-4">
                                Report has been submitted and is waiting
                                for review.
                            </p>

                            <button
                                onClick={startReview}
                                disabled={loading}
                                className="px-5 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                            >
                                Start Review
                            </button>

                        </div>

                    )}


                    {/* UNDER REVIEW */}

                    {status === "UNDER_REVIEW" && (

                        <div className="space-y-5">

                            <div>

                                <label className="block text-sm font-medium mb-2">
                                    Reviewer Comments
                                </label>

                                <textarea
                                    value={comments}
                                    onChange={(e) =>
                                        setComments(e.target.value)
                                    }
                                    rows="3"
                                    className="w-full border rounded-lg p-3"
                                    placeholder="Enter review comments..."
                                />

                            </div>


                            <div>

                                <label className="block text-sm font-medium mb-2">
                                    Rejection Reason
                                </label>

                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) =>
                                        setRejectionReason(
                                            e.target.value
                                        )
                                    }
                                    rows="3"
                                    className="w-full border rounded-lg p-3"
                                    placeholder="Required if rejecting..."
                                />

                            </div>


                            <div className="flex gap-3">

                                <button
                                    onClick={approveReport}
                                    disabled={loading}
                                    className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    ✓ Approve Report
                                </button>

                                <button
                                    onClick={rejectReport}
                                    disabled={loading}
                                    className="px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    ✕ Reject Report
                                </button>

                            </div>

                        </div>

                    )}


                    {/* APPROVED */}

                    {status === "APPROVED" && (

                        <div>

                            <p className="text-green-700 mb-4">
                                ✓ Report has been approved.
                            </p>

                            <button
                                onClick={lockReport}
                                disabled={loading}
                                className="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                🔒 Lock Report
                            </button>

                        </div>

                    )}


                    {/* REJECTED */}

                    {status === "REJECTED" && (

                        <div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">

                                <p className="font-semibold text-red-700">
                                    Report Rejected
                                </p>

                                <p className="text-red-600 mt-1">
                                    {submission?.rejection_reason ||
                                        "No reason provided"}
                                </p>

                            </div>

                            <button
                                onClick={saveDraft}
                                disabled={loading}
                                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create Correction Draft
                            </button>

                        </div>

                    )}


                    {/* LOCKED */}

                    {status === "LOCKED" && (

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">

                            <p className="text-xl font-bold text-purple-700">
                                🔒 Report Locked
                            </p>

                            <p className="text-purple-600 mt-2">
                                This ESG report has been finalized and
                                cannot proceed through the workflow again.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

}

export default Workflow;