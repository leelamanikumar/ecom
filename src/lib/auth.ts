import crypto from 'crypto';
import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const AUTH_SECRET = process.env.OTP_SECRET || 'dev-secret';

interface AdminPayload {
	role: 'admin';
	expiresAt: number;
}

function b64u(input: Buffer | string) {
	return Buffer.from(input)
		.toString('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

function sign(data: string) {
	return b64u(crypto.createHmac('sha256', AUTH_SECRET).update(data).digest());
}

export function createAdminToken(ttlMs = 7 * 24 * 60 * 60 * 1000): string {
	const header = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const payload: AdminPayload = { role: 'admin', expiresAt: Date.now() + ttlMs };
	const body = b64u(JSON.stringify(payload));
	const sig = sign(`${header}.${body}`);
	return `${header}.${body}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
	if (!token) return false;
	const parts = token.split('.');
	if (parts.length !== 3) return false;
	const [h, p, s] = parts;
	const expected = sign(`${h}.${p}`);
	if (expected !== s) return false;
	try {
		const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()) as AdminPayload;
		if (payload.role !== 'admin') return false;
		if (Date.now() > payload.expiresAt) return false;
		return true;
	} catch {
		return false;
	}
}

export function isValidAdminPassword(pw: string): boolean {
	return ADMIN_PASSWORD.length > 0 && crypto.timingSafeEqual(Buffer.from(pw), Buffer.from(ADMIN_PASSWORD));
}

export async function getIsAdminFromCookies(): Promise<boolean> {
	const store = await cookies();
	const token = store.get('admin_token')?.value;
	return verifyAdminToken(token);
}
