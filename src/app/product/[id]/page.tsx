import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductModel } from '@/models/Product';
import mongoose from 'mongoose';
import AddToCart from '@/components/AddToCart';
import BackButton from '@/components/BackButton';
import { getProductImageUrl } from '@/lib/cloudinary';

interface Product {
	_id: string;
	name: string;
	slug: string;
	description?: string;
	brand?: string;
	category: string;
	sizes: number[];
	price: number;
	images: string[];
	inStock: boolean;
}

async function getProduct(idOrSlug: string): Promise<Product | null> {
	await connectToDatabase();
	const query = mongoose.Types.ObjectId.isValid(idOrSlug) ? { _id: idOrSlug } : { slug: idOrSlug };
	const doc = await ProductModel.findOne(query).lean<{ _id: mongoose.Types.ObjectId }>();
	if (!doc) return null;
	return { ...doc, _id: doc._id.toString() } as unknown as Product;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
	const product = await getProduct(params.id);
	if (!product) return notFound();

	return (
		<div className="min-h-screen p-6 sm:p-10">
			<div className="mb-6">
				<BackButton />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<div className="aspect-square w-full bg-gray-100 rounded overflow-hidden">
						{product.images?.[0] ? (
							<img 
								src={getProductImageUrl(product.images[0], 'large')} 
								alt={product.name} 
								className="w-full h-full object-cover" 
							/>
						) : (
							<div className="w-full h-full grid place-items-center text-gray-400">No image</div>
						)}
					</div>
				</div>
				<div>
					<h1 className="text-2xl sm:text-3xl font-semibold">{product.name}</h1>
					<div className="text-gray-500">{product.brand || 'Brand'} • {product.category}</div>
					<div className="mt-4 text-2xl font-bold">₹{product.price.toFixed(2)}</div>
					<p className="mt-4 text-gray-700 whitespace-pre-line">{product.description || 'No description.'}</p>
					<AddToCart
						productId={product._id}
						name={product.name}
						slug={product.slug}
						image={product.images?.[0]}
						price={product.price}
						sizes={product.sizes}
						inStock={product.inStock}
					/>
				</div>
			</div>
		</div>
	);
}
