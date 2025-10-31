"use client";
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next') || '/dashboard';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password2, setPassword2] = useState('');
  const [role, setRole] = useState('ACCOUNTANT');
  const [smiId, setSmiId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, first_name: firstName, last_name: lastName, password, confirm_password: password2, role, smi_id: smiId || undefined }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || j?.detail || 'Registration failed');
      }
      router.push(next);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded p-6">
        <h1 className="text-xl font-semibold">Create an account</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Confirm password</label>
          <input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="PRINCIPAL_OFFICER">Principal Officer</option>
            <option value="ACCOUNTANT">SMI Data Entry</option>
            <option value="COMPLIANCE_OFFICER">SMI Data Entry</option>
            <option value="COMMISSION_ANALYST">Commission Analyst</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Company (SMI) ID (optional)</label>
          <input value={smiId} onChange={(e) => setSmiId(e.target.value)} placeholder="SMI UUID" className="w-full border px-3 py-2 rounded" />
        </div>
        <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
          {loading ? 'Creating...' : 'Register'}
        </button>
        <p className="text-sm text-center">
          Already have an account? <a href="/login" className="text-blue-600">Sign in</a>
        </p>
      </form>
    </div>
  );
}


