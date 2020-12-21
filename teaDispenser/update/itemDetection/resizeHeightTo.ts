import { INTER_CUBIC, Mat } from 'opencv4nodejs';

async function resizeHeightTo(maxHeight: number, image: Mat, interpolation = INTER_CUBIC): Promise<Mat> {
  const scale = maxHeight / image.rows;
  return image.resizeAsync(
      Math.round(image.rows * scale),
      Math.round(image.cols * scale),
      scale,
      scale,
      interpolation,
  );
}

export default resizeHeightTo;
