"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Users, Plus, School, LogOut, Loader2 } from "lucide-react";

type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
};

export default function OwnerAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  async function loadAdmins() {
    setLoading(true);
    const response = await fetch("/api/owner/admins", { cache: "no-store" });
    if (response.status === 403) {
      router.replace("/auth-redirect");
      return;
    }
    const data = await response.json();
    setAdmins(data.admins ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAdmins();
    fetch("/api/owner/dashboard", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.school?.name && setSchoolName(d.school.name))
      .catch(() => {});
  }, []);

  async function addAdmin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/owner/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create admin.");

      setSuccess(`Admin account created for ${data.admin.name}.`);
      setForm({ name: "", email: "", phone: "", password: "" });
      await loadAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-indigo-600 p-3 text-white"><School /></span>
            <div>
              <h1 className="text-xl font-extrabold">Presently</h1>
              <p className="text-sm text-slate-500">College Owner Portal</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div>
          <p className="text-sm font-semibold text-indigo-600">OWNER DASHBOARD</p>
          <h2 className="mt-2 text-3xl font-extrabold">Manage your institution</h2>
          <p className="mt-2 text-slate-500">{schoolName || "Your registered institution"}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Plus /></div>
              <div>
                <h3 className="text-lg font-bold">Add Admin</h3>
                <p className="text-sm text-slate-500">Create an admin account for this institution.</p>
              </div>
            </div>

            <form onSubmit={addAdmin} className="space-y-4">
              <input required placeholder="Admin full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
              <input required type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
              <input placeholder="Phone number (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />
              <input required type="password" minLength={8} placeholder="Temporary password (minimum 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500" />

              {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{success}</p>}

              <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {saving ? "Creating..." : "Create Admin Account"}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><Users /></div>
                <div>
                  <h3 className="text-lg font-bold">Institution Admins</h3>
                  <p className="text-sm text-slate-500">Accounts registered in your college</p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{admins.length}</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500">Loading admins...</div>
            ) : admins.length === 0 ? (
              <div className="rounded-xl border border-dashed py-12 text-center">
                <Users className="mx-auto text-slate-300" size={34} />
                <p className="mt-3 font-semibold">No admins added yet</p>
                <p className="mt-1 text-sm text-slate-500">Create the first admin using the form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">{admin.name}</p>
                        <p className="text-sm text-slate-500">{admin.email}</p>
                        {admin.phone && <p className="text-xs text-slate-400">{admin.phone}</p>}
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{admin.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
