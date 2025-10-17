// Cloudinary URL helpers (safe for both server and client usage)
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

  // Prefer public env var so this works in client components too
  const cloudName =
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined) ||
    (process.env.CLOUDINARY_CLOUD_NAME as string | undefined);
  if (!cloudName) {
    // Fallback: return the given publicId as-is (may be a full URL already)
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
    `f_${format}`,
    `fl_progressive` // Progressive JPEG for better loading experience
  ].join(',');

  return `${baseUrl}/${transformations}/${publicId}`;
}

// Helper for product images with different sizes
export function getProductImageUrl(publicId: string, size: 'thumbnail' | 'medium' | 'large' = 'medium') {
  const sizes = {
    thumbnail: { width: 150, height: 150, quality: 80 },
    medium: { width: 400, height: 400, quality: 85 },
    large: { width: 800, height: 800, quality: 90 }
  };

  return getOptimizedImageUrl(publicId, sizes[size]);
}
