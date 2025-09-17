import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary-server';

interface CloudinaryUploadResult {
	public_id: string;
	secure_url: string;
	width: number;
	height: number;
}

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		
		if (!file) {
			return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
		}

		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Upload to Cloudinary
		const result: CloudinaryUploadResult = await new Promise((resolve, reject) => {
			cloudinary.uploader.upload_stream(
				{
					folder: 'footwear-store',
					resource_type: 'auto',
					transformation: [
						{ width: 800, height: 800, crop: 'limit', quality: 'auto' },
						{ format: 'auto' }
					]
				},
				(error, result) => {
					if (error || !result) reject(error || new Error('Upload failed'));
					else resolve(result as unknown as CloudinaryUploadResult);
				}
			).end(buffer);
		});

		return NextResponse.json({
			success: true,
			public_id: result.public_id,
			secure_url: result.secure_url,
			width: result.width,
			height: result.height
		});

	} catch (error: unknown) {
		console.error('Upload error:', error);
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 });
	}
}
