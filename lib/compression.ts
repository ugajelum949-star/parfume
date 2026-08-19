/**
 * Client-Side Canvas Compression Module
 * Compresses images in browser before sending to server as base64.
 * Supports JPEG, PNG (preserves transparency), and WebP.
 */
export async function compressImage(file: File, quality = 0.82, maxWidth = 1920): Promise<string> {
  if (!file || !file.type.startsWith('image/')) return fileToBase64(file);
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return fileToBase64(file);

  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          if (img.width <= maxWidth) {
            // No resize needed — return original base64 directly
            resolve(event.target?.result as string);
            return;
          }

          const canvas = document.createElement('canvas');
          const height = Math.round((img.height * maxWidth) / img.width);
          canvas.width = maxWidth;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          const isPng = file.type === 'image/png';
          const isWebp = file.type === 'image/webp';
          const outputMime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

          ctx.drawImage(img, 0, 0, maxWidth, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(event.target?.result as string);
                return;
              }
              // Convert blob to base64 directly — no intermediate File object
              const reader2 = new FileReader();
              reader2.onload = () => resolve(reader2.result as string);
              reader2.onerror = () => resolve(event.target?.result as string);
              reader2.readAsDataURL(blob);
            },
            outputMime,
            isPng ? undefined : quality
          );
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar untuk kompresi'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
    });
  } catch {
    // Fallback: return original base64 if compression fails
    return fileToBase64(file);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
