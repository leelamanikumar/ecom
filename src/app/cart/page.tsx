"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import CheckoutFlow from "@/components/CheckoutFlow";
import { getProductImageUrl } from "@/lib/cloudinary";

export default function CartPage() {
	const { state, removeItem, changeQty, clear } = useCart();
	const items = state.items;
	const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
	const [showCheckout, setShowCheckout] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (url.searchParams.get('checkout') === '1') {
				setShowCheckout(true);
			}
		}
	}, []);

	function cloudinaryThumbFromUrl(url: string) {
		// Turn any Cloudinary delivery URL into a small thumbnail
		try {
			const u = new URL(url);
			if (!u.hostname.includes('res.cloudinary.com')) return url;
			u.pathname = u.pathname.replace('/upload/', '/upload/w_150,h_150,c_fill,g_auto,q_auto,f_auto/');
			return u.toString();
		} catch {
			return url;
		}
	}

	function resolveThumb(src?: string) {
		if (!src) return undefined;
		if (/^https?:\/\//i.test(src)) return cloudinaryThumbFromUrl(src);
		return getProductImageUrl(src, 'thumbnail');
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Your Cart</h1>

			{items.length === 0 ? (
				<div className="text-gray-600">
					Your cart is empty. <Link href="/" className="text-blue-600 underline">Continue shopping</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6">
					<ul className="divide-y border rounded">
						{items.map((i) => (
							<li key={`${i.productId}-${i.size ?? 'na'}`} className="p-4 flex items-center gap-4">
								<div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
									{resolveThumb(i.image) ? (
										<img 
											src={resolveThumb(i.image)} 
											alt={i.name} 
											className="w-full h-full object-cover" 
											onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/vercel.svg'; }}
										/>
									) : (
										<div className="w-full h-full grid place-items-center text-gray-400">No image</div>
									)}
								</div>
								<div className="flex-1 min-w-0">
									<Link href={`/product/${i.slug ?? i.productId}`} className="font-medium hover:underline truncate block" title={i.name}>{i.name}</Link>
									<div className="text-sm text-gray-500">{i.size ? `Size ${i.size}` : 'One size'}</div>
									<div className="mt-1 font-semibold">₹{i.price.toFixed(2)}</div>
								</div>
								<div className="flex items-center gap-2">
									<button className="px-2 py-1 border rounded" onClick={() => changeQty(i.productId, i.size, Math.max(1, i.quantity - 1))}>-</button>
									<input
										type="number"
										min={1}
										value={i.quantity}
										onChange={(e) => changeQty(i.productId, i.size, parseInt(e.target.value || '1', 10))}
										className="w-16 text-center border rounded py-1"
									/>
									<button className="px-2 py-1 border rounded" onClick={() => changeQty(i.productId, i.size, i.quantity + 1)}>+</button>
								</div>
								<button className="ml-4 text-red-600 hover:underline" onClick={() => removeItem(i.productId, i.size)}>Remove</button>
							</li>
						))}
					</ul>

					<div className="flex items-center justify-between">
						<div className="text-xl font-semibold">Total: ₹{total.toFixed(2)}</div>
						<div className="flex gap-3">
							<button className="px-4 py-2 border rounded" onClick={clear}>Clear cart</button>
							<button className="px-4 py-2 bg-black text-white rounded" onClick={() => setShowCheckout((v) => !v)}>{showCheckout ? 'Hide' : 'Checkout'}</button>
						</div>
					</div>

					{showCheckout && <CheckoutFlow total={total} />}
				</div>
			)}
		</div>
	);
}
