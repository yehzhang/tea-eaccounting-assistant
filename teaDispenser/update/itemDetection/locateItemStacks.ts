import { CHAIN_APPROX_SIMPLE, Contour, Mat, Rect, RETR_TREE } from 'opencv4nodejs';
import { containRect, getArea, getCenterY } from '../../data/rectUtils';
import deduplicateSiblingBoundingRects from './deduplicateSiblingBoundingRects';

async function locateItemStacks(image: Mat): Promise<readonly LocatedItemStack[]> {
  const edges = await image.cannyAsync(1350, 3200, 5);
  const contours = await edges.findContoursAsync(RETR_TREE, CHAIN_APPROX_SIMPLE);

  const maxItemContourArea = Math.max(...contours.filter(isContourItemShaped).map(getContourArea));
  const allBoundingRects = contours.map((contour) => contour.boundingRect());
  return contours
    .filter((contour) => {
      const {
        hierarchy: { z: parentIndex },
      } = contour;
      return (
        // Exterior contours
        parentIndex === -1 &&
        // In similar shape and area
        isContourItemShaped(contour) &&
        maxItemContourArea * 0.9 <= getContourArea(contour)
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
        allBoundingRects
      ),
    }));
}

function isContourItemShaped(contour: Contour): boolean {
  const { angle, size } = contour.minAreaRect();
  const orthogonalAngleThreshold = 1;
  if (orthogonalAngleThreshold < angle + 90 && orthogonalAngleThreshold < -angle) {
    return false;
  }

  const { width, height } = angle === -90 ? { width: size.height, height: size.width } : size;
  return 65 <= height && 100 <= width && height * 1.3 < width && width < height * 1.7;
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
  return rects.filter((rect) => maxRectArea * 0.8 <= getArea(rect));
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
