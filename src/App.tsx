import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api";
import type { User } from "./types";
import Login from "./pages/Login";
import Shell from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import Updates from "./pages/Updates";
import Participant from "./pages/Participant";
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((x) => setUser(x.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="loader">
        <span />
      </div>
    );
  if (!user)
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={setUser} />} />
      </Routes>
    );
  return (
    <Shell user={user} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/teorico" element={<Dashboard mode="teorico" />} />
        <Route path="/pratico" element={<Dashboard mode="pratico" />} />
        <Route path="/gap" element={<Dashboard mode="gap" />} />
        <Route path="/participante/:candidateKey" element={<Participant />} />
        <Route
          path="/atualizacoes"
          element={user.role === "admin" ? <Updates /> : <Navigate to="/gap" />}
        />
        <Route path="*" element={<Navigate to="/gap" />} />
      </Routes>
    </Shell>
  );
}
