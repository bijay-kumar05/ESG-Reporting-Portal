import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Leaf,
  Droplets,
  Zap,
  Recycle,
  Factory,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api/environmental";
const PROJECTS_API_URL = "http://localhost:5000/api/projects";

const gases = [
  { key: "co2", name: "Carbon Dioxide (CO₂)" },
  { key: "ch4", name: "Methane (CH₄)" },
  { key: "n2o", name: "Nitrous Oxide (N₂O)" },
  { key: "hfcs", name: "Hydrofluorocarbons (HFCs)" },
  { key: "pfcs", name: "Perfluorocarbons (PFCs)" },
  { key: "sf6", name: "Sulphur Hexafluoride (SF₆)" },
  { key: "nf3", name: "Nitrogen Trifluoride (NF₃)" },
];

const emptyScope = () => ({
  co2: "",
  ch4: "",
  n2o: "",
  hfcs: "",
  pfcs: "",
  sf6: "",
  nf3: "",
});

const emptyForm = (projectId = "", reportingYear = "2026") => ({
  projectId: projectId ? String(projectId) : "",
  reportingYear: String(reportingYear),
  energyConsumption: "",
  renewableEnergy: "",
  waterConsumption: "",
  wasteGenerated: "",
  wasteRecycled: "",
});

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken");

const getAuthConfig = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Your login session has expired. Please log in again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const numberOrEmpty = (value) =>
  value === null || value === undefined ? "" : String(value);

const normalizeRows = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.rows)) return responseData.rows;
  return [];
};

