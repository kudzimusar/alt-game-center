import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  school: string | null;
  isActive: boolean;
  notes: string | null;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ROLE_COLORS: Record<string, string> = {
  teacher: "bg-blue-500/20 text-blue-300",
  school_admin: "bg-purple-500/20 text-purple-300",
  admin: "bg-amber-500/20 text-amber-300",
};

const PLAN_COLORS: Record<string, string> = {
  starter: "text-emerald-400",
  pro: "text-blue-400",
  school: "text-purple-400",
  district: "text-amber-400",
  free: "text-slate-500",
};

function EditUserModal({ user, onClose, onSave }: { user: AdminUser; onClose: () => void; onSave: (u: AdminUser) => void }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    school: user.school || "",
    notes: user.notes || "",
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan || "",
    isActive: user.isActive,
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, any> = {
        name: form.name,
        email: form.email,
        role: form.role,
        school: form.school || undefined,
        notes: form.notes || undefined,
        subscriptionStatus: form.subscriptionStatus as "active" | "inactive",
        isActive: form.isActive,
      };
      if (form.subscriptionPlan) body.subscriptionPlan = form.subscriptionPlan;
      if (form.password) body.password = form.password;

      const res = await apiFetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onSave({ ...user, ...data.user });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Edit User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">{error}</div>}

        <div className="space-y-4">
          {[
            { label: "Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "School", key: "school", type: "text" },
            { label: "New Password (leave blank to keep)", key: "password", type: "password" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-1">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Subscription Status</label>
            <select
              value={form.subscriptionStatus}
              onChange={e => setForm(f => ({ ...f, subscriptionStatus: e.target.value }))}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="inactive">Inactive (Free)</option>
              <option value="active">Active</option>
            </select>
          </div>

          {form.subscriptionStatus === "active" && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan</label>
              <select
                value={form.subscriptionPlan}
                onChange={e => setForm(f => ({ ...f, subscriptionPlan: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="free">Free (Complimentary)</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro Teacher</option>
                <option value="school">School</option>
                <option value="district">District</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Notes (internal)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">Account active</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: (u: AdminUser) => void }) {
  const [form, setForm] = useState({
    name: "", email: "", username: "", password: "", role: "teacher", school: "", subscriptionStatus: "inactive", subscriptionPlan: "pro",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, any> = { ...form };
      if (!body.school) delete body.school;
      if (body.subscriptionStatus === "inactive") delete body.subscriptionPlan;
      const res = await apiFetch("/api/admin/users/create", { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      onCreated(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create New User</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">{error}</div>}

        <div className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Tanaka Sensei" },
            { label: "Email", key: "email", type: "email", placeholder: "teacher@school.ed.jp" },
            { label: "Username", key: "username", type: "text", placeholder: "tanaka_sensei" },
            { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
            { label: "School (optional)", key: "school", type: "text", placeholder: "Sakura JHS" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-slate-400 mb-1">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-slate-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Access</label>
            <select
              value={form.subscriptionStatus}
              onChange={e => setForm(f => ({ ...f, subscriptionStatus: e.target.value }))}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="inactive">No access (free tier)</option>
              <option value="active">Grant access immediately</option>
            </select>
          </div>

          {form.subscriptionStatus === "active" && (
            <div>
              <label className="block text-sm text-slate-400 mb-1">Plan</label>
              <select
                value={form.subscriptionPlan}
                onChange={e => setForm(f => ({ ...f, subscriptionPlan: e.target.value }))}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="free">Free (Complimentary)</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro Teacher</option>
                <option value="school">School</option>
                <option value="district">District</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create User"}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-semibold text-sm transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "super_admin") {
      setLocation("/dashboard");
      return;
    }
    loadUsers();
  }, [user, page, search, roleFilter, subFilter]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        ...(search && { search }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(subFilter !== "all" && { subscription: subFilter }),
      });
      const res = await apiFetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, subFilter]);

  async function quickAction(userId: string, action: string) {
    setActionLoading(userId + action);
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Action failed");
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function grantAccess(userId: string) {
    setActionLoading(userId + "grant");
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/grant-access`, {
        method: "POST",
        body: JSON.stringify({ plan: "pro" }),
      });
      if (!res.ok) throw new Error("Failed");
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="mb-4 text-slate-400">Admin access required.</p>
          <Link href="/dashboard"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Go to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updated) => {
            setUsers(us => us.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setEditUser(null);
          }}
        />
      )}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(newUser) => {
            setShowCreate(false);
            loadUsers();
          }}
        />
      )}

      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl">🎮</span>
              <span className="font-black text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ALT Game Center</span>
            </div>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-sm font-bold text-amber-400">Admin Console</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/analytics">
            <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">📊 Analytics</button>
          </Link>
          <Link href="/admin/newsletter">
            <button className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors">📧 Newsletter</button>
          </Link>
          <Link href="/admin">
            <button className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Dashboard</button>
          </Link>
          <Link href="/games">
            <button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">Games</button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">User Management</h1>
            <p className="text-slate-400">{pagination.total} users total</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm transition-colors"
          >
            + Create User
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 ml-4">✕</button>
          </div>
        )}

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All roles</option>
              <option value="teacher">Teacher</option>
              <option value="school_admin">School Admin</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={subFilter}
              onChange={e => { setSubFilter(e.target.value); setPage(1); }}
              className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All plans</option>
              <option value="active">Active only</option>
              <option value="inactive">Free only</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No users found matching your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-left">
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">School</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {u.name}
                          {!u.isActive && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Inactive</span>}
                        </div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[u.role] || "bg-slate-700 text-slate-300"}`}>
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{u.school || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${PLAN_COLORS[u.subscriptionPlan || ""] || "text-slate-500"}`}>
                          {u.subscriptionPlan || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold ${u.subscriptionStatus === "active" ? "text-emerald-400" : "text-slate-500"}`}>
                          {u.subscriptionStatus === "active" ? "Active" : "Free"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          {u.subscriptionStatus !== "active" ? (
                            <button
                              onClick={() => grantAccess(u.id)}
                              disabled={actionLoading === u.id + "grant"}
                              className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {actionLoading === u.id + "grant" ? "..." : "Grant"}
                            </button>
                          ) : (
                            <button
                              onClick={() => quickAction(u.id, "revoke-access")}
                              disabled={actionLoading === u.id + "revoke-access"}
                              className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              {actionLoading === u.id + "revoke-access" ? "..." : "Revoke"}
                            </button>
                          )}
                          <button
                            onClick={() => quickAction(u.id, u.isActive ? "deactivate" : "activate")}
                            disabled={actionLoading === u.id + (u.isActive ? "deactivate" : "activate")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${u.isActive ? "bg-red-600/80 hover:bg-red-600" : "bg-blue-600/80 hover:bg-blue-600"}`}
                          >
                            {u.isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-slate-400 text-sm">
                Page {pagination.page} of {pagination.pages} · {pagination.total} users
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-lg text-sm disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
