const AUTH_SECRET = process.env.OTP_SECRET || 'dev-secret';

function base64UrlEncode(bytes: ArrayBuffer): string {
	const bin = String.fromCharCode(...new Uint8Array(bytes));
	return btoa(bin).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export async function verifyAdminTokenEdge(token: string | undefined | null): Promise<boolean> {
	console.log('Edge verification - Token:', !!token, 'Secret length:', AUTH_SECRET.length);
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
		if (expected !== s) {
			console.log('Edge verification - Signature mismatch');
			return false;
		}
		// Expiry check
		const payloadJson = atob(p.replace(/-/g, '+').replace(/_/g, '/'));
		const payload = JSON.parse(payloadJson) as { role: string; expiresAt: number };
		if (payload.role !== 'admin') {
			console.log('Edge verification - Invalid role:', payload.role);
			return false;
		}
		if (Date.now() > payload.expiresAt) {
			console.log('Edge verification - Token expired');
			return false;
		}
		console.log('Edge verification - Token valid');
		return true;
	} catch (e) {
		console.log('Edge verification - Error:', e);
		return false;
	}
}
