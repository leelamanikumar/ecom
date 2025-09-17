import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET() {
	await connectToDatabase();
	const products = await Product.find({}).sort({ createdAt: -1 }).lean();
	return NextResponse.json(products);
}

export async function POST(request: Request) {
	await connectToDatabase();
	try {
		const body = await request.json();
		const created = await Product.create(body);
		return NextResponse.json(created, { status: 201 });
	} catch (error: unknown) {
		return NextResponse.json({ error: (error as Error).message }, { status: 400 });
	}
}
