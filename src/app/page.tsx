import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { Product as ProductModel } from "@/models/Product";
import { getProductImageUrl } from "@/lib/cloudinary";

interface Product {
	_id: string;
	name: string;
	slug: string;
	price: number;
	images: string[];
	brand?: string;
	category: string;
}

export default async function Home() {
	await connectToDatabase();
	const products = (await ProductModel.find({}).sort({ createdAt: -1 }).lean()) as unknown as Product[];

	return (
		<div className="min-h-screen p-6 sm:p-10">
			<h1 className="text-2xl sm:text-3xl font-semibold mb-6">Footwear Store</h1>
			{products.length === 0 ? (
				<div className="text-gray-500">No products yet. Add some via POST /api/products.</div>
			) : (
				<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{products.map((p) => (
							<li key={p._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
								<Link href={`/product/${p.slug || p._id}`} className="block">
									<div className="aspect-square w-full bg-gray-100 rounded mb-3 overflow-hidden">
										{p.images?.[0] ? (
											<img 
												src={getProductImageUrl(p.images[0], 'medium')} 
												alt={p.name} 
												className="w-full h-full object-cover" 
												loading="lazy"
											/>
										) : (
											<div className="w-full h-full grid place-items-center text-gray-400">No image</div>
										)}
									</div>
									<h2 className="font-medium truncate" title={p.name}>{p.name}</h2>
									<div className="text-sm text-gray-500">{p.brand || 'Brand'} • {p.category}</div>
									<div className="mt-2 font-semibold">₹{p.price.toFixed(2)}</div>
								</Link>
							</li>
					))}
				</ul>
			)}
		</div>
	);
}
