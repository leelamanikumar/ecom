import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary-server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
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
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      public_id: (result as any).public_id,
      secure_url: (result as any).secure_url,
      width: (result as any).width,
      height: (result as any).height
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
