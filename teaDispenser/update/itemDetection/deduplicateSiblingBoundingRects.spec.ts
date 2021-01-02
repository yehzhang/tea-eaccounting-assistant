import { Rect } from 'opencv4nodejs';
import deduplicateSiblingBoundingRects from './deduplicateSiblingBoundingRects';

describe('deduplicateSiblingBoundingRects', () => {
  it('works', async () => {
    const actual = deduplicateSiblingBoundingRects([
      new Rect(12, 228, 20, 29),
      new Rect(16, 234, 10, 13),
      new Rect(12, 228, 20, 29),
      new Rect(58, 227, 19, 30),
      new Rect(58, 227, 19, 30),
      new Rect(61, 243, 13, 12),
      new Rect(61, 243, 13, 12),
      new Rect(61, 230, 12, 11),
      new Rect(61, 230, 12, 11),
      new Rect(36, 227, 18, 30),
      new Rect(36, 227, 18, 30),
      new Rect(39, 243, 12, 12),
      new Rect(39, 243, 12, 12),
      new Rect(58, 224, 1, 2),
    ]);

    expect(actual).toEqual([
      new Rect(12, 228, 20, 29),
      new Rect(36, 227, 18, 30),
      new Rect(58, 227, 19, 30),
      new Rect(58, 224, 1, 2),
    ]);
  });
});
