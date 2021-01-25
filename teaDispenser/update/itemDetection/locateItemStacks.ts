import _ from 'lodash';
import {
  CHAIN_APPROX_SIMPLE,
  CHAIN_APPROX_TC89_KCOS,
  Contour,
  Mat,
  Rect,
  RETR_LIST,
  RETR_TREE,
} from 'opencv4nodejs';
import { containRect, getArea, getCenterY, RectLike } from '../../data/rectUtils';
import deduplicateSiblingBoundingRects from './deduplicateSiblingBoundingRects';

async function locateItemStacks(image: Mat): Promise<readonly LocatedItemStack[]> {
  // The low threshold should not be lower than ~250, or adjacent contours may merge.
  // The low threshold should not be higher than ~270, or the same contour may split.
  // The high threshold should not be too high, or lossy image may not be recognized.
  const digitEdges = await image.cannyAsync(260, 300, 3, true);
  const digitContours = await digitEdges.findContoursAsync(RETR_LIST, CHAIN_APPROX_TC89_KCOS);
  const digitBoundingRects = digitContours.map((contour) => contour.boundingRect());

  // The low threshold should not be lower than ~1450, or there may be false positives.
  // The low threshold should not be higher than ~1500, or borders in lossy images may not be recognized.
  const itemStackEdges = await image.cannyAsync(1450, 3200, 5);
  const itemStackContours = await itemStackEdges.findContoursAsync(RETR_TREE, CHAIN_APPROX_SIMPLE);
  const maxItemStackContourArea = Math.max(
    ...itemStackContours.filter(isContourItemShaped).map(getContourArea)
  );
  return itemStackContours
    .filter((contour) => {
      const {
        hierarchy: { z: parentIndex },
      } = contour;
      return (
        // Exterior contours
        parentIndex === -1 &&
        // In similar shape and area
        isContourItemShaped(contour) &&
        maxItemStackContourArea * 0.9 <= getContourArea(contour)
      );
    })
    .map((contour) => contour.boundingRect())
    .sort(({ x, y }, { x: otherX, y: otherY }) => {
      // Sort rects by their positions.
      const deltaY = y - otherY;
      if (Math.abs(deltaY) <= 4) {
        return x - otherX;
      }
      return deltaY;
    })
    .map((itemStackBoundingBox) => ({
      itemStackBoundingBox,
      nameBoundingRect: getItemNameBoundingRect(itemStackBoundingBox),
      amountDigitBoundingRects: getItemAmountDigitBoundingRects(
        itemStackBoundingBox,
        digitBoundingRects
      ),
    }));
}

function isContourItemShaped(contour: Contour): boolean {
  const { angle, size } = contour.minAreaRect();
  const orthogonalAngleThreshold = 1;
  if (orthogonalAngleThreshold < angle + 90 && orthogonalAngleThreshold < -angle) {
    return false;
  }

  const normalizedMinAreaRect = angle === -90 ? { width: size.height, height: size.width } : size;
  return isRectItemShaped(normalizedMinAreaRect) && isRectItemShaped(contour.boundingRect());
}

function isRectItemShaped({ width, height }: RectLike): boolean {
  return (
    100 <= height &&
    153 <= width &&
    // The ratio is roughly 1.55.
    // The upper threshold should not be lower than ~1.63, or overflown items may not be recognized.
    _.inRange(width / height, 1.5, 1.63)
  );
}

function getContourArea(contour: Contour): number {
  // The contour may be open, so do not directly use `contour.area` which can be close to zero.
  return getArea(contour.minAreaRect().size);
}

export interface LocatedItemStack {
  readonly itemStackBoundingBox: Rect;
  readonly nameBoundingRect: Rect;
  readonly amountDigitBoundingRects: readonly Rect[];
}

function getItemNameBoundingRect(itemStackBoundingBox: Rect): Rect {
  const padding = 2;
  const height = Math.round(itemStackBoundingBox.height * 0.211);
  return new Rect(
    itemStackBoundingBox.x + padding,
    itemStackBoundingBox.y + padding,
    itemStackBoundingBox.width - padding * 2,
    height - padding * 2
  );
}

function getItemAmountDigitBoundingRects(
  itemStackBoundingBox: Rect,
  boundingRects: readonly Rect[]
): readonly Rect[] {
  const amountBoundingRect = getItemAmountBoundingRect(itemStackBoundingBox);
  const amountCenterY = getCenterY(amountBoundingRect);
  const rects = deduplicateSiblingBoundingRects(
    boundingRects.filter((boundingRect) => containRect(boundingRect, amountBoundingRect))
  ).filter(
    (boundingRect) =>
      // The rect should be close to the horizontal center.
      Math.abs(getCenterY(boundingRect) - amountCenterY) <= amountBoundingRect.height * 0.2
  );
  const maxRectArea = Math.max(...rects.map(getArea));
  return rects.filter((rect) => maxRectArea * 0.5 <= getArea(rect));
}

function getItemAmountBoundingRect(itemStackBoundingBox: Rect): Rect {
  const padding = 2;
  const width = Math.round(itemStackBoundingBox.width * 0.21);
  const height = Math.round(itemStackBoundingBox.height * 0.186);
  return new Rect(
    itemStackBoundingBox.x + padding,
    itemStackBoundingBox.y + itemStackBoundingBox.height - height - padding,
    width - padding,
    height
  );
}

export default locateItemStacks;
