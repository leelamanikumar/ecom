import { NextResponse } from 'next/server';
import { createAdminToken, isValidAdminPassword } from '@/lib/auth';

export async function POST(request: Request) {
	const { password } = await request.json();
	if (!isValidAdminPassword(String(password || ''))) {
		return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
	}
	const token = createAdminToken();
	const res = NextResponse.json({ ok: true });
	res.cookies.set('admin_token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 7 * 24 * 60 * 60,
		path: '/',
	});
	return res;
}
