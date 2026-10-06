import { useState } from "react";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Environmental from "./pages/Environmental";
import Social from "./pages/Social";
import Governance from "./pages/Governance";
import Workflow from "./pages/Workflow";
import Reports from "./pages/Reports";
import BRSRGeneral from "./pages/BRSRGeneral";
import ProjectOverview from "./pages/ProjectOverview";

function App() {

    const [loggedIn, setLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [currentPage, setCurrentPage] = useState("dashboard");

    // Store the currently selected project
    const [selectedProject, setSelectedProject] = useState(null);

    const [moduleBackPage, setModuleBackPage] = useState("dashboard");

    if (!loggedIn) {
        return (
            <Login
                onLogin={() => {
                    setLoggedIn(true);
                    setCurrentPage("dashboard");
                }}
            />
        );
    }


    // PROJECTS
    if (currentPage === "projects") {
        return (
            <Projects
                onBack={() => setCurrentPage("dashboard")}

                onOpenProject={(project) => {
                    setSelectedProject(project);
                    setCurrentPage("project-overview");
                }}
            />
        );
    }

    // project overview
    if (currentPage === "project-overview") {
    return (
        <ProjectOverview
            selectedProject={selectedProject}
            onBack={() => setCurrentPage("projects")}
            onOpenModule={(page) => {
                setModuleBackPage("project-overview");
                setCurrentPage(page);
            }}
        />
    );
}

    // ENVIRONMENTAL
    if (currentPage === "environmental") {
        return (
            <Environmental
                selectedProject={selectedProject}
                onBack={() => setCurrentPage(moduleBackPage)}
            />
        );
    }


    // SOCIAL
    if (currentPage === "social") {
        return (
            <Social
                selectedProject={selectedProject}
                onBack={() => setCurrentPage(moduleBackPage)}
            />
        );
    }


    // GOVERNANCE
    if (currentPage === "governance") {
        return (
            <Governance
                onBack={() => setCurrentPage(moduleBackPage)}
            />
        );
    }


    // WORKFLOW
    if (currentPage === "workflow") {
        return (
            <Workflow
                onBack={() => setCurrentPage(moduleBackPage)}
            />
        );
    }


    // REPORTS
    if (currentPage === "reports") {
        return (
            <Reports
                 selectedProject={selectedProject}
                onBack={() => setCurrentPage(moduleBackPage)}
            />
        );
    }


    // BRSR
    if (currentPage === "brsr-general") {
        return (
            <BRSRGeneral
                onBack={() => setCurrentPage("dashboard")}
            />
        );
    }


   // DASHBOARD
return (
    <Dashboard
        onNavigate={(page) => {

            if (
                page === "environmental" ||
                page === "social" ||
                page === "governance" ||
                page === "workflow" ||
                page === "reports"
            ) {
                setModuleBackPage("dashboard");
            }

            setCurrentPage(page);
        }}

        onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setLoggedIn(false);
        }}
    />
);
}

export default App;