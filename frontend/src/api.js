import axios from "axios";

// Fallback to localhost:5000 if env variable is not present
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const bookAppointment = (data) =>
  API.post("/appointments/book", data);

export const getAppointments = () =>
  API.get("/appointments");

export const getCompletedAppointments = () =>
  API.get("/appointments/completed");

export const getPatientActive = (patientId) =>

  API.get(`/appointments/patient/${patientId}`);

export const getPatientHistory = (patientId) =>
  API.get(`/appointments/patient/${patientId}/history`);

export const updateAppointmentProblem = (id, problem) =>
  API.put(`/appointments/update/${id}`, { problem });

export const callPatient = (id) =>
  API.put(`/appointments/call/${id}`);

export const addMedicine = (id, medicine) =>
  API.put(`/appointments/medicine/${id}`, { medicine });

export default API;