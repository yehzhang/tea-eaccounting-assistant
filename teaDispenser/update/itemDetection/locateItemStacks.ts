import _ from 'lodash';
import {
  CHAIN_APPROX_SIMPLE,
  CHAIN_APPROX_TC89_KCOS,
  Contour,
  Mat,
  Rect,
  RETR_LIST,
  RETR_TREE,
  Vec3,
} from 'opencv4nodejs';
import { containRect, getArea, getCenterY } from '../../data/rectUtils';
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
  const itemLookedBoundingRects = _.compact(
    await Promise.all(itemStackContours.map((contour) => getItemLookedBoundingRect(contour, image)))
  );
  const maxItemLookedBoundingRectArea = Math.max(...itemLookedBoundingRects.map(getArea));
  return itemLookedBoundingRects
    .filter((boundingRect) => maxItemLookedBoundingRectArea * 0.7 <= getArea(boundingRect))
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

async function getItemLookedBoundingRect(contour: Contour, image: Mat): Promise<Rect | null> {
  const {
    hierarchy: { z: parentIndex },
  } = contour;
  if (parentIndex !== -1) {
    return null;
  }

  const boundingRect = contour.boundingRect();
  const { width, height } = boundingRect;
  // The lowest aspect ratio of a complete item stack seen is 1.48.
  // The maximum upper bound should be ~2.1, or the activated ship will be recognized.
  if (!_.inRange(width / height, 1.1, 1.8)) {
    return null;
  }
  // Disallow ridiculous sizes.
  if (width < 153 || 800 <= width || 600 <= height) {
    return null;
  }

  const boundingImage = image.getRegion(boundingRect);
  const backgroundImage = await boundingImage.inRangeAsync(
    itemBackgroundColorLowerBound,
    itemBackgroundColorHigherBound
  );
  const backgroundPixelCount = await backgroundImage.countNonZeroAsync();
  // The maximum upper bound is 0.413.
  if (backgroundPixelCount / getArea(boundingRect) < 0.3) {
    return null;
  }
  return boundingRect;
}

const itemBackgroundColorLowerBound = new Vec3(82, 75, 64);
const itemBackgroundColorHigherBound = new Vec3(103, 100, 91);

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
