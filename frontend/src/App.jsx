import { useState } from "react";
import { registerUser, loginUser } from "./api";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      if (isLogin) {
        const res = await loginUser(form);
        setUser(res.data);
      } else {
        await registerUser(form);
        alert("Registered successfully. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  // ---------------- DASHBOARD ----------------
  if (user) {
    return user.role === "doctor" ? (
      <DoctorDashboard user={user} />
    ) : (
      <PatientDashboard user={user} />
    );
  }

  // ---------------- AUTH SCREEN ----------------
  return (
    <div className="container">
      <h1>Clinic Queue App</h1>

      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={handleSubmit}>
        {isLogin ? "Login" : "Register"}
      </button>

      <p onClick={() => setIsLogin(!isLogin)} className="toggle">
        {isLogin ? "Create account" : "Already have account"}
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default App;