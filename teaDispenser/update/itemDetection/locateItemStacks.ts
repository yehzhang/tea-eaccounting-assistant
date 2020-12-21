import { CHAIN_APPROX_SIMPLE, imreadAsync, Mat, Rect, RETR_TREE } from 'opencv4nodejs';
import { containRect } from '../../data/rectUtils';

async function locateItemStacks(imagePath: string): Promise<readonly LocatedObject[]> {
  const image = await imreadAsync(imagePath);
  const edges = await image.cannyAsync(115, 300);
  const contours = await edges.findContoursAsync(RETR_TREE, CHAIN_APPROX_SIMPLE);

  const maxItemContourArea = Math.max(...contours
      .filter(contour => isRectItemShaped(contour.boundingRect()))
      .map(({ area }) => area));
  const allBoundingRects = contours.map(contour => contour.boundingRect())
  return contours
      .filter((contour) => {
        // Exterior contours only.
        const { hierarchy: { z: parentIndex } } = contour;
        return parentIndex === -1;
      })
      .map(contour => contour.boundingRect())
      .filter(boundingRect => {
        const area = boundingRect.width * boundingRect.height;
        return maxItemContourArea * 0.9 <= area && isRectItemShaped(boundingRect);
      })
      .sort(({ x, y }, { x: otherX, y: otherY }) => {
        // Sort rects by their positions.
        const deltaY = y - otherY;
        if (Math.abs(deltaY) <= 4) {
          return x - otherX;
        }
        return deltaY;
      })
      .map(boundingRect => ({
        image: image.getRegion(boundingRect),
        boundingRects: allBoundingRects
            .filter(rect => containRect(rect, boundingRect))
            .map(rect => localize(rect, boundingRect)),
      }));
}

function isRectItemShaped({ height, width }: Rect): boolean {
  return 65 <= height && 100 <= width && height * 1.3 < width && width < height * 1.7;
}

function localize(rect: Rect, anchor: Rect): Rect {
  return new Rect(rect.x - anchor.x, rect.y - anchor.y, rect.width, rect.height);
}

export interface LocatedObject {
  readonly image: Mat;
  readonly boundingRects: readonly Rect[];
}

export default locateItemStacks;
