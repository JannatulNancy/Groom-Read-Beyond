/**
 * Image URL normalization utility
 * Ensures images resolve correctly across both Vite dev server and published static builds.
 */
export function normalizeImageUrl(url: string | undefined | null, fallback = ''): string {
  if (!url) return fallback;
  let clean = url.trim();

  // If base64 data URI, keep it directly
  if (clean.startsWith('data:image/')) return clean;

  // Modernize legacy asset paths to public web paths
  if (clean.startsWith('/src/assets/images/')) {
    clean = clean.replace('/src/assets/images/', '/images/');
  } else if (clean.startsWith('src/assets/images/')) {
    clean = clean.replace('src/assets/images/', '/images/');
  }

  // Handle known renamed or spaced image filenames
  if (clean === '/images/Kite .jpg') clean = '/images/Kite.jpg';
  if (clean === '/images/As long As.jpg') clean = '/images/As_long_As.jpg';
  if (clean === "/images/I don't love.jpg" || clean === "public/images/I don't love.jpg") clean = '/images/I_dont_love.jpg';
  if (clean === '/images/Main Pic.png') clean = '/images/Main_Pic.png';

  return clean;
}
