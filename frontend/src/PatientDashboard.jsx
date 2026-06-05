import { useEffect, useState } from "react";
import { 
  bookAppointment, 
  getAppointments, 
  getPatientActive, 
  getPatientHistory,
  updateAppointmentProblem
} from "./api";

export default function PatientDashboard({ user }) {
  const [problem, setProblem] = useState("");
  const [activeQueue, setActiveQueue] = useState([]);
  const [myActiveAppt, setMyActiveAppt] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Problem editing states
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [editProblemText, setEditProblemText] = useState("");
  const [editError, setEditError] = useState("");

  const loadData = async () => {
    try {
      // 1. Load active queue
      const queueRes = await getAppointments();
      if (Array.isArray(queueRes.data)) {
        setActiveQueue(queueRes.data);
      } else {
        setActiveQueue([]);
      }

      // 2. Load patient's active appointment
      const activeRes = await getPatientActive(user._id);
      setMyActiveAppt(activeRes.data || null);

      // 3. Load patient's history
      const historyRes = await getPatientHistory(user._id);
      if (Array.isArray(historyRes.data)) {
        setHistory(historyRes.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to load patient dashboard data", err);
    }
  };

  useEffect(() => {
    loadData();
    // Poll for queue changes and calling status every 8 seconds
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [user._id]);

  const book = async (e) => {
    e.preventDefault();
    try {
      await bookAppointment({
        patientId: user._id,
        patientName: user.name,
        problem: problem.trim(),
      });
      setProblem("");
      loadData();
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  const handleStartEdit = () => {
    if (myActiveAppt) {
      setEditProblemText(myActiveAppt.problem || "");
      setIsEditingProblem(true);
      setEditError("");
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!myActiveAppt) return;
    try {
      await updateAppointmentProblem(myActiveAppt._id, editProblemText.trim());
      setIsEditingProblem(false);
      loadData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update reason.");
    }
  };

  // Calculate position in queue
  let position = -1;
  let patientsAhead = 0;
  if (myActiveAppt && activeQueue.length > 0) {
    const idx = activeQueue.findIndex((a) => a._id === myActiveAppt._id);
    if (idx !== -1) {
      position = idx + 1;
      patientsAhead = idx;
    }
  }

  // Count active doctor consulting (called patients)
  const currentlySeeing = activeQueue.filter((a) => a.status === "called");

  return (
    <div className="dashboard-grid cols-3-1">
      {/* LEFT COLUMN: APPOINTMENT STATUS & BOOKING */}
      <div>
        {/* Called Notification Banner */}
        {myActiveAppt && myActiveAppt.status === "called" && (
          <div className="called-notice">
            <h3>📢 It's Your Turn!</h3>
            <p>Dr. {user.name.split(" ")[0]} is ready to see you. Please walk into the consulting cabin now.</p>
          </div>
        )}

        {/* Current Appointment Panel */}
        <div className="glass-panel" style={{ marginBottom: "24px" }}>
          <div className="panel-header">
            <h2>Your Appointment Status</h2>
          </div>

          {myActiveAppt ? (
            <div>
              <div 
                className="patient-card own-appointment" 
                style={{ flexDirection: "column", alignItems: "flex-start", gap: "12px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <div>
                    <span className="patient-name">{myActiveAppt.patientName}</span>{" "}
                    <span className="badge-owner">You</span>
                  </div>
                  <span className={`badge-status ${myActiveAppt.status}`}>
                    {myActiveAppt.status === "called" ? "Consulting..." : "Waiting in line"}
                  </span>
                </div>

                {/* Queue Stats for user */}
                {position !== -1 && (
                  <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <div className="info-row">
                      <span>Queue Position:</span>
                      <span>#{position}</span>
                    </div>
                    <div className="info-row">
                      <span>Patients Ahead of You:</span>
                      <span>{patientsAhead} {patientsAhead === 1 ? "person" : "people"}</span>
                    </div>
                    <div className="info-row">
                      <span>Estimated Wait Time:</span>
                      <span>~ {patientsAhead * 10} mins</span>
                    </div>
                  </div>
                )}

                {/* Problem details */}
                <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  {isEditingProblem ? (
                    <form onSubmit={handleSaveEdit} style={{ width: "100%" }}>
                      <div className="form-group">
                        <label>Edit Reason for Visit</label>
                        <input
                          type="text"
                          className="input-control"
                          value={editProblemText}
                          onChange={(e) => setEditProblemText(e.target.value)}
                        />
                      </div>
                      {editError && <div className="alert-error" style={{ margin: "6px 0" }}>{editError}</div>}
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          type="button" 
                          className="btn-action btn-secondary" 
                          onClick={() => setIsEditingProblem(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-action btn-complete-patient">
                          Save
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="patient-problem">
                        <strong>Reason for visit:</strong> {myActiveAppt.problem || "No details provided"}
                      </div>
                      {myActiveAppt.status === "waiting" && (
                        <button 
                          className="btn-logout" 
                          onClick={handleStartEdit}
                          style={{ marginTop: "8px", padding: "4px 8px", fontSize: "0.8rem" }}
                        >
                          ✏️ Edit Reason
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <div className="book-box">
              <h4>📋 Book a New Appointment</h4>
              <form onSubmit={book} className="book-form">
                <div className="form-group">
                  <label htmlFor="problem-desc">Describe your symptoms / reason for visit</label>
                  <input
                    id="problem-desc"
                    placeholder="e.g. Fever, persistent cough, regular checkup..."
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    className="input-control"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: "0" }}>
                  Join Clinic Queue
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Global Clinic Queue Status Panel */}
        <div className="glass-panel">
          <div className="panel-header">
            <h3>Live Clinic Queue List</h3>
          </div>

          <div className="stats-row" style={{ marginBottom: "16px" }}>
            <div className="stat-box">
              <div className="stat-value">{activeQueue.length}</div>
              <div className="stat-label">Total Active</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{currentlySeeing.length}</div>
              <div className="stat-label">In Cabin</div>
            </div>
          </div>

          {activeQueue.length === 0 ? (
            <div className="empty-queue-visual" style={{ padding: "20px" }}>
              <p>No patients currently in queue.</p>
            </div>
          ) : (
            <div className="queue-list">
              {activeQueue.map((appt) => {
                const isMe = appt.patientId === user._id;
                return (
                  <div 
                    className={`patient-card ${isMe ? "own-appointment" : ""}`} 
                    key={appt._id}
                    style={{ padding: "12px 16px" }}
                  >
                    <div>
                      <strong style={{ color: isMe ? "var(--primary)" : "var(--text-main)", fontSize: "0.95rem" }}>
                        {appt.patientName} {isMe && "(You)"}
                      </strong>
                      <div className="patient-problem" style={{ fontSize: "0.8rem" }}>
                        {appt.problem}
                      </div>
                    </div>
                    <span className={`badge-status ${appt.status}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                      {appt.status === "called" ? "Consulting" : "Waiting"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: PRESCRIPTION HISTORY */}
      <div className="glass-panel">
        <div className="panel-header">
          <h3>Your Prescriptions & History</h3>
        </div>

        {history.length === 0 ? (
          <div className="empty-queue-visual" style={{ padding: "20px 10px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📋</div>
            <p style={{ fontSize: "0.85rem" }}>No past prescriptions found.</p>
          </div>
        ) : (
          <div className="history-grid">
            {history.map((appt) => (
              <div className="history-card" key={appt._id} style={{ flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                    Completed: {new Date(appt.updatedAt).toLocaleDateString()}
                  </span>
                  <span className="badge-status completed" style={{ fontSize: "0.65rem" }}>Completed</span>
                </div>
                {appt.problem && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    <strong>Visit Reason:</strong> {appt.problem}
                  </div>
                )}
                {appt.medicine && (
                  <div className="prescription-box" style={{ width: "100%", marginTop: "4px" }}>
                    <strong>💊 Prescribed Medicine:</strong>
                    <div style={{ marginTop: "4px", whiteSpace: "pre-line", lineHeight: "1.4" }}>
                      {appt.medicine}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}