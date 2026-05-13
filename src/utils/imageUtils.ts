export function validarImagen(file: File): { valida: boolean; error?: string } {
  const tiposAceptados = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!tiposAceptados.includes(file.type.toLowerCase())) {
    return { valida: false, error: 'Formato no soportado. Usa JPG, PNG, WEBP o HEIC.' };
  }
  const maxMB = 50;
  if (file.size > maxMB * 1024 * 1024) {
    return { valida: false, error: `La imagen es demasiado grande (máx ${maxMB}MB).` };
  }
  return { valida: true };
}

export async function comprimirImagen(
  file: File,
  opciones: { maxWidth?: number; maxHeight?: number; calidad?: number; formato?: 'image/jpeg' | 'image/webp' } = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1600, calidad = 0.82 } = opciones;
  const formato = opciones.formato ?? (document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg');

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);

      let result = canvas.toDataURL(formato, calidad);
      // If >2MB, retry at lower quality
      if (result.length > 2 * 1024 * 1024 * 1.37) {
        result = canvas.toDataURL(formato, 0.65);
      }
      resolve(result);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error loading image')); };
    img.src = url;
  });
}
