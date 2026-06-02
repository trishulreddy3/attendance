# API Inventory

This document outlines all REST endpoints available in the Pulse Attendance System backend, which is now powered by **MongoDB Atlas** and **Spring Boot**.

All API routes prefix with `/api`.

## 1. Authentication
* **POST** `/api/auth/register/faculty`
  * **Description**: Register a new faculty member.
  * **Body**: `CreateFacultyReq` (name, email, password, mobile, branch)
* **POST** `/api/auth/login`
  * **Description**: Authenticate a faculty or student and obtain a JWT.
  * **Body**: `LoginReq` (email, password, role)
* **POST** `/api/auth/refresh-token`
  * **Description**: Obtain a new JWT using a refresh token.
  * **Body**: `RefreshTokenReq`
* **GET** `/api/auth/me`
  * **Description**: Fetch profile of currently authenticated user.
* **PUT** `/api/auth/change-password`
  * **Description**: Change the password of the authenticated user.
  * **Body**: `ChangePasswordReq`

---

## 2. Faculty Management
* **GET** `/api/faculty/profile`
  * **Description**: Get profile details for authenticated faculty.
* **PUT** `/api/faculty/profile`
  * **Description**: Update profile details.
  * **Body**: `UpdateFacultyReq`
* **GET** `/api/faculty/dashboard`
  * **Description**: Fetch statistical dashboard data for faculty.

---

## 3. Student Management
* **POST** `/api/students`
  * **Description**: Faculty creates a new student profile.
  * **Body**: `CreateStudentReq`
* **GET** `/api/students`
  * **Description**: Get all students (optionally paginated/searched).
  * **Params**: `q` (search query), `branch`
* **GET** `/api/students/{id}`
  * **Description**: Get details of a specific student.
* **PUT** `/api/students/{id}`
  * **Description**: Update a student's profile.
  * **Body**: `UpdateStudentReq`
* **DELETE** `/api/students/{id}`
  * **Description**: Delete a student (Faculty only).
* **GET** `/api/students/search`
  * **Description**: Search for students by ID or name.
  * **Params**: `q`, `branch`
* **GET** `/api/students/branch/{branch}`
  * **Description**: Fetch all students belonging to a specific branch.
* **GET** `/api/students/{id}/attendance`
  * **Description**: Get historical attendance records for a student.
* **GET** `/api/students/{id}/statistics`
  * **Description**: Fetch attendance statistics/dashboard data for a student.

---

## 4. Session Management
* **POST** `/api/sessions`
  * **Description**: Faculty schedules/creates a new attendance session.
  * **Body**: `CreateSessionReq`
* **GET** `/api/sessions`
  * **Description**: Fetch all sessions.
* **GET** `/api/sessions/{id}`
  * **Description**: Fetch details for a specific session (including attendees).
* **PUT** `/api/sessions/{id}`
  * **Description**: Update session details.
  * **Body**: `UpdateSessionReq`
* **DELETE** `/api/sessions/{id}`
  * **Description**: Delete an attendance session.
* **POST** `/api/sessions/{id}/start`
  * **Description**: Open an attendance session for marking.
* **POST** `/api/sessions/{id}/end`
  * **Description**: Close an attendance session.
* **GET** `/api/sessions/active`
  * **Description**: Fetch currently active sessions (filtered by optional branch).
* **GET** `/api/sessions/history`
  * **Description**: Fetch past sessions.
* **POST** `/api/sessions/{id}/qr/refresh`
  * **Description**: Generate a new QR token for a session (invalidates previous token).

---

## 5. Attendance Management
* **POST** `/api/attendance/mark`
  * **Description**: Student scans QR code to mark attendance. Distance validated via Haversine GPS formula (<= 30 meters default).
  * **Body**: `MarkAttendanceReq` (sessionId, qrToken, latitude, longitude)
* **GET** `/api/attendance/session/{sessionId}`
  * **Description**: Fetch all attendance records for a specific session.
* **DELETE** `/api/attendance/{id}`
  * **Description**: Faculty manually removes an attendance record.

---

## 6. WebSocket Endpoints (STOMP)
* **Endpoint**: `/ws` (SockJS + STOMP)
* **Topics**:
  * `/topic/session/{sessionId}/attendance` -> Broadcasts when a student successfully marks attendance.
  * `/topic/session/{sessionId}/qr` -> Broadcasts when a session's QR token is refreshed by the faculty.
