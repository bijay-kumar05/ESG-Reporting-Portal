const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const brsrRoutes = require("./routes/brsrRoutes");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/brsr", brsrRoutes);


app.get("/", (req, res) => {
    res.json({
        message: "ESG Reporting API is running"
    });
});

// Authentication
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// projects
const projectRoutes = require("./routes/projectRoutes");

app.use("/api/projects", projectRoutes);

// Enviromental ESG
const environmentalRoutes =
    require("./routes/environmentalRoutes");

app.use(
    "/api/environmental",
    environmentalRoutes
);

// Social ESG

const socialRoutes = require("./routes/socialRoutes");

app.use(
    "/api/social",
    socialRoutes
);
 
// esg governance
const governanceRoutes = require("./routes/governanceRoutes");

app.use(
    "/api/governance",
    governanceRoutes
);



// governance route
const workflowRoutes = require("./routes/workflowRoutes");

app.use(
    "/api/workflow",
    workflowRoutes
);

// ESG Reports
const reportRoutes = require("./routes/reportRoutes");
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});