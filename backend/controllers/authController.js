const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ── helpers ─────────────────────────────────────────────────
const VALID_ROLES = ["ADMIN", "GROUP", "SUBSIDIARY", "BUSINESS_UNIT"];

// Build a JOIN query so login response always includes hierarchy names
const USER_SELECT_SQL = `
  SELECT
    u.id, u.name, u.email, u.password, u.role, u.status,
    u.group_id, u.subsidiary_id, u.business_unit_id,
    g.name  AS group_name,
    s.name  AS subsidiary_name,
    b.name  AS business_unit_name
  FROM users u
  LEFT JOIN \`groups\`       g ON g.id = u.group_id
  LEFT JOIN subsidiaries     s ON s.id = u.subsidiary_id
  LEFT JOIN business_units   b ON b.id = u.business_unit_id
  WHERE u.email = ?
`;

// ── LOGIN ────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        db.query(USER_SELECT_SQL, [email], async (err, results) => {
            if (err) {
                console.error("DB error (login):", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const user = results[0];

            if (user.status !== "ACTIVE") {
                return res.status(403).json({ message: "Your account is inactive. Contact admin." });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const tokenPayload = {
                id:               user.id,
                email:            user.email,
                role:             user.role,
                group_id:         user.group_id,
                subsidiary_id:    user.subsidiary_id,
                business_unit_id: user.business_unit_id
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
                expiresIn: "1d"
            });

            return res.json({
                message: "Login successful",
                token,
                user: {
                    id:                   user.id,
                    name:                 user.name,
                    email:                user.email,
                    role:                 user.role,
                    group_id:             user.group_id,
                    group_name:           user.group_name,
                    subsidiary_id:        user.subsidiary_id,
                    subsidiary_name:      user.subsidiary_name,
                    business_unit_id:     user.business_unit_id,
                    business_unit_name:   user.business_unit_name
                }
            });
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── REGISTER ─────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            group_id,
            subsidiary_id,
            business_unit_id
        } = req.body;

        // --- basic validation ---
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password, and role are required"
            });
        }

        if (!VALID_ROLES.includes(role)) {
            return res.status(400).json({
                message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`
            });
        }

        // --- role-specific scope validation ---
        if (role === "GROUP" && !group_id) {
            return res.status(400).json({ message: "group_id is required for GROUP role" });
        }
        if (role === "SUBSIDIARY" && (!group_id || !subsidiary_id)) {
            return res.status(400).json({ message: "group_id and subsidiary_id are required for SUBSIDIARY role" });
        }
        if (role === "BUSINESS_UNIT" && (!group_id || !subsidiary_id || !business_unit_id)) {
            return res.status(400).json({ message: "group_id, subsidiary_id, and business_unit_id are required for BUSINESS_UNIT role" });
        }

        // --- check duplicate email ---
        db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
            if (err) {
                console.error("DB error (register check):", err);
                return res.status(500).json({ message: "Database error" });
            }

            if (rows.length > 0) {
                return res.status(409).json({ message: "Email already registered" });
            }

            // --- hash password ---
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSQL = `
                INSERT INTO users
                    (name, email, password, role, group_id, subsidiary_id, business_unit_id, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
            `;

            const params = [
                name,
                email,
                hashedPassword,
                role,
                group_id         || null,
                subsidiary_id    || null,
                business_unit_id || null
            ];

            db.query(insertSQL, params, (err2, result) => {
                if (err2) {
                    console.error("DB error (register insert):", err2);
                    return res.status(500).json({ message: "Failed to create user" });
                }

                return res.status(201).json({
                    message: "Registration successful",
                    user: {
                        id:               result.insertId,
                        name,
                        email,
                        role,
                        group_id:         group_id         || null,
                        subsidiary_id:    subsidiary_id    || null,
                        business_unit_id: business_unit_id || null
                    }
                });
            });
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET HIERARCHY DATA (for register dropdowns) ───────────────
const getGroups = (req, res) => {
    db.query("SELECT id, name, code FROM `groups` ORDER BY name", (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

const getSubsidiaries = (req, res) => {
    const { group_id } = req.query;
    const sql = group_id
        ? "SELECT id, name, code FROM subsidiaries WHERE group_id = ? ORDER BY name"
        : "SELECT id, name, code FROM subsidiaries ORDER BY name";
    const params = group_id ? [group_id] : [];

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

const getBusinessUnits = (req, res) => {
    const { subsidiary_id } = req.query;
    const sql = subsidiary_id
        ? "SELECT id, name, code FROM business_units WHERE subsidiary_id = ? ORDER BY name"
        : "SELECT id, name, code FROM business_units ORDER BY name";
    const params = subsidiary_id ? [subsidiary_id] : [];

    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
};

module.exports = {
    login,
    register,
    getGroups,
    getSubsidiaries,
    getBusinessUnits
};