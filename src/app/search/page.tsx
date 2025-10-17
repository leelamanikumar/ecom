import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getProductImageUrl } from "@/lib/cloudinary";
import BackButton from "@/components/BackButton";
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	await connectToDatabase();
	const resolvedSearchParams = await searchParams;
	const q = (resolvedSearchParams.q || '').trim();
	const query = q
		? { $text: { $search: q } }
		: {};
	const products = await Product.find(query).sort({ createdAt: -1 }).lean<{ _id: string; name: string; slug: string; price: number; images: string[] }[]>();

	return (
		<div className="max-w-6xl mx-auto p-6">
			<div className="mb-6">
				<BackButton />
			</div>
			<h1 className="text-2xl font-semibold mb-4">Search</h1>
			<form action="/search" className="flex gap-2 mb-6">
				<input name="q" defaultValue={q} placeholder="Search shoes, brands..." className="w-full border rounded px-3 py-2 text-sm" />
				<button className="px-3 py-2 bg-black text-white rounded text-sm">Search</button>
			</form>
			{q && <div className="text-sm text-gray-600 mb-4">Results for &quot;{q}&quot;</div>}
			<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{products.map((p) => (
					<li key={p._id as string} className="border rounded p-4">
						<a href={`/product/${p.slug || p._id}`} className="block">
							<div className="aspect-square w-full bg-gray-100 rounded mb-3 overflow-hidden relative">
								{p.images?.[0] ? (
									<Image 
										src={getProductImageUrl(p.images[0], 'medium')} 
										alt={p.name} 
										fill
										className="object-cover" 
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										placeholder="blur"
										blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
									/>
								) : (
									<div className="w-full h-full grid place-items-center text-gray-400">No image</div>
								)}
							</div>
							<div className="font-medium">{p.name}</div>
							<div className="text-sm text-gray-500">₹{p.price.toFixed(2)}</div>
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
