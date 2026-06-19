// Inserts Cloudinary delivery transformations (auto format/quality + width cap)
// into a Cloudinary secure_url so thumbnails don't download full-size originals.
// Non-Cloudinary URLs (placeholders, blobs, etc.) are returned unchanged.
export function optimizeImageUrl(url, width) {
  if (!url || typeof url !== 'string') return url

  const marker = '/upload/'
  const index = url.indexOf(marker)
  if (index === -1 || !url.includes('res.cloudinary.com')) return url

  const insertAt = index + marker.length
  const transform = `f_auto,q_auto${width ? `,w_${width}` : ''}/`
  return url.slice(0, insertAt) + transform + url.slice(insertAt)
}
