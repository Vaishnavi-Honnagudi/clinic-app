import { useEffect, useState } from "react";
import {
  getAppointments,
  callPatient,
  addMedicine,
} from "./api";

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();

      console.log("Doctor appointments API response:", res.data);

      // ✅ FORCE ARRAY
      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to load appointments", err);
      setAppointments([]);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCall = async (id) => {
    await callPatient(id);
    loadAppointments();
  };

  const handleComplete = async (id) => {
    const medicine = prompt("Enter medicine:");
    if (!medicine) return;

    await addMedicine(id, medicine);
    loadAppointments();
  };

  return (
  <div className="dashboard">
    <h2>Welcome Dr. {user.name}</h2>

    {appointments.length === 0 && (
      <p className="empty">No patients in queue</p>
    )}

    {appointments.map((a) => (
      <div className="card" key={a._id}>
        <b>{a.patientName}</b>{" "}
        <span className={`status-${a.status}`}>
          ({a.status})
        </span>

        {a.problem && <p>📝 Problem: {a.problem}</p>}

        {a.status === "waiting" && (
          <button
            className="btn btn-call"
            onClick={() => handleCall(a._id)}
          >
            Call
          </button>
        )}

        {a.status === "called" && (
          <button
            className="btn btn-complete"
            onClick={() => handleComplete(a._id)}
          >
            Complete
          </button>
        )}
      </div>
    ))}
  </div>
);
}
