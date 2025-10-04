import { NextResponse } from 'next/server';

export async function POST() {
	const res = NextResponse.json({ ok: true });
	res.cookies.set('admin_token', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0,
		path: '/',
	});
	return res;
}
