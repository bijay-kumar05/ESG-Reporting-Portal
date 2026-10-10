import { useEffect, useState } from "react";

import {
    ArrowLeft,
    Leaf,
    Users,
    ShieldCheck,
    GitBranch,
    FileText,
    CheckCircle2,
    Clock3,
    MapPin,
    CalendarDays,
    UserRound
} from "lucide-react";


function ProjectOverview({
    selectedProject,
    onBack,
    onOpenModule
}) {

    
    // ESG MODULE STATUS
    

    const [environmentalCompleted, setEnvironmentalCompleted] =
        useState(false);

    const [socialCompleted, setSocialCompleted] =
        useState(false);

    const [governanceCompleted, setGovernanceCompleted] =
        useState(false);

    const [workflowStatus, setWorkflowStatus] =
        useState("DRAFT");

    const [reportsAvailable, setReportsAvailable] =
        useState(false);

    const [loadingStatus, setLoadingStatus] =
        useState(true);


    
    // CHECK PROJECT ESG STATUS
    

    useEffect(() => {

        const checkESGStatus = async () => {

            if (!selectedProject?.id) {
                setLoadingStatus(false);
                return;
            }

            const token = localStorage.getItem("token");

            const projectId = selectedProject.id;
            const year = selectedProject.reporting_year;


            try {

                
                // ENVIRONMENTAL
                

                const environmentalResponse = await fetch(
                    `http://localhost:5000/api/environmental/summary/${projectId}/${year}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                let environmentalCompletedValue = false;


                if (environmentalResponse.ok) {

                    const environmentalData =
                        await environmentalResponse.json();


                    environmentalCompletedValue =
                        environmentalData &&
                        Object.keys(environmentalData).length > 0;


                    setEnvironmentalCompleted(
                        environmentalCompletedValue
                    );

                } else {

                    setEnvironmentalCompleted(false);

                }


                
                // SOCIAL
                

                const socialResponse = await fetch(
                    `http://localhost:5000/api/social/${projectId}/${year}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                let socialCompletedValue = false;


                if (socialResponse.ok) {

                    const socialData =
                        await socialResponse.json();


                    socialCompletedValue =
                        socialData &&
                        Object.keys(socialData).length > 0;


                    setSocialCompleted(
                        socialCompletedValue
                    );

                } else {

                    setSocialCompleted(false);

                }


                
                // GOVERNANCE
                

                const governanceResponse = await fetch(
                    `http://localhost:5000/api/governance/${projectId}/${year}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                let governanceCompletedValue = false;


                if (governanceResponse.ok) {

                    const governanceData =
                        await governanceResponse.json();


                    governanceCompletedValue =
                        governanceData &&
                        Object.keys(governanceData).length > 0;


                    setGovernanceCompleted(
                        governanceCompletedValue
                    );

                } else {

                    setGovernanceCompleted(false);

                }


                
                // WORKFLOW
                

                const workflowResponse = await fetch(
                    `http://localhost:5000/api/workflow/${projectId}/${year}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );


                let workflowStatusValue = "DRAFT";


                if (workflowResponse.ok) {

                    const workflowData =
                        await workflowResponse.json();


                    workflowStatusValue =
                        workflowData?.status || "DRAFT";


                    setWorkflowStatus(
                        workflowStatusValue
                    );

                } else {

                    setWorkflowStatus("DRAFT");

                }


                
                // REPORTS
                
                
                

                setReportsAvailable(
                    environmentalCompletedValue ||
                    socialCompletedValue ||
                    governanceCompletedValue
                );


            } catch (error) {

                console.error(
                    "Error checking ESG status:",
                    error
                );


                setEnvironmentalCompleted(false);

                setSocialCompleted(false);

                setGovernanceCompleted(false);

                setWorkflowStatus("DRAFT");

                setReportsAvailable(false);

            } finally {

                setLoadingStatus(false);

            }

        };


        checkESGStatus();

    }, [selectedProject]);


    
    // NO PROJECT SELECTED
    

    if (!selectedProject) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">

                    <h2 className="text-xl font-semibold text-slate-800">
                        No Project Selected
                    </h2>


                    <p className="text-slate-500 mt-2">
                        Please select a project first.
                    </p>


                    <button
                        onClick={onBack}
                        className="mt-5 px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        Back to Projects
                    </button>

                </div>

            </div>

        );

    }


    
    // OVERALL PROGRESS
    

    const progress =
        (environmentalCompleted ? 20 : 0) +
        (socialCompleted ? 20 : 0) +
        (governanceCompleted ? 20 : 0) +
        (workflowStatus === "LOCKED" ? 20 : 0) +
        (reportsAvailable ? 20 : 0);


    
    // MODULES
    

    const modules = [

        {
            title: "Environmental ESG",

            description:
                "Energy, water, waste and GHG emissions",

            icon: Leaf,

            page: "environmental",

            status: environmentalCompleted
                ? "Completed"
                : "Pending"
        },


        {
            title: "Social ESG",

            description:
                "Employees, training, safety and community",

            icon: Users,

            page: "social",

            status: socialCompleted
                ? "Completed"
                : "Pending"
        },


        {
            title: "Governance ESG",

            description:
                "Ethics, compliance, privacy and governance",

            icon: ShieldCheck,

            page: "governance",

            status: governanceCompleted
                ? "Completed"
                : "Pending"
        },


        {
            title: "Workflow",

            description:
                "Submit, review, approve and lock ESG reports",

            icon: GitBranch,

            page: "workflow",

            status: workflowStatus
        },


        {
            title: "Reports",

            description:
                "Generate PDF and Excel ESG reports",

            icon: FileText,

            page: "reports",

            status: reportsAvailable
                ? "Available"
                : "Pending"
        }

    ];


    
    // UI
    

    return (

        <div className="min-h-screen bg-slate-50">


            {/* HEADER*/}

            <div className="bg-white border-b border-slate-200">

                <div className="max-w-7xl mx-auto px-6 py-5">


                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition mb-5"
                    >

                        <ArrowLeft size={20} />

                        Back to Projects

                    </button>


                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                        <div>

                            <h1 className="text-3xl font-bold text-slate-800">

                                {selectedProject.project_name}

                            </h1>


                            <p className="text-slate-500 mt-1">

                                ESG Project Overview

                            </p>

                        </div>


                        <span
                            className={`px-4 py-2 rounded-full text-sm font-medium w-fit ${
                                selectedProject.status === "ACTIVE"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >

                            {selectedProject.status || "ACTIVE"}

                        </span>


                    </div>

                </div>

            </div>


            {/*
                MAIN
            */}

            <div className="max-w-7xl mx-auto px-6 py-8">


                {/*
                    PROJECT INFORMATION
                */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">


                    <div className="flex items-center gap-3 mb-6">


                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">

                            <FileText
                                size={21}
                                className="text-emerald-600"
                            />

                        </div>


                        <div>

                            <h2 className="text-xl font-bold text-slate-800">

                                Project Information

                            </h2>


                            <p className="text-sm text-slate-500">

                                Basic project details

                            </p>

                        </div>


                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">


                        {/* PROJECT */}

                        <div className="bg-slate-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-slate-500 text-sm">

                                <FileText size={16} />

                                Project

                            </div>


                            <p className="font-semibold text-slate-800 mt-2">

                                {selectedProject.project_name}

                            </p>

                        </div>


                        {/* LOCATION */}

                        <div className="bg-slate-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-slate-500 text-sm">

                                <MapPin size={16} />

                                Location

                            </div>


                            <p className="font-semibold text-slate-800 mt-2">

                                {selectedProject.location || "N/A"}

                            </p>

                        </div>


                        {/* PROJECT MANAGER */}

                        <div className="bg-slate-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-slate-500 text-sm">

                                <UserRound size={16} />

                                Project Manager

                            </div>


                            <p className="font-semibold text-slate-800 mt-2">

                                {selectedProject.project_manager || "N/A"}

                            </p>

                        </div>


                        {/* REPORTING YEAR */}

                        <div className="bg-slate-50 rounded-xl p-4">

                            <div className="flex items-center gap-2 text-slate-500 text-sm">

                                <CalendarDays size={16} />

                                Reporting Year

                            </div>


                            <p className="font-semibold text-slate-800 mt-2">

                                {selectedProject.reporting_year || "N/A"}

                            </p>

                        </div>


                    </div>

                </div>


                {/*
                    ESG REPORTING PROGRESS
                */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">


                    <div className="flex items-center justify-between mb-6">


                        <div>

                            <h2 className="text-xl font-bold text-slate-800">

                                ESG Reporting Progress

                            </h2>


                            <p className="text-sm text-slate-500 mt-1">

                                Current status of project reporting modules

                            </p>

                        </div>


                        {/* OVERALL PERCENTAGE */}

                        <div className="text-right">

                            <p className="text-2xl font-bold text-emerald-600">

                                {loadingStatus
                                    ? "..."
                                    : `${progress}%`
                                }

                            </p>


                            <p className="text-xs text-slate-500">

                                Overall progress

                            </p>

                        </div>


                    </div>


                    {/* PROGRESS BAR */}

                    <div className="w-full bg-slate-100 rounded-full h-3">

                        <div
                            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{
                                width: loadingStatus
                                    ? "0%"
                                    : `${progress}%`
                            }}
                        />

                    </div>


                </div>


                {/*
                    MODULES
                */}

                <div className="mt-8">


                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-slate-800">

                            ESG Reporting Modules

                        </h2>


                        <p className="text-sm text-slate-500 mt-1">

                            Select a module to view or manage project data

                        </p>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


                        {modules.map((module) => {


                            const Icon = module.icon;


                            const completed =
                                module.status === "Completed";


                            return (

                                <button
                                    key={module.page}
                                    onClick={() =>
                                        onOpenModule(module.page)
                                    }
                                    className="text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
                                >


                                    <div className="flex items-start justify-between">


                                        {/* ICON */}

                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition">

                                            <Icon
                                                size={25}
                                                className="text-emerald-600"
                                            />

                                        </div>


                                        {/* STATUS */}

                                        {module.page === "workflow" ? (

                                            <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">

                                                <Clock3 size={14} />

                                                {module.status}

                                            </span>

                                        ) : module.page === "reports" ? (

                                            module.status === "Available" ? (

                                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">

                                                    <CheckCircle2 size={14} />

                                                    Available

                                                </span>

                                            ) : (

                                                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">

                                                    <Clock3 size={14} />

                                                    Pending

                                                </span>

                                            )

                                        ) : completed ? (

                                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">

                                                <CheckCircle2 size={14} />

                                                Completed

                                            </span>

                                        ) : (

                                            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">

                                                <Clock3 size={14} />

                                                Available

                                            </span>

                                        )}


                                    </div>


                                    {/* TITLE */}

                                    <h3 className="text-lg font-semibold text-slate-800 mt-5">

                                        {module.title}

                                    </h3>


                                    {/* DESCRIPTION */}

                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">

                                        {module.description}

                                    </p>


                                    {/* OPEN */}

                                    <div className="mt-5 text-sm font-medium text-emerald-600 group-hover:text-emerald-700">

                                        Open Module →

                                    </div>


                                </button>

                            );

                        })}


                    </div>

                </div>


            </div>

        </div>

    );

}


export default ProjectOverview;