const API_BASE = import.meta.env.DEV ? "http://localhost:8080/api" : "https://attendance-dhvi.onrender.com/api";

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
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error((data && data.error) || data.message || res.statusText);
  return data;
}

async function fetchBlob(path: string): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed: " + res.statusText);
  return res.blob();
}

export const api = {
  // Auth
  login: (data: any) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => fetchApi("/auth/me", { method: "GET" }),
  changePassword: (data: any) => fetchApi("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),

  // Admin
  getAdminDashboard: () => fetchApi("/admin/dashboard", { method: "GET" }),
  addFaculty: (data: any) => fetchApi("/admin/faculty", { method: "POST", body: JSON.stringify(data) }),
  getAllFaculty: () => fetchApi("/admin/faculty", { method: "GET" }),
  updateFaculty: (id: string, data: any) => fetchApi(`/admin/faculty/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFaculty: (id: string) => fetchApi(`/admin/faculty/${id}`, { method: "DELETE" }),
  getAllStudentsAdmin: () => fetchApi("/admin/students", { method: "GET" }),
  resetStudentDevice: (id: string) => fetchApi(`/admin/students/${id}/reset-device`, { method: "POST" }),

  // Admin — Batch Module
  getAllBatches: () => fetchApi("/admin/batch", { method: "GET" }),
  getBatch: (id: string) => fetchApi(`/admin/batch/${id}`, { method: "GET" }),
  createBatch: (formData: FormData) => fetchApi("/admin/batch", { method: "POST", body: formData }),
  getBatchStudents: (id: string) => fetchApi(`/admin/batch/${id}/students`, { method: "GET" }),
  getAdminBatchAttendance: (id: string) => fetchApi(`/admin/batch/${id}/attendance`, { method: "GET" }),
  downloadAttendanceReport: (id: string) => fetchBlob(`/admin/batch/${id}/report/download`),
  downloadBatchTemplate: () => fetchBlob("/admin/batch/template"),
  deleteBatch: (id: string) => fetchApi(`/admin/batch/${id}`, { method: "DELETE" }),

  // Faculty
  getFacultyProfile: () => fetchApi("/faculty/profile", { method: "GET" }),
  updateFacultyProfile: (data: any) => fetchApi("/faculty/profile", { method: "PUT", body: JSON.stringify(data) }),
  getFacultyDashboard: () => fetchApi("/faculty/dashboard", { method: "GET" }),
  getFacultyReports: () => fetchApi("/faculty/reports", { method: "GET" }),

  // Faculty — Batch Module
  getFacultyBatches: () => fetchApi("/faculty/batches", { method: "GET" }),
  getFacultyBatch: (id: string) => fetchApi(`/faculty/batches/${id}`, { method: "GET" }),
  getFacultyBatchStudents: (id: string) => fetchApi(`/faculty/batches/${id}/students`, { method: "GET" }),
  getFacultyBatchAttendance: (id: string) => fetchApi(`/faculty/batches/${id}/attendance`, { method: "GET" }),
  markAttendance: (batchId: string, data: any) => fetchApi(`/faculty/batches/${batchId}/attendance`, { method: "PUT", body: JSON.stringify(data) }),
  bulkMarkAttendance: (batchId: string, data: any) => fetchApi(`/faculty/batches/${batchId}/attendance/bulk`, { method: "PUT", body: JSON.stringify(data) }),
  downloadFacultyBatchReport: (id: string) => fetchBlob(`/faculty/batches/${id}/report/download`),

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
  markQrAttendance: (id: string, data: any) => fetchApi(`/sessions/${id}/attendance`, { method: "POST", body: JSON.stringify(data) }),
  refreshQr: (id: string) => fetchApi(`/sessions/${id}/qr/refresh`, { method: "POST" }),
};