function Environmental({ onBack, selectedProject }) {
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState(() =>
    emptyForm(
      selectedProject?.id || "",
      selectedProject?.reporting_year || "2026"
    )
  );

  const [scope1, setScope1] = useState(emptyScope);
  const [scope2, setScope2] = useState(emptyScope);
  const [scope3, setScope3] = useState(emptyScope);

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --------------------------------------------------
  // Load available projects
  // --------------------------------------------------
  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);

    try {
      const response = await axios.get(
        PROJECTS_API_URL,
        getAuthConfig()
      );

      const projectRows = normalizeRows(response.data);

      setProjects(projectRows);

      // If the parent did not provide a project, select
      // the first available project.
      if (!selectedProject?.id && projectRows.length > 0) {
        setFormData((previous) => {
          if (previous.projectId) return previous;

          return {
            ...previous,
            projectId: String(projectRows[0].id),
          };
        });
      }
    } catch (err) {
      console.error("Failed to load projects:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load projects."
      );
    } finally {
      setLoadingProjects(false);
    }
  }, [selectedProject?.id]);

  // --------------------------------------------------
  // Load environmental summary and GHG data
  // --------------------------------------------------
  const fetchEnvironmentalData = useCallback(
    async (projectId, reportingYear) => {
      if (!projectId || !reportingYear) return;

      setLoadingData(true);
      setError("");
      setSuccess("");

      // Reset fields before loading a different project/year.
      setFormData((previous) => ({
        ...emptyForm(projectId, reportingYear),
      }));

      setScope1(emptyScope());
      setScope2(emptyScope());
      setScope3(emptyScope());

      const headers = getAuthConfig();

      // The endpoints are attempted independently.
      // One unavailable endpoint will not prevent the others
      // from being requested.
      const loadEndpoint = async (url) => {
        try {
          const response = await axios.get(url, headers);
          return {
            ok: true,
            data: response.data,
          };
        } catch (err) {
          console.warn(`Unable to load ${url}:`, err);
          return {
            ok: false,
            error: err,
          };
        }
      };

      try {
        // 1. Load environmental details.
        const detailsResult = await loadEndpoint(
          `${API_BASE_URL}/details/${projectId}/${reportingYear}`
        );

        let environmental = null;

        if (detailsResult.ok) {
          const responseData = detailsResult.data;

          environmental =
            responseData?.environmental ??
            responseData?.summary ??
            responseData?.data?.environmental ??
            responseData?.data?.summary ??
            null;

          // Some APIs return the summary object directly.
          if (
            !environmental &&
            responseData &&
            (
              "energy_consumption" in responseData ||
              "energyConsumption" in responseData
            )
          ) {
            environmental = responseData;
          }
        }

        // 2. If details did not provide the summary,
        // independently request the summary endpoint.
        if (!environmental) {
          const summaryResult = await loadEndpoint(
            `${API_BASE_URL}/summary/${projectId}/${reportingYear}`
          );

          if (summaryResult.ok) {
            const responseData = summaryResult.data;

            environmental =
              responseData?.environmental ??
              responseData?.summary ??
              responseData?.data?.environmental ??
              responseData?.data?.summary ??
              responseData?.data ??
              responseData ??
              null;

            if (
              environmental &&
              !(
                "energy_consumption" in environmental ||
                "energyConsumption" in environmental
              )
            ) {
              environmental = null;
            }
          }
        }

        // 3. Populate summary fields.
        if (environmental) {
          setFormData((previous) => ({
            ...previous,
            projectId: String(projectId),
            reportingYear: String(reportingYear),

            energyConsumption: numberOrEmpty(
              environmental.energy_consumption ??
                environmental.energyConsumption
            ),

            renewableEnergy: numberOrEmpty(
              environmental.renewable_energy ??
                environmental.renewableEnergy
            ),

            waterConsumption: numberOrEmpty(
              environmental.water_consumption ??
                environmental.waterConsumption
            ),

            wasteGenerated: numberOrEmpty(
              environmental.waste_generated ??
                environmental.wasteGenerated
            ),

            wasteRecycled: numberOrEmpty(
              environmental.waste_recycled ??
                environmental.wasteRecycled
            ),
          }));
        }

        // 4. Load greenhouse gas records independently.
        const ghgResult = await loadEndpoint(
          `${API_BASE_URL}/ghg/${projectId}/${reportingYear}`
        );

        if (ghgResult.ok) {
          const rows = normalizeRows(ghgResult.data);

          console.log("GHG DATA FROM SERVER:", rows);

          const makeScope = (scopeType) => {
            const row = rows.find(
              (item) =>
                String(
                  item.scope_type ??
                    item.scopeType ??
                    ""
                ).toUpperCase() === scopeType
            );

            if (!row) return emptyScope();

            return {
              co2: numberOrEmpty(
                row.co2_tco2e ?? row.co2 ?? ""
              ),

              ch4: numberOrEmpty(
                row.ch4_tco2e ?? row.ch4 ?? ""
              ),

              n2o: numberOrEmpty(
                row.n2o_tco2e ?? row.n2o ?? ""
              ),

              hfcs: numberOrEmpty(
                row.hfcs_tco2e ?? row.hfcs ?? ""
              ),

              pfcs: numberOrEmpty(
                row.pfcs_tco2e ?? row.pfcs ?? ""
              ),

              sf6: numberOrEmpty(
                row.sf6_tco2e ?? row.sf6 ?? ""
              ),

              nf3: numberOrEmpty(
                row.nf3_tco2e ?? row.nf3 ?? ""
              ),
            };
          };

          setScope1(makeScope("SCOPE_1"));
          setScope2(makeScope("SCOPE_2"));
          setScope3(makeScope("SCOPE_3"));
        }

        // Report missing data only if neither summary endpoint
        // returned usable environmental summary information.
        if (!environmental) {
          console.warn(
            "No environmental summary was returned for project",
            projectId,
            "and year",
            reportingYear
          );
        }
      } catch (err) {
        console.error("Failed to load environmental data:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load environmental data."
        );
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  // --------------------------------------------------
  // Initial project loading
  // --------------------------------------------------
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // --------------------------------------------------
  // Update selection when parent supplies a project
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedProject?.id) return;

    setFormData((previous) => ({
      ...previous,
      projectId: String(selectedProject.id),
      reportingYear: String(
        selectedProject.reporting_year || "2026"
      ),
    }));
  }, [selectedProject?.id, selectedProject?.reporting_year]);

  // --------------------------------------------------
  // Automatically load data when the selected project/year
  // changes. This also supports manual dropdown changes.
  // --------------------------------------------------
  useEffect(() => {
    if (!formData.projectId || !formData.reportingYear) {
      return;
    }

    fetchEnvironmentalData(
      formData.projectId,
      formData.reportingYear
    );
  }, [
    formData.projectId,
    formData.reportingYear,
    fetchEnvironmentalData,
  ]);

  // --------------------------------------------------
  // Handle summary field changes
  // --------------------------------------------------
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // Handle individual GHG field changes
  // --------------------------------------------------
  const handleScopeChange = (scopeNumber, key, value) => {
    const setters = {
      1: setScope1,
      2: setScope2,
      3: setScope3,
    };

    const setter = setters[scopeNumber];

    setter((previous) => ({
      ...previous,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // Save environmental data
  // --------------------------------------------------
  const saveEnvironmentalData = async (event) => {
    event.preventDefault();

    if (!formData.projectId) {
      setError("Please select a project.");
      return;
    }

    if (!formData.reportingYear) {
      setError("Please select a reporting year.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        projectId: Number(formData.projectId),
        reportingYear: Number(formData.reportingYear),

        energyConsumption:
          formData.energyConsumption === ""
            ? 0
            : Number(formData.energyConsumption),

        renewableEnergy:
          formData.renewableEnergy === ""
            ? 0
            : Number(formData.renewableEnergy),

        waterConsumption:
          formData.waterConsumption === ""
            ? 0
            : Number(formData.waterConsumption),

        wasteGenerated:
          formData.wasteGenerated === ""
            ? 0
            : Number(formData.wasteGenerated),

        wasteRecycled:
          formData.wasteRecycled === ""
            ? 0
            : Number(formData.wasteRecycled),

        scope1,
        scope2,
        scope3,
      };

      await axios.post(
        API_BASE_URL,
        payload,
        getAuthConfig()
      );

      setSuccess("Environmental data saved successfully.");

      // Reload saved values from the server.
      await fetchEnvironmentalData(
        formData.projectId,
        formData.reportingYear
      );
    } catch (err) {
      console.error("Failed to save environmental data:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save environmental data."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Reusable input field
  // --------------------------------------------------
  const renderInput = (
    label,
    name,
    value,
    icon,
    unit = ""
  ) => {
    const Icon = icon;

    return (
      <div className="space-y-2" key={name}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
            />
          )}

          <input
            id={name}
            type="number"
            min="0"
            step="any"
            name={name}
            value={value}
            onChange={handleChange}
            placeholder="Enter value"
            className={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 ${
              Icon ? "pl-10" : ""
            } ${unit ? "pr-16" : ""}`}
          />

          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  // --------------------------------------------------
  // Reusable GHG scope section
  // --------------------------------------------------
  const renderScope = (scopeNumber, scopeData) => {
    const setters = {
      1: setScope1,
      2: setScope2,
      3: setScope3,
    };

    const setter = setters[scopeNumber];

    return (
      <div
        key={scopeNumber}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Scope {scopeNumber}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {scopeNumber === 1 &&
                "Direct emissions from sources owned or controlled by the organization."}

              {scopeNumber === 2 &&
                "Indirect emissions from purchased electricity, steam, heating, or cooling."}

              {scopeNumber === 3 &&
                "Other indirect emissions across the value chain."}
            </p>
          </div>

          <Factory
            size={23}
            className="shrink-0 text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {gases.map((gas) => (
            <div key={gas.key} className="space-y-2">
              <label
                htmlFor={`scope${scopeNumber}_${gas.key}`}
                className="block text-sm font-medium text-gray-700"
              >
                {gas.name}
              </label>

              <input
                id={`scope${scopeNumber}_${gas.key}`}
                type="number"
                min="0"
                step="any"
                value={scopeData[gas.key]}
                onChange={(event) =>
                  handleScopeChange(
                    scopeNumber,
                    gas.key,
                    event.target.value
                  )
                }
                placeholder="Enter emission value"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Enter values in tCO₂e, using the same unit consistently
          across all gases.
        </p>
      </div>
    );
  };

  // --------------------------------------------------
  // Page UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mt-1 rounded-xl border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <Leaf size={26} className="text-green-600" />

                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                  Environmental Reporting
                </h1>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Monitor environmental performance and greenhouse
                gas emissions for your projects.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchEnvironmentalData(
                formData.projectId,
                formData.reportingYear
              )
            }
            disabled={
              loadingData ||
              !formData.projectId ||
              !formData.reportingYear
            }
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loadingData ? "animate-spin" : ""}
            />

            Refresh data
          </button>
        </div>

        {/* Project and year selectors */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Project details
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-gray-700"
              >
                Select project
              </label>

              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                disabled={loadingProjects}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">
                  {loadingProjects
                    ? "Loading projects..."
                    : "Choose a project"}
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={String(project.id)}
                  >
                    {project.project_name ||
                      project.name ||
                      `Project ${project.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reportingYear"
                className="block text-sm font-medium text-gray-700"
              >
                Reporting year
              </label>

              <select
                id="reportingYear"
                name="reportingYear"
                value={formData.reportingYear}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
          >
            <CheckCircle size={20} />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Loading status */}
        {loadingData && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
            <LoaderCircle size={20} className="animate-spin" />

            <span className="text-sm">
              Loading environmental data for the selected project...
            </span>
          </div>
        )}

        <form onSubmit={saveEnvironmentalData}>
          {/* Environmental summary */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Environmental metrics
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Energy, water, and waste data for the selected
                reporting period.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {renderInput(
                "Energy consumption",
                "energyConsumption",
                formData.energyConsumption,
                Zap,
                "kWh"
              )}

              {renderInput(
                "Renewable energy",
                "renewableEnergy",
                formData.renewableEnergy,
                Leaf,
                "kWh"
              )}

              {renderInput(
                "Water consumption",
                "waterConsumption",
                formData.waterConsumption,
                Droplets,
                "m³"
              )}

              {renderInput(
                "Waste generated",
                "wasteGenerated",
                formData.wasteGenerated,
                Recycle,
                "tonnes"
              )}

              {renderInput(
                "Waste recycled",
                "wasteRecycled",
                formData.wasteRecycled,
                Recycle,
                "tonnes"
              )}
            </div>
          </section>

          {/* GHG emissions */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Greenhouse gas emissions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Record emissions by scope and greenhouse gas type.
              </p>
            </div>

            <div className="space-y-5">
              {renderScope(1, scope1)}
              {renderScope(2, scope2)}
              {renderScope(3, scope3)}
            </div>
          </section>

          {/* Save controls */}
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() =>
                fetchEnvironmentalData(
                  formData.projectId,
                  formData.reportingYear
                )
              }
              disabled={
                loadingData ||
                saving ||
                !formData.projectId
              }
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              Discard changes
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingData ||
                !formData.projectId
              }
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save environmental data
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          ESG Reporting Portal · Environmental data management
        </p>
      </div>
    </div>
  );
}

export default Environmental;