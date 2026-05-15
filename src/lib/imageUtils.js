import imageCompression from 'browser-image-compression';

/**
 * Compresses and resizes an image file.
 * @param {File} file - The original image file.
 * @param {number} maxWidthOrHeight - The maximum width or height.
 * @returns {Promise<File>} - A promise that resolves to the compressed image file.
 */
export const compressImage = async (file, maxWidthOrHeight = 1024) => {
  // If it's not an image, just return the file
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options = {
    maxSizeMB: 0.5, // Target size 500KB
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp' // Convert to WebP for better compression
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Create a new file from the blob, changing the extension to .webp
    const fileName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const compressedFile = new File([compressedBlob], `${fileName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file; // Fallback to original file on error
  }
};

/**
 * @deprecated Use compressImage instead.
 * Maintaining for compatibility during migration.
 */
export const resizeImage = async (file, maxDimension = 500, quality = 0.8) => {
  return compressImage(file, maxDimension);
};

