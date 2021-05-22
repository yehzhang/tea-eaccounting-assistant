import { Rect } from 'opencv4nodejs';

export function getCenterY({ y, height }: Rect): number {
  return y + height / 2;
}

export function getMaxX({ x, width }: Rect): number {
  return x + width;
}

export function getMaxY({ y, height }: Rect): number {
  return y + height;
}

export function containRect(rect: Rect, container: Rect): boolean {
  return (
    container.x <= rect.x &&
    container.y <= rect.y &&
    getMaxX(rect) <= getMaxX(container) &&
    getMaxY(rect) <= getMaxY(container)
  );
}

export function intersectRect(rect: Rect, other: Rect): boolean {
  return (
    rect.x <= getMaxX(other) &&
    other.x <= getMaxX(rect) &&
    rect.y <= getMaxY(other) &&
    other.y <= getMaxY(rect)
  );
}

export function getArea({ width, height }: RectLike): number {
  return width * height;
}

export interface RectLike {
  readonly width: number;
  readonly height: number;
}

export function areRectsOverlapping(rect: Rect, other: Rect, threshold: number): boolean {
  const intersectionArea = getIntersectionArea(rect, other);
  return Math.min(getArea(rect), getArea(other)) * threshold <= intersectionArea;
}

function getIntersectionArea(rect: Rect, other: Rect): number {
  const deltaX = Math.min(getMaxX(rect), getMaxX(other)) - Math.max(rect.x, other.x);
  const deltaY = Math.min(getMaxY(rect), getMaxY(other)) - Math.max(rect.y, other.y);
  return Math.max(deltaX, 0) * Math.max(deltaY, 0);
}
