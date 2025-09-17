import crypto from 'crypto';

const OTP_SECRET = process.env.OTP_SECRET as string;

if (!OTP_SECRET) {
	console.warn('Missing OTP_SECRET in environment. Set it in .env.local');
}

export interface OtpPayload {
	phone: string; // E.164 without '+' or with, we will normalize
	code: string;
	expiresAt: number; // epoch ms
}

function base64url(input: Buffer | string) {
	return Buffer.from(input)
		.toString('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

export function signOtpToken(payload: OtpPayload): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const h = base64url(JSON.stringify(header));
	const p = base64url(JSON.stringify(payload));
	const data = `${h}.${p}`;
	const sig = crypto.createHmac('sha256', OTP_SECRET || 'dev-secret').update(data).digest();
	const s = base64url(sig);
	return `${data}.${s}`;
}

export function verifyOtpToken(token: string): OtpPayload | null {
	const parts = token.split('.');
	if (parts.length !== 3) return null;
	const [h, p, s] = parts;
	const data = `${h}.${p}`;
	const expected = base64url(crypto.createHmac('sha256', OTP_SECRET || 'dev-secret').update(data).digest());
	if (!timingSafeEqual(expected, s)) return null;
	try {
		const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()) as OtpPayload;
		if (Date.now() > payload.expiresAt) return null;
		return payload;
	} catch {
		return null;
	}
}

function timingSafeEqual(a: string, b: string) {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	if (ab.length !== bb.length) return false;
	return crypto.timingSafeEqual(ab, bb);
}

export function normalizePhone(input: string): string {
	// Keep digits and ensure it starts with country code (default +91 for example)
	const digits = input.replace(/\D/g, '');
	if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
	if (digits.length === 10) return `+91${digits}`;
	if (digits.startsWith('+')) return `+${digits.replace(/\D/g, '')}`;
	return `+${digits}`;
}
