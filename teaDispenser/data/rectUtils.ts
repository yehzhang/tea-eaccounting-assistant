import { Rect } from 'opencv4nodejs';

export function getCenterY({ y, height }: Rect): number {
  return y + height / 2;
}

function getMaxX({ x, width }: Rect): number {
  return x + width;
}

function getMaxY({ y, height }: Rect): number {
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

export function getArea({
  width,
  height,
}: {
  readonly width: number;
  readonly height: number;
}): number {
  return width * height;
}
