import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { Client } from "@stomp/stompjs";
import { api, setToken, getToken } from "./api";

export type Branch = "AIML" | "CSE" | "AI" | "AIDS" | "IT" | "MECH" | "CIVIL";
export const BRANCHES: Branch[] = ["AIML", "CSE", "AI", "AIDS", "IT", "MECH", "CIVIL"];

export interface Faculty {
  id: string;
  name: string;
  mobile: string;
  email: string;
  branch: Branch;
  password?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  mobile: string;
  email: string;
  branch: Branch;
  password?: string;
  createdBy: string;
}

export type SessionType = "single" | "multiple" | "half" | "full";

export interface Session {
  id: string;
  name: string;
  subject: string;
  branch: Branch;
  startTime: string; // ISO
  endTime: string;
  type: SessionType;
  facultyId: string;
  attendees: { studentId: string; at: string }[];
  qrToken: string;
}

interface AuthUser {
  kind: "faculty" | "student";
  id: string;
}

interface AppState {
  faculties: Faculty[];
  students: Student[];
  sessions: Session[];
  user: AuthUser | null;
  loading: boolean;
}

interface Ctx extends AppState {
  signupFaculty: (f: any) => Promise<{ ok: boolean; error?: string }>;
  loginFaculty: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginStudent: (studentId: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addStudent: (s: any) => Promise<{ ok: boolean; error?: string }>;
  updateStudent: (id: string, s: any) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  createSession: (s: any) => Promise<Session>;
  refreshQr: (sessionId: string) => Promise<void>;
  markAttendance: (sessionId: string, studentId: string, lat?: number, lng?: number) => Promise<{ ok: boolean; error?: string }>;
  currentFaculty: () => Faculty | null;
  currentStudent: () => Student | null;
  updateFaculty: (id: string, p: any) => Promise<void>;
  updateSelfStudent: (p: any) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({ faculties: [], students: [], sessions: [], user: null, loading: true });

  const update = (patch: Partial<AppState> | ((s: AppState) => AppState)) =>
    setState((s) => (typeof patch === "function" ? patch(s) : { ...s, ...patch }));

  const stompClient = useRef<Client | null>(null);

  const setupWebSockets = (sessions: Session[]) => {
    if (stompClient.current) {
      stompClient.current.deactivate();
    }

    const client = new Client({
      brokerURL: window.location.hostname === "localhost" ? "ws://localhost:8080/ws" : "wss://attendance-dhvi.onrender.com/ws",
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        sessions.forEach((s) => {
          client.subscribe(`/topic/session/${s.id}/attendance`, (msg) => {
            const dto = JSON.parse(msg.body);
            update((cur) => ({
              ...cur,
              sessions: cur.sessions.map((x) =>
                x.id === s.id
                  ? { ...x, attendees: [...x.attendees.filter(a => a.studentId !== dto.studentId), { studentId: dto.studentId, at: dto.at }] }
                  : x
              ),
            }));
          });
          
          client.subscribe(`/topic/session/${s.id}/qr`, (msg) => {
            const newToken = msg.body;
            update((cur) => ({
              ...cur,
              sessions: cur.sessions.map((x) =>
                x.id === s.id ? { ...x, qrToken: newToken } : x
              ),
            }));
          });
        });
      },
    });

    client.activate();
    stompClient.current = client;
  };

  const refreshData = async () => {
    try {
      if (!getToken()) {
        update({ loading: false });
        if (stompClient.current) stompClient.current.deactivate();
        return;
      }
      const me = await api.getMe();
      const kind = me.studentId ? "student" : "faculty";
      update({ user: { kind, id: me.id } });

      if (kind === "faculty") {
        update({ faculties: [me] });
        const [students, sessions] = await Promise.all([
          api.getAllStudents(),
          api.getFacultySessions()
        ]);
        update({ students, sessions });
        setupWebSockets(sessions.filter((s: any) => new Date(s.endTime).getTime() >= Date.now()));
      } else {
        update({ students: [me] });
        const data = await api.getActiveSessions(me.branch);
        update({ sessions: data });
        setupWebSockets(data);
      }
    } catch (e) {
      console.error(e);
      setToken(null);
      update({ user: null });
      if (stompClient.current) stompClient.current.deactivate();
    } finally {
      update({ loading: false });
    }
  };

  useEffect(() => {
    refreshData();
    return () => {
      if (stompClient.current) stompClient.current.deactivate();
    };
  }, []);

  const ctx: Ctx = {
    ...state,
    refreshData,
    signupFaculty: async (f) => {
      try {
        const res = await api.registerFaculty(f);
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    loginFaculty: async (email, password) => {
      try {
        const res = await api.login({ username: email, password, kind: "faculty" });
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    loginStudent: async (studentId, password) => {
      try {
        const res = await api.login({ username: studentId, password, kind: "student" });
        setToken(res.token);
        await refreshData();
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    logout: () => {
      setToken(null);
      update({ user: null, faculties: [], students: [], sessions: [] });
    },
    addStudent: async (s) => {
      try {
        const ns = await api.createStudent(s);
        update((cur) => ({ ...cur, students: [...cur.students, ns] }));
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    updateStudent: async (id, p) => {
      const ns = await api.updateStudent(id, p);
      update((cur) => ({ ...cur, students: cur.students.map((x) => (x.id === id ? ns : x)) }));
    },
    deleteStudent: async (id) => {
      await api.deleteStudent(id);
      update((cur) => ({ ...cur, students: cur.students.filter((x) => x.id !== id) }));
    },
    createSession: async (s) => {
      const ns = await api.createSession(s);
      await refreshData();
      return ns;
    },
    refreshQr: async (sessionId) => {
      const res = await api.refreshQr(sessionId);
      update((cur) => ({
        ...cur,
        sessions: cur.sessions.map((x) => (x.id === sessionId ? { ...x, qrToken: res.qrToken } : x)),
      }));
    },
    markAttendance: async (sessionId, studentId, qrToken, lat, lng) => {
      try {
        await api.markAttendance(sessionId, { sessionId, qrToken, latitude: lat, longitude: lng });
        // The websocket should theoretically push this, but let's eagerly update
        update((cur) => ({
          ...cur,
          sessions: cur.sessions.map((x) =>
            x.id === sessionId
              ? { ...x, attendees: [...x.attendees, { studentId, at: new Date().toISOString() }] }
              : x
          ),
        }));
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message };
      }
    },
    currentFaculty: () => state.user?.kind === "faculty" ? state.faculties.find((f) => f.id === state.user!.id) ?? null : null,
    currentStudent: () => state.user?.kind === "student" ? state.students.find((f) => f.id === state.user!.id) ?? null : null,
    updateFaculty: async (id, p) => {
      const nf = await api.updateFacultyProfile(p);
      update((cur) => ({ ...cur, faculties: cur.faculties.map((x) => (x.id === id ? nf : x)) }));
    },
    updateSelfStudent: async (p) => {
      // Students can't update themselves via this API currently, but if they could:
      // const ns = await api.updateStudent(state.user!.id, p);
      // update((cur) => ({ ...cur, students: cur.students.map((x) => (x.id === state.user!.id ? ns : x)) }));
    },
  };

  return <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
