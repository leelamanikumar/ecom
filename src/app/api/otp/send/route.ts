import { NextResponse } from 'next/server';
import { normalizePhone, signOtpToken } from '@/lib/otp';

const WA_TOKEN = process.env.WHATSAPP_TOKEN as string;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID as string;

export async function POST(request: Request) {
	try {
		const { phone } = await request.json();
		if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });
		const to = normalizePhone(phone);

		const code = String(Math.floor(1000 + Math.random() * 9000));
		const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
		const token = signOtpToken({ phone: to, code, expiresAt });

		if (!WA_TOKEN || !WA_PHONE_ID) {
			console.warn('Missing WhatsApp credentials; returning OTP in response for dev');
			return NextResponse.json({ ok: true, token, debugCode: code });
		}

		const payload = {
			messaging_product: 'whatsapp',
			to,
			type: 'template',
			template: {
				name: 'otp',
				language: { code: 'en' },
				components: [
					{
						type: 'body',
						parameters: [
							{ type: 'text', text: code },
						],
					},
				],
			},
		};

		const resp = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${WA_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});
		if (!resp.ok) {
			const text = await resp.text();
			console.error('WhatsApp API error:', text);
			return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
		}

		return NextResponse.json({ ok: true, token });
	} catch (e: any) {
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
