const API_BASE = "http://localhost:8080/api";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sas.jwt");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("sas.jwt", token);
  else localStorage.removeItem("sas.jwt");
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error((data && data.error) || data.message || res.statusText);
  }

  return data;
}

export const api = {
  // Auth
  registerFaculty: (data: any) => fetchApi("/auth/register/faculty", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchApi("/auth/me", { method: "GET" }),
  changePassword: (data: any) => fetchApi("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),

  // Faculty
  getFacultyProfile: () => fetchApi("/faculty/profile", { method: "GET" }),
  updateFacultyProfile: (data: any) => fetchApi("/faculty/profile", { method: "PUT", body: JSON.stringify(data) }),
  getFacultyDashboard: () => fetchApi("/faculty/dashboard", { method: "GET" }),
  getFacultyReports: () => fetchApi("/faculty/reports", { method: "GET" }),

  // Students
  createStudent: (data: any) => fetchApi("/students", { method: "POST", body: JSON.stringify(data) }),
  getAllStudents: () => fetchApi("/students", { method: "GET" }),
  getStudent: (id: string) => fetchApi(`/students/${id}`, { method: "GET" }),
  updateStudent: (id: string, data: any) => fetchApi(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id: string) => fetchApi(`/students/${id}`, { method: "DELETE" }),
  searchStudents: (q: string, branch: string) => fetchApi(`/students/search?q=${q}&branch=${branch}`, { method: "GET" }),
  getStudentsByBranch: (branch: string) => fetchApi(`/students/branch/${branch}`, { method: "GET" }),
  getStudentAttendance: (id: string) => fetchApi(`/students/${id}/attendance`, { method: "GET" }),
  getStudentDashboard: (id: string) => fetchApi(`/students/${id}/statistics`, { method: "GET" }),

  // Sessions
  createSession: (data: any) => fetchApi("/sessions", { method: "POST", body: JSON.stringify(data) }),
  getFacultySessions: () => fetchApi("/sessions", { method: "GET" }),
  getSession: (id: string) => fetchApi(`/sessions/${id}`, { method: "GET" }),
  updateSession: (id: string, data: any) => fetchApi(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSession: (id: string) => fetchApi(`/sessions/${id}`, { method: "DELETE" }),
  startSession: (id: string) => fetchApi(`/sessions/${id}/start`, { method: "POST" }),
  endSession: (id: string) => fetchApi(`/sessions/${id}/end`, { method: "POST" }),
  getActiveSessions: (branch: string) => fetchApi(`/sessions/active/${branch}`, { method: "GET" }),
  getSessionAttendance: (id: string) => fetchApi(`/sessions/${id}/attendance`, { method: "GET" }),
  markAttendance: (id: string, data: any) => fetchApi(`/sessions/${id}/attendance`, { method: "POST", body: JSON.stringify(data) }),
  refreshQr: (id: string) => fetchApi(`/sessions/${id}/qr/refresh`, { method: "POST" }),
};
