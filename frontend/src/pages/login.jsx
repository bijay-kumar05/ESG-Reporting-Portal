import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const ROLE_META = {
    GROUP: {
        label: "Group",
        icon: "🏛️",
        color: "#6366f1",
        gradient: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        desc: "Oversee all subsidiaries & consolidated ESG data"
    },
    SUBSIDIARY: {
        label: "Subsidiary",
        icon: "🏢",
        color: "#0ea5e9",
        gradient: "linear-gradient(135deg,#0ea5e9,#6366f1)",
        desc: "Manage subsidiary-level ESG data & business units"
    },
    BUSINESS_UNIT: {
        label: "Business Unit",
        icon: "🏭",
        color: "#10b981",
        gradient: "linear-gradient(135deg,#10b981,#0ea5e9)",
        desc: "Enter & submit ESG data for your business unit"
    },
    ADMIN: {
        label: "Admin",
        icon: "⚡",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
        desc: "Full system access across all levels"
    }
};

export default function AuthPage({ onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [selectedRole, setSelectedRole] = useState(null);

    // login state
    const [loginEmail,    setLoginEmail]    = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // register state
    const [regName,     setRegName]     = useState("");
    const [regEmail,    setRegEmail]    = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRole,     setRegRole]     = useState("");
    const [regGroupId,  setRegGroupId]  = useState("");
    const [regSubId,    setRegSubId]    = useState("");
    const [regBuId,     setRegBuId]     = useState("");

    // dropdown data
    const [groups,      setGroups]      = useState([]);
    const [subsidiaries,setSubsidiaries]= useState([]);
    const [busUnits,    setBusUnits]    = useState([]);

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");
    const [success, setSuccess] = useState("");

    // ── fetch groups on mount ──────────────────────────────────
    useEffect(() => {
        axios.get(`${API}/auth/groups`)
            .then(r => setGroups(r.data))
            .catch(() => {});
    }, []);

    // ── cascade: group → subsidiaries ─────────────────────────
    useEffect(() => {
        setRegSubId("");
        setRegBuId("");
        setBusUnits([]);
        if (!regGroupId) { setSubsidiaries([]); return; }
        axios.get(`${API}/auth/subsidiaries?group_id=${regGroupId}`)
            .then(r => setSubsidiaries(r.data))
            .catch(() => {});
    }, [regGroupId]);

    // ── cascade: subsidiary → business units ──────────────────
    useEffect(() => {
        setRegBuId("");
        if (!regSubId) { setBusUnits([]); return; }
        axios.get(`${API}/auth/business-units?subsidiary_id=${regSubId}`)
            .then(r => setBusUnits(r.data))
            .catch(() => {});
    }, [regSubId]);

    // ── LOGIN ──────────────────────────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const { data } = await axios.post(`${API}/auth/login`, {
                email: loginEmail, password: loginPassword
            });
            localStorage.setItem("token", data.token);
            localStorage.setItem("user",  JSON.stringify(data.user));
            onLogin();
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── REGISTER ───────────────────────────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            await axios.post(`${API}/auth/register`, {
                name:             regName,
                email:            regEmail,
                password:         regPassword,
                role:             regRole,
                group_id:         regGroupId    || undefined,
                subsidiary_id:    regSubId      || undefined,
                business_unit_id: regBuId       || undefined
            });
            setSuccess("Account created! You can now sign in.");
            setMode("login");
            setRegName(""); setRegEmail(""); setRegPassword("");
            setRegRole(""); setRegGroupId(""); setRegSubId(""); setRegBuId("");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const needsGroup      = ["GROUP","SUBSIDIARY","BUSINESS_UNIT"].includes(regRole);
    const needsSubsidiary = ["SUBSIDIARY","BUSINESS_UNIT"].includes(regRole);
    const needsBU         = regRole === "BUSINESS_UNIT";

    return (
        <div style={styles.page}>
            {/* ── Background blobs ── */}
            <div style={{...styles.blob, top:"5%",  left:"5%",  background:"radial-gradient(circle,#6366f155,transparent 70%)"}}/>
            <div style={{...styles.blob, top:"60%", right:"5%", background:"radial-gradient(circle,#10b98155,transparent 70%)"}}/>
            <div style={{...styles.blob, top:"30%", left:"50%", background:"radial-gradient(circle,#0ea5e933,transparent 70%)"}}/>

            <div style={styles.container}>
                {/* ── Left Panel ── */}
                <div style={styles.leftPanel}>
                    <div style={styles.brand}>
                        <div style={styles.brandLogo}>🌿</div>
                        <div>
                            <h1 style={styles.brandTitle}>ESG Portal</h1>
                            <p style={styles.brandSub}>BRSR & Sustainability Management</p>
                        </div>
                    </div>
                    <p style={styles.brandDesc}>
                        Manage environmental, social &amp; governance data across your entire
                        corporate hierarchy — from Group level down to individual Business Units.
                    </p>

                    <div style={styles.roleCards}>
                        {Object.entries(ROLE_META).map(([key, meta]) => (
                            <div key={key} style={styles.roleCard}>
                                <span style={styles.roleCardIcon}>{meta.icon}</span>
                                <div>
                                    <div style={{...styles.roleCardLabel, color: meta.color}}>
                                        {meta.label}
                                    </div>
                                    <div style={styles.roleCardDesc}>{meta.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={styles.stats}>
                        {[["4","Roles"],["100%","Secure"],["BRSR","Ready"]].map(([n,l])=>(
                            <div key={l} style={styles.stat}>
                                <span style={styles.statNum}>{n}</span>
                                <span style={styles.statLabel}>{l}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right Panel ── */}
                <div style={styles.rightPanel}>
                    <div style={styles.tabRow}>
                        {["login","register"].map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                                style={{...styles.tab, ...(mode===m ? styles.tabActive : {})}}
                            >
                                {m === "login" ? "Sign In" : "Register"}
                            </button>
                        ))}
                    </div>

                    {/* ── Messages ── */}
                    {error   && <div style={styles.msgError}><span>⚠</span> {error}</div>}
                    {success && <div style={styles.msgSuccess}><span>✓</span> {success}</div>}

                    {/* ══════════════ LOGIN FORM ══════════════ */}
                    {mode === "login" && (
                        <form onSubmit={handleLogin} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>✉</span>
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>🔒</span>
                                    <input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        style={styles.input}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        {showPassword ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>

                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
                            >
                                {loading ? <><span style={styles.spinner}/> Signing in…</> : "Sign In →"}
                            </button>

                            <p style={styles.switchText}>
                                Don't have an account?{" "}
                                <button type="button" onClick={() => setMode("register")} style={styles.switchLink}>
                                    Create one
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ══════════════ REGISTER FORM ══════════════ */}
                    {mode === "register" && (
                        <form onSubmit={handleRegister} style={styles.form}>
                            {/* Name */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Full Name</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>👤</span>
                                    <input
                                        id="reg-name"
                                        type="text"
                                        value={regName}
                                        onChange={e => setRegName(e.target.value)}
                                        placeholder="Your full name"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>✉</span>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        value={regEmail}
                                        onChange={e => setRegEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        style={styles.input}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Password</label>
                                <div style={styles.inputWrap}>
                                    <span style={styles.inputIcon}>🔒</span>
                                    <input
                                        id="reg-password"
                                        type={showPassword ? "text" : "password"}
                                        value={regPassword}
                                        onChange={e => setRegPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        style={styles.input}
                                        minLength={8}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={styles.eyeBtn}
                                    >
                                        {showPassword ? "🙈" : "👁"}
                                    </button>
                                </div>
                            </div>

                            {/* Role selector */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Select Your Role</label>
                                <div style={styles.roleGrid}>
                                    {Object.entries(ROLE_META).filter(([k]) => k !== "ADMIN").map(([key, meta]) => (
                                        <button
                                            type="button"
                                            key={key}
                                            id={`role-${key.toLowerCase()}`}
                                            onClick={() => { setRegRole(key); setRegGroupId(""); setRegSubId(""); setRegBuId(""); }}
                                            style={{
                                                ...styles.rolePill,
                                                ...(regRole === key ? {
                                                    background: meta.gradient,
                                                    color: "#fff",
                                                    borderColor: "transparent",
                                                    boxShadow: `0 4px 20px ${meta.color}55`
                                                } : {})
                                            }}
                                        >
                                            <span>{meta.icon}</span>
                                            <span>{meta.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Group dropdown */}
                            {needsGroup && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Group</label>
                                    <div style={styles.inputWrap}>
                                        <span style={styles.inputIcon}>🏛️</span>
                                        <select
                                            id="reg-group"
                                            value={regGroupId}
                                            onChange={e => setRegGroupId(e.target.value)}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="">-- Select Group --</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Subsidiary dropdown */}
                            {needsSubsidiary && regGroupId && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Subsidiary</label>
                                    <div style={styles.inputWrap}>
                                        <span style={styles.inputIcon}>🏢</span>
                                        <select
                                            id="reg-subsidiary"
                                            value={regSubId}
                                            onChange={e => setRegSubId(e.target.value)}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="">-- Select Subsidiary --</option>
                                            {subsidiaries.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Business Unit dropdown */}
                            {needsBU && regSubId && (
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Business Unit</label>
                                    <div style={styles.inputWrap}>
                                        <span style={styles.inputIcon}>🏭</span>
                                        <select
                                            id="reg-bu"
                                            value={regBuId}
                                            onChange={e => setRegBuId(e.target.value)}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="">-- Select Business Unit --</option>
                                            {busUnits.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button
                                id="reg-submit"
                                type="submit"
                                disabled={loading}
                                style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
                            >
                                {loading ? <><span style={styles.spinner}/> Creating account…</> : "Create Account →"}
                            </button>

                            <p style={styles.switchText}>
                                Already have an account?{" "}
                                <button type="button" onClick={() => setMode("login")} style={styles.switchLink}>
                                    Sign in
                                </button>
                            </p>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                body { margin: 0; font-family: 'Inter', sans-serif; }
                input::placeholder, select option[value=""] { color: #64748b; }
                select option { background: #0f172a; color: #e2e8f0; }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
            `}</style>
        </div>
    );
}

// ── Inline Styles ───────────────────────────────────────────
const styles = {
    page: {
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020617 0%,#0f172a 40%,#1e1b4b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        overflow: "hidden"
    },
    blob: {
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0
    },
    container: {
        display: "flex",
        maxWidth: "1000px",
        width: "100%",
        background: "rgba(15,23,42,0.85)",
        backdropFilter: "blur(20px)",
        borderRadius: "28px",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
        animation: "fadeIn 0.5s ease"
    },
    leftPanel: {
        flex: "0 0 380px",
        background: "linear-gradient(160deg,rgba(99,102,241,0.15),rgba(16,185,129,0.08))",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 36px",
        display: "flex",
        flexDirection: "column",
        gap: "28px"
    },
    brand: {
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },
    brandLogo: {
        fontSize: "42px",
        lineHeight: 1
    },
    brandTitle: {
        margin: 0,
        fontSize: "26px",
        fontWeight: 800,
        background: "linear-gradient(135deg,#fff,#94a3b8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    brandSub: {
        margin: "2px 0 0",
        fontSize: "12px",
        color: "#64748b",
        fontWeight: 500
    },
    brandDesc: {
        margin: 0,
        fontSize: "14px",
        color: "#94a3b8",
        lineHeight: 1.7
    },
    roleCards: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },
    roleCard: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)"
    },
    roleCardIcon: {
        fontSize: "22px",
        lineHeight: 1,
        marginTop: "2px"
    },
    roleCardLabel: {
        fontSize: "13px",
        fontWeight: 700,
        marginBottom: "2px"
    },
    roleCardDesc: {
        fontSize: "11.5px",
        color: "#64748b",
        lineHeight: 1.5
    },
    stats: {
        display: "flex",
        gap: "16px",
        marginTop: "auto"
    },
    stat: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        padding: "12px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.05)"
    },
    statNum: {
        fontSize: "22px",
        fontWeight: 800,
        color: "#6366f1"
    },
    statLabel: {
        fontSize: "11px",
        color: "#64748b",
        fontWeight: 600,
        marginTop: "2px"
    },
    rightPanel: {
        flex: 1,
        padding: "48px 44px",
        overflowY: "auto",
        maxHeight: "90vh"
    },
    tabRow: {
        display: "flex",
        gap: "8px",
        marginBottom: "32px",
        background: "rgba(255,255,255,0.04)",
        padding: "5px",
        borderRadius: "14px"
    },
    tab: {
        flex: 1,
        padding: "11px",
        borderRadius: "10px",
        border: "none",
        background: "transparent",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all .2s"
    },
    tabActive: {
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        color: "#fff",
        boxShadow: "0 4px 16px #6366f155"
    },
    msgError: {
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.3)",
        color: "#fca5a5",
        borderRadius: "10px",
        padding: "12px 16px",
        marginBottom: "20px",
        fontSize: "13.5px",
        display: "flex",
        gap: "8px",
        alignItems: "center"
    },
    msgSuccess: {
        background: "rgba(16,185,129,0.12)",
        border: "1px solid rgba(16,185,129,0.3)",
        color: "#6ee7b7",
        borderRadius: "10px",
        padding: "12px 16px",
        marginBottom: "20px",
        fontSize: "13.5px",
        display: "flex",
        gap: "8px",
        alignItems: "center"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        animation: "fadeIn 0.3s ease"
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    label: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#cbd5e1",
        letterSpacing: "0.3px"
    },
    inputWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },
    inputIcon: {
        position: "absolute",
        left: "14px",
        fontSize: "16px",
        pointerEvents: "none",
        zIndex: 1
    },
    input: {
        width: "100%",
        padding: "13px 46px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        color: "#f1f5f9",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        transition: "border .2s, box-shadow .2s"
    },
    select: {
        width: "100%",
        padding: "13px 46px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        color: "#f1f5f9",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        cursor: "pointer",
        appearance: "none"
    },
    eyeBtn: {
        position: "absolute",
        right: "14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        padding: 0,
        lineHeight: 1
    },
    roleGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "10px"
    },
    rolePill: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        padding: "14px 10px",
        background: "rgba(255,255,255,0.04)",
        border: "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        color: "#94a3b8",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        transition: "all .2s",
        lineHeight: 1
    },
    submitBtn: {
        padding: "15px",
        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
        border: "none",
        borderRadius: "14px",
        color: "#fff",
        fontSize: "15px",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 6px 24px rgba(99,102,241,0.4)",
        transition: "all .2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        marginTop: "4px"
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#fff",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite"
    },
    switchText: {
        textAlign: "center",
        fontSize: "13px",
        color: "#64748b",
        margin: 0
    },
    switchLink: {
        background: "none",
        border: "none",
        color: "#818cf8",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: "13px",
        padding: 0
    }
};