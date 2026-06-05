import { useState } from "react";
import { registerUser, loginUser } from "./api";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");

      if (isLogin) {
        if (!form.email || !form.password) {
          setError("Please fill in all fields");
          return;
        }
        const res = await loginUser({ email: form.email, password: form.password });
        setUser(res.data);
      } else {
        if (!form.name || !form.email || !form.password) {
          setError("Please fill in all fields");
          return;
        }
        await registerUser(form);
        alert("Registered successfully. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please check connection.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setForm({ name: "", email: "", password: "" });
  };

  // ---------------- RENDERING LOGGED IN ----------------
  if (user) {
    return (
      <>
        <header className="app-header">
          <div className="header-container">
            <a href="/" className="logo">
              🩺 <span>ClinicFlow</span>
            </a>
            <div className="user-nav-info">
              <span className={`user-badge role-${user.role}`}>
                {user.role === "doctor" ? "👨‍⚕️ Dr. " : "👤 Patient: "} {user.name}
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="main-content animate-fade-in">
          {user.role === "doctor" ? (
            <DoctorDashboard user={user} />
          ) : (
            <PatientDashboard user={user} />
          )}
        </main>
      </>
    );
  }

  // ---------------- RENDERING AUTH SCREEN ----------------
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🏥</div>
          <h1>ClinicFlow</h1>
          <p>Manage your appointments and queue status live</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Enter your name"
                className="input-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="name@example.com"
              className="input-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              className="input-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-primary">
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {error && <div className="alert-error">{error}</div>}
      </div>
    </div>
  );
}

export default App;