import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const bookAppointment = (data) =>
  API.post("/appointments/book", data);

export const getAppointments = () =>
  API.get("/appointments");

export const callPatient = (id) =>
  API.put(`/appointments/call/${id}`);

export const addMedicine = (id, medicine) =>
  API.put(`/appointments/medicine/${id}`, { medicine });

export default API;

