import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export async function GET(request: NextRequest) {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const skipParam = searchParams.get('skip');

    const limit = Math.max(0, Math.min(100, Number(limitParam ?? '0')));
    const skip = Math.max(0, Number(skipParam ?? '0'));

    const query = {} as Record<string, unknown>;

    // When limit is provided, return a paginated payload with total
    if (limit > 0) {
        const [items, total] = await Promise.all([
            Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Product.countDocuments(query)
        ]);
        return NextResponse.json({ items, total, nextSkip: skip + items.length });
    }

    // Backward compatibility: return full list if no limit specified
    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
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
