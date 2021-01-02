import * as _ from 'lodash';
import { Rect } from 'opencv4nodejs';
import { intersectRect } from '../../data/rectUtils';

/** Guarantees the returned `boundingRects` to be sorted by `x`. */
function deduplicateSiblingBoundingRects(rects: readonly Rect[]): readonly Rect[] {
  const rectSets: Rect[] = [];
  const sortedRects = _.sortBy(rects, ({ x }) => x);
  for (const rect of sortedRects) {
    const setToUnionIndex = rectSets.findIndex((rectSet) => intersectRect(rectSet, rect));
    if (setToUnionIndex !== -1) {
      rectSets[setToUnionIndex] = rectSets[setToUnionIndex].or(rect);
    } else {
      rectSets.push(rect);
    }
  }
  return rectSets;
}

export default deduplicateSiblingBoundingRects;
