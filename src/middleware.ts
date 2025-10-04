import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminTokenEdge } from '@/lib/auth-edge';

export const config = { matcher: ['/admin/:path*', '/api/:path*'] };

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const isAdminPath = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
	const isProtectedApi = pathname.startsWith('/api/products') && request.method !== 'GET';
	if (!isAdminPath && !isProtectedApi) return NextResponse.next();

	const token = request.cookies.get('admin_token')?.value;
	console.log('Middleware triggered for:', pathname, 'Token exists:', !!token);
	const ok = await verifyAdminTokenEdge(token);
	console.log('Token verification result:', ok);
	if (ok) return NextResponse.next();

	if (isAdminPath) {
		const url = request.nextUrl.clone();
		url.pathname = '/admin/login';
		url.searchParams.set('next', pathname);
		return NextResponse.redirect(url);
	}

	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
