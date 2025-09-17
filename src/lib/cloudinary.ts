// Server-side only Cloudinary functions
export function getOptimizedImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
} = {}) {
  const {
    width = 400,
    height = 400,
    quality = 'auto',
    format = 'auto'
  } = options;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    console.warn('CLOUDINARY_CLOUD_NAME not set');
    return publicId; // fallback to original URL
  }

  // Build Cloudinary URL manually to avoid importing the SDK
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_fill`,
    `g_auto`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');

  return `${baseUrl}/${transformations}/${publicId}`;
}

// Helper for product images with different sizes
export function getProductImageUrl(publicId: string, size: 'thumbnail' | 'medium' | 'large' = 'medium') {
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 }
  };

  return getOptimizedImageUrl(publicId, sizes[size]);
}
