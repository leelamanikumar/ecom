import { NextResponse } from 'next/server';
import { verifyOtpToken, normalizePhone } from '@/lib/otp';

export async function POST(request: Request) {
	try {
		const { phone, code, token } = await request.json();
		if (!phone || !code || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		const payload = verifyOtpToken(token);
		if (!payload) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
		const normalized = normalizePhone(phone);
		if (payload.phone !== normalized) return NextResponse.json({ error: 'Phone mismatch' }, { status: 400 });
		if (payload.code !== String(code).trim()) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
		return NextResponse.json({ ok: true });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
