import { useEffect, useState } from "react";
import {
  getAppointments,
  getCompletedAppointments,
  callPatient,
  addMedicine,
} from "./api";

export default function DoctorDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [completed, setCompleted] = useState([]);
  
  // Custom prescription modal states
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [medicine, setMedicine] = useState("");
  const [modalError, setModalError] = useState("");

  const loadData = async () => {
    try {
      const activeRes = await getAppointments();
      if (Array.isArray(activeRes.data)) {
        setAppointments(activeRes.data);
      } else {
        setAppointments([]);
      }

      const completedRes = await getCompletedAppointments();
      if (Array.isArray(completedRes.data)) {
        setCompleted(completedRes.data);
      } else {
        setCompleted([]);
      }
    } catch (err) {
      console.error("Failed to load appointments data", err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll for updates every 10 seconds for real-time dashboard feel
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCall = async (id) => {
    try {
      await callPatient(id);
      loadData();
    } catch (err) {
      console.error("Error calling patient:", err);
    }
  };

  const openPrescriptionModal = (appt) => {
    setSelectedAppt(appt);
    setMedicine("");
    setModalError("");
  };

  const closePrescriptionModal = () => {
    setSelectedAppt(null);
    setMedicine("");
    setModalError("");
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!medicine.trim()) {
      setModalError("Please enter at least one medicine prescription.");
      return;
    }

    try {
      await addMedicine(selectedAppt._id, medicine.trim());
      closePrescriptionModal();
      loadData();
    } catch (err) {
      console.error("Error saving prescription:", err);
      setModalError("Failed to save prescription. Please try again.");
    }
  };

  const handleCallNext = async () => {
    const nextPatient = appointments.find((a) => a.status === "waiting");
    if (nextPatient) {
      await handleCall(nextPatient._id);
    } else {
      alert("No patients currently waiting in the queue.");
    }
  };

  // Stats calculation
  const waitingCount = appointments.filter((a) => a.status === "waiting").length;
  const activeConsulting = appointments.filter((a) => a.status === "called").length;

  return (
    <div className="dashboard-grid cols-3-1">
      {/* LEFT COLUMN: ACTIVE QUEUE & PATIENTS */}
      <div className="glass-panel">
        <div className="panel-header">
          <h2>Active Queue & Consultations</h2>
          {waitingCount > 0 && (
            <button className="btn-action btn-call-patient" onClick={handleCallNext}>
              📢 Call Next Patient
            </button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-value">{waitingCount}</div>
            <div className="stat-label">Waiting</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{activeConsulting}</div>
            <div className="stat-label">In Office</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{completed.length}</div>
            <div className="stat-label">Completed Today</div>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="empty-queue-visual">
            <div className="empty-queue-icon">🍃</div>
            <p>The queue is currently empty.</p>
          </div>
        ) : (
          <div className="queue-list">
            {appointments.map((appt, index) => (
              <div 
                className={`patient-card ${appt.status === "called" ? "own-appointment" : ""}`} 
                key={appt._id}
              >
                <div className="patient-info">
                  <div className="patient-header">
                    <span className="patient-name">
                      {index + 1}. {appt.patientName}
                    </span>
                    <span className={`badge-status ${appt.status}`}>
                      {appt.status === "called" ? "👉 in consultation" : "waiting"}
                    </span>
                  </div>
                  {appt.problem && (
                    <div className="patient-problem">
                      <strong>Reason for visit:</strong> {appt.problem}
                    </div>
                  )}
                  <div className="patient-time">
                    Registered: {new Date(appt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="actions-wrapper">
                  {appt.status === "waiting" && (
                    <button
                      className="btn-action btn-call-patient"
                      onClick={() => handleCall(appt._id)}
                    >
                      Call In
                    </button>
                  )}
                  {appt.status === "called" && (
                    <button
                      className="btn-action btn-complete-patient"
                      onClick={() => openPrescriptionModal(appt)}
                    >
                      Complete & Prescribe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: CONSULTATION HISTORY */}
      <div className="glass-panel">
        <div className="panel-header">
          <h3>History (Completed)</h3>
        </div>

        {completed.length === 0 ? (
          <div className="empty-queue-visual" style={{ padding: "20px 10px" }}>
            <p style={{ fontSize: "0.85rem" }}>No completed appointments yet.</p>
          </div>
        ) : (
          <div className="history-grid">
            {completed.map((appt) => (
              <div className="history-card" key={appt._id} style={{ flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>
                    {appt.patientName}
                  </strong>
                  <span className="badge-status completed" style={{ fontSize: "0.65rem" }}>Done</span>
                </div>
                {appt.problem && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Reason: {appt.problem}
                  </div>
                )}
                {appt.medicine && (
                  <div className="prescription-box" style={{ width: "100%", fontSize: "0.8rem", marginTop: "6px" }}>
                    <strong>Prescription:</strong> {appt.medicine}
                  </div>
                )}
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", alignSelf: "flex-end", marginTop: "4px" }}>
                  {new Date(appt.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REACT DIALOG PRESCRIPTION MODAL */}
      {selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Prescribe Medicine</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Patient: <strong>{selectedAppt.patientName}</strong> <br/>
              Reason for Visit: <em>{selectedAppt.problem || "Not specified"}</em>
            </p>

            <form onSubmit={handleSavePrescription}>
              <div className="form-group">
                <label htmlFor="medicine-input">Medicines & Dosage Instructions</label>
                <textarea
                  id="medicine-input"
                  className="input-control"
                  style={{ minHeight: "100px", resize: "vertical" }}
                  placeholder="e.g. Paracetamol 500mg - twice a day after meals for 3 days"
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  autoFocus
                />
              </div>

              {modalError && <div className="alert-error" style={{ marginTop: "0", marginBottom: "12px" }}>{modalError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-action btn-secondary"
                  onClick={closePrescriptionModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-action btn-complete-patient"
                >
                  Save & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
