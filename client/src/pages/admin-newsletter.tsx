import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { usePageAnalytics } from "@/hooks/useAnalytics";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string;
  tags: string | null;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

interface Campaign {
  id: string;
  subject: string;
  previewText: string | null;
  htmlContent: string;
  status: string;
  recipientCount: number | null;
  createdAt: string;
  sentAt: string | null;
}

export default function AdminNewsletter() {
  usePageAnalytics("/admin/newsletter");
  const { user } = useAuth();
  const [tab, setTab] = useState<"subscribers" | "campaigns" | "compose" | "weekly">("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [campsLoading, setCampsLoading] = useState(true);
  const [weeklyRunning, setWeeklyRunning] = useState(false);
  const [weeklyResult, setWeeklyResult] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [unsubCount, setUnsubCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addTags, setAddTags] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState(user?.email || "");
  const [composeSaving, setComposeSaving] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const flash = (msg: string, type: "ok" | "err") => {
    if (type === "ok") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const loadSubscribers = useCallback(async () => {
    setSubsLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, limit: "200" });
      if (search) params.set("search", search);
      const res = await apiFetch(`/api/newsletter/subscribers?${params}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSubscribers(d.subscribers);
      setActiveCount(d.activeCount);
      setUnsubCount(d.unsubscribedCount);
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setSubsLoading(false);
    }
  }, [statusFilter, search]);

  const loadCampaigns = useCallback(async () => {
    setCampsLoading(true);
    try {
      const res = await apiFetch("/api/newsletter/campaigns");
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCampaigns(d.campaigns);
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setCampsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") {
      loadSubscribers();
      loadCampaigns();
    }
  }, [user, loadSubscribers, loadCampaigns]);

  useEffect(() => {
    loadSubscribers();
  }, [statusFilter, search, loadSubscribers]);

  async function addSubscriber() {
    if (!addEmail) return;
    setAddSaving(true);
    try {
      const res = await apiFetch("/api/newsletter/subscribers", {
        method: "POST",
        body: JSON.stringify({ email: addEmail, name: addName, tags: addTags }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      flash(`${addEmail} added to newsletter`, "ok");
      setAddEmail("");
      setAddName("");
      setAddTags("");
      loadSubscribers();
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setAddSaving(false);
    }
  }

  async function updateSubscriberStatus(id: string, status: string) {
    try {
      const res = await apiFetch(`/api/newsletter/subscribers/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      loadSubscribers();
    } catch (e: any) {
      flash(e.message, "err");
    }
  }

  async function deleteSubscriber(id: string, email: string) {
    if (!confirm(`Remove ${email} from newsletter?`)) return;
    try {
      const res = await apiFetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      flash("Subscriber removed", "ok");
      loadSubscribers();
    } catch (e: any) {
      flash(e.message, "err");
    }
  }

  async function importUsers() {
    setImporting(true);
    try {
      const res = await apiFetch("/api/newsletter/subscribers/import-users", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      flash(`Imported ${d.added} users (${d.skipped} already subscribed)`, "ok");
      loadSubscribers();
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setImporting(false);
    }
  }

  async function saveCampaign() {
    if (!subject || !body) {
      flash("Subject and body are required", "err");
      return;
    }
    setComposeSaving(true);
    try {
      const endpoint = editingCampaignId ? `/api/newsletter/campaigns/${editingCampaignId}` : "/api/newsletter/campaigns";
      const method = editingCampaignId ? "PATCH" : "POST";
      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify({ subject, previewText: preview, htmlContent: body }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      flash(editingCampaignId ? "Campaign updated" : "Campaign saved as draft", "ok");
      setEditingCampaignId(d.campaign.id);
      loadCampaigns();
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setComposeSaving(false);
    }
  }

  async function sendTest() {
    if (!testEmail || !editingCampaignId) {
      flash("Save campaign first, then enter a test email", "err");
      return;
    }
    try {
      const res = await apiFetch(`/api/newsletter/campaigns/${editingCampaignId}/test`, {
        method: "POST",
        body: JSON.stringify({ testEmail }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Test send failed");
      flash(d.ok ? `Test email sent to ${testEmail}` : "Test send failed", d.ok ? "ok" : "err");
    } catch (e: any) {
      flash(e.message, "err");
    }
  }

  async function sendCampaign(id: string) {
    if (!confirm(`Send this campaign to all ${activeCount} active subscribers? This cannot be undone.`)) return;
    setSending(id);
    try {
      const res = await apiFetch(`/api/newsletter/campaigns/${id}/send`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      flash(`Sent to ${d.sent} subscribers (${d.failed} failed)`, "ok");
      loadCampaigns();
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setSending(null);
    }
  }

  async function runWeekly() {
    setWeeklyRunning(true);
    try {
      const res = await apiFetch("/api/newsletter/weekly/run", { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setWeeklyResult(`Weekly newsletter sent: ${d.sent || 0} sent, ${d.failed || 0} failed`);
      flash("Weekly newsletter sent", "ok");
      loadCampaigns();
    } catch (e: any) {
      flash(e.message, "err");
    } finally {
      setWeeklyRunning(false);
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Admin access required.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4"><span className="text-xl">🎮</span><span className="font-black text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ALT Game Center</span><span className="text-slate-600">|</span><span className="text-sm font-bold text-emerald-400">Newsletter</span></div>
        <div className="flex items-center gap-2">
          <Link href="/admin/analytics"><button className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">📊 Analytics</button></Link>
          <Link href="/admin/users"><button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Users</button></Link>
          <Link href="/admin"><button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Overview</button></Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Newsletter & Email</h1>
            <p className="text-slate-400">Manage subscribers, compose campaigns, and run weekly Kimi newsletters</p>
          </div>
          <button onClick={runWeekly} disabled={weeklyRunning} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 rounded-xl font-bold transition-colors">
            {weeklyRunning ? "Running..." : "Run Weekly Newsletter"}
          </button>
        </div>

        {weeklyResult && <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-300">{weeklyResult}</div>}
        {success && <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-4 mb-6 text-emerald-300">{success}</div>}
        {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5"><div className="text-3xl font-black text-emerald-400">{activeCount.toLocaleString()}</div><div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mt-1">Active Subscribers</div></div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5"><div className="text-3xl font-black text-red-400">{unsubCount.toLocaleString()}</div><div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mt-1">Unsubscribed</div></div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5"><div className="text-3xl font-black text-blue-400">{campaigns.filter(c => c.status === "sent").length}</div><div className="text-slate-400 text-xs font-semibold uppercase tracking-wide mt-1">Campaigns Sent</div></div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ key: "subscribers", label: "👥 Subscribers" }, { key: "campaigns", label: "📧 Campaigns" }, { key: "compose", label: editingCampaignId ? "✏️ Edit Campaign" : "✍️ Compose" }, { key: "weekly", label: "🤖 Weekly AI" }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key as any)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === key ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/15 text-slate-300"}`}>{label}</button>
          ))}
        </div>

        {tab === "weekly" && <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-slate-300">Use the button above to run the weekly Kimi newsletter now. For automatic sending, add a cron job to POST <code>/api/newsletter/weekly/run</code> once a week.</div>}

        {tab === "subscribers" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 grid gap-3 md:grid-cols-4">
              <input className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" placeholder="Email" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
              <input className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" placeholder="Name" value={addName} onChange={e => setAddName(e.target.value)} />
              <input className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" placeholder="Tags" value={addTags} onChange={e => setAddTags(e.target.value)} />
              <button onClick={addSubscriber} disabled={addSaving} className="bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold px-4 py-2">{addSaving ? "Adding..." : "Add Subscriber"}</button>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 flex gap-3 flex-wrap items-center">
              <input className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
              <button onClick={importUsers} disabled={importing} className="bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold px-4 py-2">{importing ? "Importing..." : "Import Users"}</button>
            </div>
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
              {subsLoading ? <div className="p-6 text-slate-400">Loading subscribers...</div> : subscribers.map(sub => (
                <div key={sub.id} className="border-t border-white/5 first:border-t-0 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{sub.email}</div>
                    <div className="text-sm text-slate-400">{sub.name || "No name"} · {sub.source} · {sub.status}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => updateSubscriberStatus(sub.id, sub.status === "active" ? "unsubscribed" : "active")} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Toggle</button>
                    <button onClick={() => deleteSubscriber(sub.id, sub.email)} className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "campaigns" && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            {campsLoading ? <div className="p-6 text-slate-400">Loading campaigns...</div> : campaigns.map(c => (
              <div key={c.id} className="border-t border-white/5 first:border-t-0 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-semibold">{c.subject}</div>
                  <div className="text-sm text-slate-400">{c.status} · {c.recipientCount || 0} sent</div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setEditingCampaignId(c.id); setSubject(c.subject); setPreview(c.previewText || ""); setBody(c.htmlContent); setTab("compose"); }} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">Edit</button>
                  <button onClick={() => sendCampaign(c.id)} disabled={sending === c.id} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm">{sending === c.id ? "Sending..." : "Send"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "compose" && (
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
            <input className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="Preview text" value={preview} onChange={e => setPreview(e.target.value)} />
            <textarea className="w-full min-h-[260px] bg-slate-950 border border-white/10 rounded-xl px-4 py-3" placeholder="HTML body" value={body} onChange={e => setBody(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <button onClick={saveCampaign} disabled={composeSaving} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold">{composeSaving ? "Saving..." : "Save Draft"}</button>
              <input className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2" placeholder="Test email" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
              <button onClick={sendTest} className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold">Send Test</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
