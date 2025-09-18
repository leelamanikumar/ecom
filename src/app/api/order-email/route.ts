import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface OrderPayload {
	phone: string;
	shipping: {
		fullName: string;
		address1: string;
		address2?: string;
		city: string;
		state: string;
		postalCode: string;
	};
	cartTotal: number;
}

export async function POST(request: Request) {
	try {
		const { phone, shipping, cartTotal } = (await request.json()) as OrderPayload;
		if (!phone || !shipping?.fullName || !shipping?.address1 || !shipping?.city || !shipping?.state || !shipping?.postalCode) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const host = process.env.SMTP_HOST;
		const port = Number(process.env.SMTP_PORT || '587');
		const user = process.env.SMTP_USER;
		const pass = process.env.SMTP_PASS;
		const to = process.env.ORDER_NOTIFY_EMAIL;
		if (!host || !user || !pass || !to) {
			return NextResponse.json({ error: 'Email is not configured on server' }, { status: 500 });
		}

		const transporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465,
			auth: { user, pass },
		});

		const subject = `New checkout intent - ${shipping.fullName}`;
		const text = `Phone: ${phone}\n\nShip To:\n${shipping.fullName}\n${shipping.address1}${shipping.address2 ? '\n' + shipping.address2 : ''}\n${shipping.city}, ${shipping.state} ${shipping.postalCode}\n\nCart Total: ₹${cartTotal.toFixed(2)}`;

		await transporter.sendMail({
			from: `Store <${user}>`,
			to,
			subject,
			text,
		});

		return NextResponse.json({ ok: true });
	} catch (e: unknown) {
		return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
	}
}
