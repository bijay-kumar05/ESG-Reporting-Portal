import {
    FileText,
    Leaf,
    Users,
    ShieldCheck,
    ArrowLeft,
    ClipboardCheck
} from "lucide-react";

function BRSRDashboard({ onBack, onOpenGeneral,onOpenEnvironmental,onOpenSocial,onOpenGovernance,onOpenReport}) {

    const modules = [
        {
            title: "General Disclosures",
            description:
                "Entity and reporting information required for BRSR.",
            icon: FileText,
            color: "blue",
            action: onOpenGeneral
        },
        {
            title: "Environmental Disclosures",
            description:
                "BRSR environmental information from ESG data.",
            icon: Leaf,
            color: "green",
            action: onOpenEnvironmental
        },
        {
            title: "Social Disclosures",
            description:
                "BRSR social information from ESG data.",
            icon: Users,
            color: "purple",
            action: onOpenSocial
        },
        {
            title: "Governance Disclosures",
            description:
                "BRSR governance information from ESG data.",
            icon: ShieldCheck,
            color: "orange",
            action: onOpenGovernance
        },
        {
            title: "BRSR Report",
            description:
                "Review and generate the complete BRSR report.",
            icon: ClipboardCheck,
            color: "indigo",
            action:  onOpenReport
        }
    ];

    const colorClasses = {
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        purple: "bg-purple-100 text-purple-700",
        orange: "bg-orange-100 text-orange-700",
        indigo: "bg-indigo-100 text-indigo-700"
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
                <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">

                    <div className="flex items-center gap-4">

                        <div className="p-4 bg-blue-100 rounded-xl">
                            <FileText
                                size={34}
                                className="text-blue-700"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                BRSR Reporting
                            </h1>

                            <p className="text-slate-500 mt-2">
                                Business Responsibility and Sustainability
                                Reporting
                            </p>
                        </div>

                    </div>

                </div>

                {/* Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">

                    <h2 className="font-semibold text-blue-900 mb-1">
                        BRSR Compliance Workspace
                    </h2>

                    <p className="text-sm text-blue-800">
                        BRSR disclosures will use the Environmental,
                        Social and Governance information already
                        collected in the ESG Reporting Portal.
                    </p>

                </div>

                {/* Modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {modules.map((module) => {

                        const Icon = module.icon;

                        return (
                            <div
                                key={module.title}
                                className="bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md transition"
                            >

                                <div
                                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${colorClasses[module.color]}`}
                                >
                                    <Icon size={28} />
                                </div>

                                <h3 className="text-lg font-bold text-slate-800">
                                    {module.title}
                                </h3>

                                <p className="text-sm text-slate-500 mt-2 min-h-[48px]">
                                    {module.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={module.action}
                                    className="mt-5 w-full px-4 py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                                >
                                    {module.title === "General Disclosures" ||
                                    module.title === "Environmental Disclosures"||
                                    module.title === "Social Disclosures"||
                                    module.title === "Governance Disclosures"||
                                    module.title === "BRSR Report"
                                        ? "Open"
                                        : "Coming Next"}
                                </button>

                            </div>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}

export default BRSRDashboard;