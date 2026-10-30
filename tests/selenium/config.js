export const CONFIG = {
  baseUrl: process.env.APP_URL || "http://localhost:8082",
  apiUrl: process.env.API_URL || "http://localhost:8081/api",
  facultyEmail: process.env.FACULTY_EMAIL || "faculty@pulse.com",
  facultyPassword: process.env.FACULTY_PASSWORD || "faculty123",
  adminEmail: process.env.ADMIN_EMAIL || "collegeadmin@gmail.com",
  adminPassword: process.env.ADMIN_PASSWORD || "admin@vjit",
  headless: process.env.HEADLESS !== "false",
  timeoutMs: parseInt(process.env.TEST_TIMEOUT_MS || "15000", 10),
};
