"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/cloudinary";

interface ProductItem {
	_id: string;
	name: string;
	slug: string;
	price: number;
	images: string[];
	brand?: string;
	category: string;
}

interface PaginatedResponse {
	items: ProductItem[];
	total: number;
	nextSkip: number;
}

const PAGE_SIZE = 6;

export default function ProductsGrid() {
	const [items, setItems] = useState<ProductItem[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [skip, setSkip] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const hasMore = useMemo(() => items.length < total, [items.length, total]);

	async function fetchPage(nextSkip: number) {
		setIsLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/products?limit=${PAGE_SIZE}&skip=${nextSkip}`, { cache: "no-store" });
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			const data: PaginatedResponse = await res.json();
			setItems(prev => {
				const existingIds = new Set(prev.map(i => i._id));
				const newItems = data.items.filter(i => !existingIds.has(i._id));
				return [...prev, ...newItems];
			});
			setTotal(data.total);
			setSkip(data.nextSkip);
		} catch (e: unknown) {
			setError((e as Error).message);
		} finally {
			setIsLoading(false);
		}
	}

	// Guard initial fetch to avoid double invoke in React Strict Mode (dev)
	const didInitRef = useRef(false);
	useEffect(() => {
		if (didInitRef.current) return;
		didInitRef.current = true;
		fetchPage(0);
	}, []);

	return (
		<div>
			{error ? (
				<div className="text-red-600 text-sm mb-4">{error}</div>
			) : null}

			{items.length === 0 && !isLoading ? (
				<div className="text-gray-500">No products yet. Add some via POST /api/products.</div>
			) : (
				<ul className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					{items.map((p) => (
						<li key={p._id} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
							<Link href={`/product/${p.slug || p._id}`} className="block">
								<div className="aspect-[4/5] sm:aspect-square w-full bg-gray-100 rounded mb-3 overflow-hidden relative">
									{p.images?.[0] ? (
										<Image
											src={getProductImageUrl(p.images[0], 'medium')}
											alt={p.name}
											fill
											className="object-contain sm:object-cover"
											sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
											placeholder="blur"
											blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
										/>
									) : (
										<div className="w-full h-full grid place-items-center text-gray-400">No image</div>
									)}
								</div>
								<h2 className="font-medium truncate" title={p.name}>{p.name}</h2>
								<div className="text-xs sm:text-sm text-gray-500">{p.brand || 'Brand'} • {p.category}</div>
								<div className="mt-1 sm:mt-2 font-semibold">₹{p.price.toFixed(2)}</div>
							</Link>
						</li>
					))}
				</ul>
			)}

			<div className="mt-6 flex justify-center">
				{hasMore ? (
					<button
						className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white disabled:opacity-60"
						onClick={() => fetchPage(skip)}
						disabled={isLoading}
					>
						{isLoading ? 'Loading…' : 'Load more items'}
					</button>
				) : (
					items.length > 0 ? (
						<div className="text-gray-500 text-sm">You&apos;ve reached the end.</div>
					) : null
				)}
			</div>
		</div>
	);
}


