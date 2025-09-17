"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Step = 'phone' | 'otp' | 'shipping' | 'confirmed';

export default function CheckoutFlow({ total }: { total: number }) {
	const { clear } = useCart();
	const [step, setStep] = useState<Step>('phone');
	const [phone, setPhone] = useState('');
	const [serverToken, setServerToken] = useState<string | null>(null);
	const [otp, setOtp] = useState('');
	const [info, setInfo] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [shipping, setShipping] = useState({
		fullName: '',
		address1: '',
		address2: '',
		city: '',
		state: '',
		postalCode: '',
	});
	const [orderId, setOrderId] = useState<string | null>(null);

	async function sendOtp() {
		setError(null);
		setInfo(null);
		const digits = phone.replace(/\D/g, '');
		if (digits.length < 10) {
			setError('Please enter a valid 10-digit mobile number');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch('/api/otp/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone }),
			});
			const data: { ok?: boolean; token?: string; debugCode?: string; error?: string } = await res.json();
			if (!res.ok || !data?.ok || !data?.token) {
				throw new Error(data?.error || 'Failed to send OTP');
			}
			setServerToken(data.token);
			setStep('otp');
			if (data.debugCode) {
				setInfo(`OTP sent on WhatsApp. Demo OTP: ${data.debugCode}`);
			} else {
				setInfo('OTP sent on WhatsApp. Please check your phone.');
			}
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Failed to send OTP');
		} finally {
			setLoading(false);
		}
	}

	async function verifyOtp() {
		setError(null);
		setInfo(null);
		if (!serverToken) {
			setError('Please request an OTP first');
			return;
		}
		if (otp.trim().length !== 4) {
			setError('Enter the 4-digit OTP');
			return;
		}
		setLoading(true);
		try {
			const res = await fetch('/api/otp/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone, code: otp.trim(), token: serverToken }),
			});
			const data: { ok?: boolean; error?: string } = await res.json();
			if (!res.ok || !data?.ok) {
				throw new Error(data?.error || 'Verification failed');
			}
			setInfo('Phone verified successfully.');
			setStep('shipping');
		} catch (e: unknown) {
			setError(e instanceof Error ? e.message : 'Verification failed');
		} finally {
			setLoading(false);
		}
	}

	function confirmOrder() {
		setError(null);
		// Basic validation
		if (!shipping.fullName || !shipping.address1 || !shipping.city || !shipping.state || !shipping.postalCode) {
			setError('Please fill all required fields');
			return;
		}
		const id = `ORD-${Date.now().toString().slice(-6)}`;
		setOrderId(id);
		clear();
		setStep('confirmed');
	}

	return (
		<div className="border rounded p-4 mt-6">
			<h2 className="text-lg font-semibold mb-3">Checkout</h2>
			{info && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{info}</div>}
			{error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

			{step === 'phone' && (
				<div className="space-y-3">
					<label className="block text-sm font-medium">Mobile number (WhatsApp)</label>
					<input
						type="tel"
						placeholder="Enter 10-digit mobile number"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full border rounded px-3 py-2"
					/>
					<button onClick={sendOtp} disabled={loading} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">{loading ? 'Sending…' : 'Send OTP via WhatsApp'}</button>
				</div>
			)}

			{step === 'otp' && (
				<div className="space-y-3">
					<label className="block text-sm font-medium">Enter 4-digit OTP</label>
					<input
						type="text"
						inputMode="numeric"
						maxLength={4}
						value={otp}
						onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
						className="w-32 border rounded px-3 py-2 tracking-widest text-center"
					/>
					<div className="flex gap-2">
						<button onClick={verifyOtp} disabled={loading} className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">{loading ? 'Verifying…' : 'Verify'}</button>
						<button onClick={sendOtp} disabled={loading} className="px-4 py-2 border rounded">Resend OTP</button>
					</div>
				</div>
			)}

			{step === 'shipping' && (
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-sm font-medium">Full name</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
						</div>
						<div>
							<label className="block text-sm font-medium">Postal code</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} />
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium">Address line 1</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.address1} onChange={(e) => setShipping({ ...shipping, address1: e.target.value })} />
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm font-medium">Address line 2 (optional)</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.address2} onChange={(e) => setShipping({ ...shipping, address2: e.target.value })} />
						</div>
						<div>
							<label className="block text-sm font-medium">City</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
						</div>
						<div>
							<label className="block text-sm font-medium">State</label>
							<input className="w-full border rounded px-3 py-2" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} />
						</div>
					</div>
					<div className="flex items-center justify-between pt-2">
						<div className="font-semibold">Total: ₹{total.toFixed(2)}</div>
						<button onClick={confirmOrder} className="px-4 py-2 bg-black text-white rounded">Confirm order</button>
					</div>
				</div>
			)}

			{step === 'confirmed' && (
				<div className="text-center space-y-2">
					<div className="text-2xl">✅</div>
					<div className="text-lg font-semibold">Order confirmed!</div>
					{orderId && <div className="text-sm text-gray-600">Order ID: {orderId}</div>}
					<div className="text-sm text-gray-600">Thank you for your purchase.</div>
				</div>
			)}
		</div>
	);
}
