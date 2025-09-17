"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCart({
	productId,
	name,
	slug,
	image,
	price,
	sizes,
	inStock,
}: {
	productId: string;
	name: string;
	slug?: string;
	image?: string;
	price: number;
	sizes: number[];
	inStock: boolean;
}) {
	const router = useRouter();
	const { addItem } = useCart();
	const normalizedSizes = sizes?.length ? sizes : [6,7,8,9,10];
	const [size, setSize] = useState<number | undefined>(normalizedSizes[0]);
	const [adding, setAdding] = useState(false);

	function handleAdd() {
		if (!inStock) return;
		setAdding(true);
		addItem({ productId, name, slug, image, price, size, quantity: 1 });
		setTimeout(() => setAdding(false), 300);
	}

	function handleBuyNow() {
		if (!inStock) return;
		addItem({ productId, name, slug, image, price, size, quantity: 1 });
		router.push('/cart?checkout=1');
	}

	return (
		<div className="mt-6">
			<div className="font-medium mb-2">Select size</div>
			<div className="flex gap-2 flex-wrap">
				{normalizedSizes.map((s) => (
					<button
						key={s}
						onClick={() => setSize(s)}
						className={`px-3 py-1 border rounded text-sm font-medium ${size === s ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'}`}
						type="button"
						aria-pressed={size === s}
					>
						{s}
					</button>
				))}
			</div>
			<div className="mt-4 flex items-center gap-3">
				<button
					type="button"
					onClick={handleAdd}
					disabled={!inStock || adding}
					className="inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded hover:opacity-90 disabled:opacity-50"
				>
					{inStock ? (adding ? 'Adding...' : 'Add to cart') : 'Out of stock'}
				</button>
				<button
					type="button"
					onClick={handleBuyNow}
					disabled={!inStock}
					className="inline-flex items-center justify-center px-4 py-2 border border-blue text-blue rounded hover:bg-gray-100 disabled:opacity-50"
				>
					Buy now
				</button>
			</div>
		</div>
	);
}
