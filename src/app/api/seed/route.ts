import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

const sampleProducts = [
	{
		name: 'Nike Air Zoom Pegasus',
		slug: 'nike-air-zoom-pegasus',
		description: 'Responsive road running shoes for daily training.',
		brand: 'Nike',
		category: 'men',
		sizes: [7, 8, 9, 10, 11],
		price: 8999,
		images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
		inStock: true,
	},
	{
		name: 'Adidas Ultraboost 22',
		slug: 'adidas-ultraboost-22',
		description: 'Cushioned comfort with energy return.',
		brand: 'Adidas',
		category: 'men',
		sizes: [7, 8, 9, 10],
		price: 11999,
		images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77'],
		inStock: true,
	},
	{
		name: 'Puma RS-X',
		slug: 'puma-rs-x',
		description: 'Retro-inspired chunky sneakers.',
		brand: 'Puma',
		category: 'unisex',
		sizes: [6, 7, 8, 9, 10],
		price: 7499,
		images: ['https://images.unsplash.com/photo-1543508282-6319a3e2621f'],
		inStock: true,
	},
	{
		name: 'Reebok Nano X',
		slug: 'reebok-nano-x',
		description: 'Stable trainers for crossfit and gym workouts.',
		brand: 'Reebok',
		category: 'women',
		sizes: [5, 6, 7, 8],
		price: 6999,
		images: ['https://images.unsplash.com/photo-1605348532760-6753d2c43329'],
		inStock: true,
	},
	{
		name: 'Converse Chuck Taylor High',
		slug: 'converse-chuck-taylor-high',
		description: 'Classic canvas high tops.',
		brand: 'Converse',
		category: 'unisex',
		sizes: [6, 7, 8, 9, 10, 11],
		price: 3999,
		images: ['https://images.unsplash.com/photo-1519741497674-611481863552'],
		inStock: true,
	},
	{
		name: 'Crocs Classic Clog',
		slug: 'crocs-classic-clog',
		description: 'Lightweight clogs for all-day comfort.',
		brand: 'Crocs',
		category: 'kids',
		sizes: [1, 2, 3, 4, 5],
		price: 2499,
		images: ['https://images.unsplash.com/photo-1620799139504-5c1d49e2aa47'],
		inStock: true,
	},
];

export async function POST() {
	await connectToDatabase();
	// Optional: clear existing sample products with same slugs
	const slugs = sampleProducts.map((p) => p.slug);
	await Product.deleteMany({ slug: { $in: slugs } });
	const inserted = await Product.insertMany(sampleProducts);
	return NextResponse.json({ inserted: inserted.length });
}

export async function GET() {
	// Allow GET to seed as well for convenience in browser
	return POST();
}
