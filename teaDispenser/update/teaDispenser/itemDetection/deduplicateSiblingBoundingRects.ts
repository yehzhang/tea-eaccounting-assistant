import * as _ from 'lodash';
import { Rect } from 'opencv4nodejs';
import { areRectsOverlapping, getMaxX } from '../../../data/rectUtils';

/** Guarantees the returned `boundingRects` to be sorted by `x`. */
function deduplicateSiblingBoundingRects(rects: readonly Rect[]): readonly Rect[] {
  const rectSets: Rect[] = [];
  const sortedRects = _.sortBy(rects, ({ x }) => x);
  for (const rect of sortedRects) {
    const setToUnionIndex = rectSets.findIndex((rectSet) => canUnion(rectSet, rect));
    if (setToUnionIndex !== -1) {
      rectSets[setToUnionIndex] = rectSets[setToUnionIndex].or(rect);
    } else {
      rectSets.push(rect);
    }
  }
  return rectSets;
}

function canUnion(rect: Rect, other: Rect): boolean {
  return (
    horizontallyContain(rect, other) ||
    horizontallyContain(other, rect) ||
    areRectsOverlapping(rect, other, /* threshold= */ 0.2)
  );
}

function horizontallyContain(rect: Rect, container: Rect): boolean {
  const containingThreshold = rect.width * 0.15;
  return (
    container.x - containingThreshold <= rect.x &&
    getMaxX(rect) <= getMaxX(container) + containingThreshold
  );
}

export default deduplicateSiblingBoundingRects;
