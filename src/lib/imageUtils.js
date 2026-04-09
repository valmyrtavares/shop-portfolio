/**
 * Resizes an image file if it exceeds a maximum dimension.
 * @param {File} file - The original image file.
 * @param {number} maxDimension - The maximum width or height.
 * @param {number} quality - JPEG compression quality (0 to 1).
 * @returns {Promise<File>} - A promise that resolves to the resized image file.
 */
export const resizeImage = (file, maxDimension = 500, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // If it's not an image, just return the file
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(new Error('Image load failed'));
    };
    reader.onerror = (err) => reject(new Error('File reading failed'));
  });
};
