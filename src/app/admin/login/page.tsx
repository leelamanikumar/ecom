"use client";

import { useState } from "react";

export default function AdminLoginPage() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await fetch('/api/admin/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
			});
			const data = await res.json();
			if (!res.ok || !data?.ok) throw new Error(data?.error || 'Login failed');
			window.location.href = (new URLSearchParams(window.location.search).get('next')) || '/admin';
		} catch (e: any) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-sm mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
			{error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
			<form onSubmit={onSubmit} className="space-y-3">
				<input
					type="password"
					placeholder="Enter admin password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border rounded px-3 py-2"
				/>
				<button disabled={loading} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
			</form>
		</div>
	);
}
