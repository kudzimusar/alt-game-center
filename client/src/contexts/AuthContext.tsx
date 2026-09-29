import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getToken, getStoredUser, setToken, setStoredUser, removeToken, apiFetch } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  school?: string;
  subscriptionStatus: string;
  subscriptionPlan?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isSubscribed: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
  role: "teacher" | "school_admin";
  school?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(!!getToken() && !getStoredUser());

  useEffect(() => {
    if (getToken() && !getStoredUser()) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  async function refreshUser() {
    try {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const { user } = await res.json();
        setUser(user);
        setStoredUser(user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    let data: any = {};
    try { data = await res.json(); } catch { /* empty body */ }
    if (!res.ok) throw new Error(data.error || "Login failed. Please try again.");
    setToken(data.token);
    setStoredUser(data.user);
    setTokenState(data.token);
    setUser(data.user);
  }

  async function register(formData: RegisterData) {
    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });
    let data: any = {};
    try { data = await res.json(); } catch { /* empty body */ }
    if (!res.ok) throw new Error(data.error || "Registration failed");
    setToken(data.token);
    setStoredUser(data.user);
    setTokenState(data.token);
    setUser(data.user);
  }

  function logout() {
    removeToken();
    setUser(null);
    setTokenState(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isSubscribed: user?.subscriptionStatus === "active",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
