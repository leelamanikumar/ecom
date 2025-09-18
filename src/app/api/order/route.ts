import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function POST(request: Request) {
	try {
		await connectToDatabase();
		const { phone, shipping, total } = (await request.json()) as {
			phone?: string;
			shipping?: {
				fullName?: string;
				address1?: string;
				address2?: string;
				city?: string;
				state?: string;
				postalCode?: string;
			};
			total?: number;
		};

		if (!phone || !shipping?.fullName || !shipping?.address1 || !shipping?.city || !shipping?.state || !shipping?.postalCode || typeof total !== 'number') {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const order = await Order.create({ phone, shipping, total });
		return NextResponse.json({ ok: true, id: order._id.toString() });
	} catch (e: unknown) {
		return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
	}
}
