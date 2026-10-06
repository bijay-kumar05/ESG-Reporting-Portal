import { useState } from "react";
import axios from "axios";

function Login({onLogin}) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email: email,
                    password: password
                }
            );

            // Save JWT token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            onLogin();
            
        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">

            <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

                <h1 className="text-3xl font-bold text-emerald-600 text-center">
                    ESG Reporting Portal
                </h1>

                <p className="text-center text-gray-500 mt-2 mb-6">
                    ESG & BRSR Management System
                </p>

                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-3 rounded-lg mb-4"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-3 rounded-lg mb-4"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700
                        disabled:bg-emerald-400 text-white p-3 rounded-lg"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;