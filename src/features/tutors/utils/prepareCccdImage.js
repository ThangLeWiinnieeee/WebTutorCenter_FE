const MAX_EDGE = 2400;
const MIN_EDGE = 1200;
const TARGET_SIZE = 1.75 * 1024 * 1024;
const JPEG_QUALITIES = [0.92, 0.86, 0.8, 0.74, 0.68];

const loadWithImageElement = async (file) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error("Invalid or unreadable image");
  }
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
};

const loadImage = async (file) => {
  if (typeof createImageBitmap !== "function") return loadWithImageElement(file);
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close() };
  } catch {
    return loadWithImageElement(file);
  }
};

const fitWithin = (width, height, edgeLimit) => {
  const scale = Math.min(1, edgeLimit / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const canvasToJpeg = (canvas, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image optimization failed"))),
      "image/jpeg",
      quality,
    );
  });

const toJpegName = (name) => `${name.replace(/\.[^.]+$/, "") || "cccd"}.jpg`;

// Applies EXIF orientation, strips metadata, and caps payload size before upload.
export const prepareCccdImage = async (file) => {
  const image = await loadImage(file);
  try {
    if (!image.width || !image.height) throw new Error("Invalid image dimensions");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Image processing is not supported");
    let edgeLimit = MAX_EDGE;
    while (edgeLimit >= MIN_EDGE) {
      const size = fitWithin(image.width, image.height, edgeLimit);
      canvas.width = size.width;
      canvas.height = size.height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, size.width, size.height);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image.source, 0, 0, size.width, size.height);
      for (const quality of JPEG_QUALITIES) {
        const blob = await canvasToJpeg(canvas, quality);
        if (blob.size <= TARGET_SIZE) {
          return new File([blob], toJpegName(file.name), {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
        }
      }
      if (Math.max(size.width, size.height) <= MIN_EDGE) break;
      edgeLimit = Math.max(MIN_EDGE, Math.floor(Math.max(size.width, size.height) * 0.82));
    }
    throw new Error("Please retake the photo closer to the card");
  } finally {
    image.cleanup();
  }
};
