import { useEffect, useState } from "react";
import { bookAppointment, getAppointments } from "./api";

export default function PatientDashboard({ user }) {
  const [problem, setProblem] = useState("");
  const [appointments, setAppointments] = useState([]);

  const load = async () => {
    const res = await getAppointments();
    setAppointments(res.data);
  };

  const book = async () => {
    await bookAppointment({
      patientId: user._id,
      patientName: user.name,
      problem,
    });
    setProblem("");
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
  <div className="dashboard">
    <h2>Welcome {user.name}</h2>

    <div className="card">
      <input
        placeholder="Describe your problem"
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
      />
      <button className="btn btn-call" onClick={book}>
        Book Appointment
      </button>
    </div>

    <h3>Your Queue</h3>

    {appointments.map((a) => (
      <div className="card" key={a._id}>
        <b>{a.patientName}</b>{" "}
        <span className={`status-${a.status}`}>
          ({a.status})
        </span>

        {a.medicine && <p>💊 Medicine: {a.medicine}</p>}
      </div>
    ))}
  </div>
);
}