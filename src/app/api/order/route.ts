import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function POST(request: Request) {
	try {
		await connectToDatabase();
		const { phone, shipping, total, items } = (await request.json()) as {
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
			items?: Array<{
				productId: string;
				name: string;
				slug?: string;
				image?: string;
				price: number;
				size?: number;
				quantity: number;
			}>;
		};

		if (!phone || !shipping?.fullName || !shipping?.address1 || !shipping?.city || !shipping?.state || !shipping?.postalCode || typeof total !== 'number' || !items || items.length === 0) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const order = await Order.create({ phone, shipping, total, items });
		return NextResponse.json({ ok: true, id: order._id.toString() });
	} catch (e: unknown) {
		return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
	}
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || undefined;
    const status = searchParams.get('status') || undefined; // 'delivered' | 'pending'

    const filter: Record<string, unknown> = {};
    if (phone) filter.phone = phone;
    if (status === 'delivered') filter.delivered = true;
    if (status === 'pending') filter.delivered = false;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders.map(o => ({
      _id: o._id.toString(),
      phone: o.phone,
      shipping: o.shipping,
      items: o.items || [],
      total: o.total,
      delivered: o.delivered,
      deliveredAt: o.deliveredAt ?? null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })));
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json() as { id?: string; delivered?: boolean };
    if (!body?.id || typeof body?.delivered !== 'boolean') {
      return NextResponse.json({ error: 'id and delivered are required' }, { status: 400 });
    }
    const update: Record<string, unknown> = { delivered: body.delivered };
    if (body.delivered) update.deliveredAt = new Date();
    const updated = await Order.findByIdAndUpdate(body.id, update, { new: true });
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}