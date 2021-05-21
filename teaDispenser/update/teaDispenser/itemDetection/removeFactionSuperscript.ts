import cv, { Mat } from 'opencv4nodejs';
import getPathRelativeToFileDirname from './getPathRelativeToFileDirname';
import resizeHeightTo from './resizeHeightTo';

async function removeFactionSuperscript(itemNameImage: Mat): Promise<Mat> {
  const resizedMask = await resizeHeightTo(
    itemNameImage.rows * 1.35,
    factionFlagMask,
    cv.INTER_NEAREST
  );

  const maskHeight = Math.min(resizedMask.rows, itemNameImage.rows);
  const croppedMask = await resizedMask.getRegion(
    new cv.Rect(/* x= */ 0, /* y= */ 0, resizedMask.cols, maskHeight)
  );

  const maskLeftPadding = Math.max(itemNameImage.cols - resizedMask.cols, 0);
  const black = new cv.Vec3(0, 0, 0);
  const paddedMask = await croppedMask.copyMakeBorderAsync(
    /* top= */ 0,
    /* bottom= */ 0,
    maskLeftPadding,
    /* right= */ 0,
    cv.BORDER_CONSTANT,
    black
  );

  const itemNameBackgroundColor = new cv.Vec3(65, 61, 52);
  return itemNameImage.setToAsync(itemNameBackgroundColor, paddedMask);
}

const factionFlagMask = cv.imread(
  getPathRelativeToFileDirname(import.meta.url, 'template/tmpl_faction_superscript_mask.png')
);

export default removeFactionSuperscript;
