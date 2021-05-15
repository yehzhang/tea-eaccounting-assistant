import { Rect } from 'opencv4nodejs';
import deduplicateSiblingBoundingRects from './deduplicateSiblingBoundingRects';

describe('deduplicateSiblingBoundingRects', () => {
  it('deduplicates', () => {
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
    ]);

    expect(actual).toEqual([
      new Rect(12, 228, 20, 29),
      new Rect(36, 227, 18, 30),
      new Rect(58, 227, 19, 30),
    ]);
  });

  it('deduplicates containing rects', () => {
    const actual = deduplicateSiblingBoundingRects([
      new Rect(35, 797, 11, 14),
      new Rect(35, 797, 11, 14),
      new Rect(31, 792, 21, 27),
      new Rect(54, 792, 16, 29),
      new Rect(31, 792, 21, 28),
    ]);

    expect(actual).toEqual([new Rect(31, 792, 21, 28), new Rect(54, 792, 16, 29)]);
  });

  it('deduplicates slightly overlapping rects', () => {
    const actual = deduplicateSiblingBoundingRects([
      new Rect(280, 155, 4, 5),
      new Rect(282, 153, 3, 4),
      new Rect(283, 151, 3, 4),
      new Rect(284, 148, 3, 5),
      new Rect(278, 144, 11, 16),
      new Rect(267, 144, 11, 17),
    ]);

    expect(actual).toEqual([new Rect(267, 144, 11, 17), new Rect(278, 144, 11, 16)]);
  });

  it('deduplicates horizontally containing rects', () => {
    const actual = deduplicateSiblingBoundingRects([new Rect(0, 0, 4, 5), new Rect(1, 10, 3, 6)]);

    expect(actual).toEqual([new Rect(0, 0, 4, 16)]);
  });

  it('deduplicates horizontally containing rects spec 2', () => {
    const actual = deduplicateSiblingBoundingRects([
      new Rect(910, 822, 16, 3),
      new Rect(890, 822, 17, 3),
      new Rect(909, 796, 15, 26),
      new Rect(890, 796, 15, 26),
    ]);

    expect(actual).toEqual([new Rect(890, 796, 17, 29), new Rect(909, 796, 17, 29)]);
  });
});
