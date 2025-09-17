const AUTH_SECRET = process.env.OTP_SECRET || 'dev-secret';

function base64UrlEncode(bytes: ArrayBuffer): string {
	const bin = String.fromCharCode(...new Uint8Array(bytes));
	return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function verifyAdminTokenEdge(token: string | undefined | null): Promise<boolean> {
	if (!token) return false;
	const parts = token.split('.');
	if (parts.length !== 3) return false;
	const [h, p, s] = parts;
	const data = `${h}.${p}`;
	const enc = new TextEncoder();
	try {
		const key = await crypto.subtle.importKey(
			'raw',
			enc.encode(AUTH_SECRET),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		);
		const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
		const expected = base64UrlEncode(sig);
		if (expected !== s) return false;
		// Expiry check
		const payloadJson = atob(p.replace(/-/g, '+').replace(/_/g, '/'));
		const payload = JSON.parse(payloadJson) as { role: string; expiresAt: number };
		if (payload.role !== 'admin') return false;
		if (Date.now() > payload.expiresAt) return false;
		return true;
	} catch {
		return false;
	}
}
