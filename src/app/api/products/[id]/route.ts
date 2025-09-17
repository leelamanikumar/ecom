import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import mongoose from 'mongoose';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	await connectToDatabase();
	const { id } = await context.params;
	const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
	const product = await Product.findOne(query).lean();
	if (!product) {
		return NextResponse.json({ error: 'Not Found' }, { status: 404 });
	}
	return NextResponse.json(product);
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> }
) {
	const token = cookies().get('admin_token')?.value;
	if (!verifyAdminToken(token)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	await connectToDatabase();
	const { id } = await context.params;
	const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
	const result = await Product.deleteOne(query);
	if (result.deletedCount === 0) {
		return NextResponse.json({ error: 'Not Found' }, { status: 404 });
	}
	return NextResponse.json({ ok: true });
}
