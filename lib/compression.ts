/**
 * Client-Side Canvas Compression Module
 * Compresses images in browser before sending to server.
 * Supports JPEG, PNG (preserves transparency), and WebP.
 */
export async function compressImage(file: File, quality = 0.82, maxWidth = 1920): Promise<File> {
  if (!file || !file.type.startsWith('image/')) return file;
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  try {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          const isPng = file.type === 'image/png';
          const isWebp = file.type === 'image/webp';
          const outputMime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: outputMime,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            outputMime,
            isPng ? undefined : quality
          );
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar untuk kompresi'));
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  } catch {
    // Fallback: return original file if compression fails
    return file;
  }
}

/**
 * Convert File to Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
