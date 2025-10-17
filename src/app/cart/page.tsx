"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import CheckoutFlow from "@/components/CheckoutFlow";
import BackButton from "@/components/BackButton";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/cloudinary";

export default function CartPage() {
	const { state, removeItem, changeQty, clear } = useCart();
	const items = state.items;
	const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
	const [showCheckout, setShowCheckout] = useState(false);
	const [orderPlaced, setOrderPlaced] = useState(false);
	const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (url.searchParams.get('checkout') === '1') {
				setShowCheckout(true);
			}
			if (url.searchParams.get('order') === 'placed') {
				setOrderPlaced(true);
				setPlacedOrderId(url.searchParams.get('orderId'));
			}

			const handler = (e: Event) => {
				const detail = (e as CustomEvent).detail as { orderId?: string } | undefined;
				setOrderPlaced(true);
				setPlacedOrderId(detail?.orderId ?? null);
				setShowCheckout(false);
			};
			window.addEventListener('order:placed', handler as EventListener);
			return () => window.removeEventListener('order:placed', handler as EventListener);
		}
	}, []);

	function cloudinaryThumbFromUrl(url: string) {
		// Turn any Cloudinary delivery URL into a small thumbnail
		try {
			const u = new URL(url);
			if (!u.hostname.includes('res.cloudinary.com')) return url;
			// Use a larger size for better quality thumbnails
			u.pathname = u.pathname.replace('/upload/', '/upload/w_200,h_200,c_fill,g_auto,q_auto,f_auto/');
			return u.toString();
		} catch {
			return url;
		}
	}

	function resolveThumb(src?: string) {
		if (!src) return undefined;
		
		// If it's already a full URL, use it directly
		if (/^https?:\/\//i.test(src)) {
			return cloudinaryThumbFromUrl(src);
		}
		
		// If it's a Cloudinary public ID, generate the URL
		try {
			const url = getProductImageUrl(src, 'medium');
			// If env vars are missing in production, this may return a bare publicId
			// Guard against returning non-URLs which would break the <img src>
			if (!/^https?:\/\//i.test(url)) return undefined;
			return url;
		} catch (error) {
			console.error('Error generating image URL:', error);
			return undefined;
		}
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<BackButton />
			</div>
			<h1 className="text-2xl font-semibold mb-4">Your Cart</h1>

			{orderPlaced && (
				<div className="mb-4 rounded border border-green-200 bg-green-50 text-green-800 px-4 py-3">
					<div className="font-medium">Your order has been placed!</div>
					{placedOrderId && <div className="text-sm">Order ID: {placedOrderId}</div>}
					<div className="mt-2 flex gap-3">
						<Link href="/orders" className="inline-flex items-center px-3 py-1.5 rounded bg-green-600 text-white hover:opacity-90">View orders</Link>
						<Link href="/" className="inline-flex items-center px-3 py-1.5 rounded border border-green-300 text-green-800 hover:bg-green-100">Continue shopping</Link>
					</div>
				</div>
			)}

			{items.length === 0 ? (
				<div className="text-gray-600">
					{orderPlaced ? (
						<div>
							<div className="font-medium mb-1">Thank you! Your order is placed.</div>
							{placedOrderId && <div className="text-sm mb-2">Order ID: {placedOrderId}</div>}
							<div className="flex gap-3">
								<Link href="/orders" className="text-blue-600 underline">View orders</Link>
								<Link href="/" className="text-blue-600 underline">Continue shopping</Link>
							</div>
						</div>
					) : (
						<div>
							Your cart is empty. <Link href="/" className="text-blue-600 underline">Continue shopping</Link>
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6">
					<ul className="divide-y border rounded">
						{items.map((i) => (
							<li key={`${i.productId}-${i.size ?? 'na'}`} className="p-4">
								<div className="flex flex-col sm:flex-row sm:items-center gap-4">
									{/* Product Image */}
									<div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 mx-auto sm:mx-0 relative">
									{resolveThumb(i.image) ? (
										(() => {
											const thumbSrc = resolveThumb(i.image) || ""; // ensure string for Next/Image
											return (
												<Image 
													src={thumbSrc}
													alt={i.name}
													fill
													className="object-cover"
													sizes="80px"
													placeholder="blur"
													blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
												/>
											);
										})()
									) : (
											<div className="w-full h-full grid place-items-center text-gray-400 text-xs">
												No image
											</div>
										)}
									</div>
									
									{/* Product Info */}
									<div className="flex-1 min-w-0 text-center sm:text-left">
										<Link href={`/product/${i.slug ?? i.productId}`} className="font-medium hover:underline block" title={i.name}>{i.name}</Link>
										<div className="text-sm text-gray-500">{i.size ? `Size ${i.size}` : 'One size'}</div>
										<div className="mt-1 font-semibold">₹{i.price.toFixed(2)}</div>
										{/* Debug info - remove this later */}
										<div className="text-xs text-gray-400 mt-1">
											Image: {i.image ? 'Present' : 'Missing'} | 
											Resolved: {resolveThumb(i.image) ? 'Yes' : 'No'}
										</div>
									</div>
									
									{/* Quantity Controls */}
									<div className="flex items-center justify-center gap-2">
										<button 
											className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50" 
											onClick={() => changeQty(i.productId, i.size, Math.max(1, i.quantity - 1))}
											aria-label="Decrease quantity"
										>
											-
										</button>
										<input
											type="number"
											min={1}
											value={i.quantity}
											onChange={(e) => changeQty(i.productId, i.size, parseInt(e.target.value || '1', 10))}
											className="w-16 text-center border rounded py-1"
										/>
										<button 
											className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-50" 
											onClick={() => changeQty(i.productId, i.size, i.quantity + 1)}
											aria-label="Increase quantity"
										>
											+
										</button>
									</div>
									
									{/* Remove Button */}
									<button 
										className="text-red-600 hover:underline text-sm px-2 py-1 rounded hover:bg-red-50" 
										onClick={() => removeItem(i.productId, i.size)}
									>
										Remove
									</button>
								</div>
							</li>
						))}
					</ul>

					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded">
						<div className="text-xl font-semibold text-center sm:text-left">Total: ₹{total.toFixed(2)}</div>
						<div className="flex flex-col sm:flex-row gap-3">
							<button className="px-4 py-2 border rounded hover:bg-gray-100" onClick={clear}>Clear cart</button>
							<button className="px-4 py-2 bg-black text-white rounded hover:opacity-90" onClick={() => setShowCheckout((v) => !v)}>{showCheckout ? 'Hide' : 'Checkout'}</button>
						</div>
					</div>

					{showCheckout && <CheckoutFlow total={total} />}
				</div>
			)}
		</div>
	);
}
