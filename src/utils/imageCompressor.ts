/**
 * Client-side image compressor utility
 * Resizes large smartphone/camera photos on an HTML5 canvas and converts to optimized JPEG.
 * This keeps the Base64 representation tiny (under 120KB vs 8MB+ raw) so it saves seamlessly
 * into browser localStorage without hitting QuotaExceededError.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1280,
  maxHeight = 960,
  quality = 0.8
): Promise<{ dataUrl: string; originalSizeKb: number; compressedSizeKb: number }> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading file'));
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Failed loading image for compression'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({
            dataUrl: rawResult,
            originalSizeKb,
            compressedSizeKb: Math.round((rawResult.length * 0.75) / 1024),
          });
        }

        // High quality bicubic scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSizeKb = Math.round((compressedDataUrl.length * 0.75) / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeKb,
          compressedSizeKb,
        });
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an instant, ultra-low-resolution micro placeholder (~48x36, <2KB)
 * in <10ms to show immediate visual feedback without blocking the UI thread.
 */
export async function generateLowResPlaceholder(
  file: File,
  maxWidth = 48,
  maxHeight = 36,
  quality = 0.25
): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve('');
    }

    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      const img = new Image();
      img.onerror = () => resolve('');
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(rawResult);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  });
}

