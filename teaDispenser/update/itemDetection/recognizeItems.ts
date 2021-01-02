import { Mat, Rect } from 'opencv4nodejs';
import { Scheduler } from 'tesseract.js';
import RecognizedItem from '../../data/RecognizedItem';
import { containRect, getArea, getCenterY } from '../../data/rectUtils';
import { TesseractSchedulers } from '../../ExternalDependency';
import deduplicateSiblingBoundingRects from './deduplicateSiblingBoundingRects';
import locateItemStacks, { LocatedObject } from './locateItemStacks';
import recognizeDigit from './recognizeDigit';
import recognizeItemIcon from './recognizeItemIcon';
import recognizeText from './recognizeText';
import removeFactionSuperscript from './removeFactionSuperscript';

async function recognizeItems(
  imagePath: string,
  schedulers: TesseractSchedulers
): Promise<readonly Promise<RecognizedItem | null>[]> {
  console.debug('Recognizing image:', imagePath);

  const [locatedItemStacks, languageRecognizer] = await Promise.all([
    locateItemStacks(imagePath),
    detectLanguage(imagePath, schedulers),
  ]);

  return locatedItemStacks.map((locatedItemStack) =>
    recognizeItemStack(locatedItemStack, languageRecognizer)
  );
}

async function recognizeItemStack(
  locatedItemStack: LocatedObject,
  languageRecognizer: Scheduler
): Promise<RecognizedItem | null> {
  const { image, boundingRects } = locatedItemStack;
  const [name, amount] = await Promise.all([
    removeFactionSuperscript(getItemNameImage(image)).then((itemNameImage) =>
      recognizeText(languageRecognizer, itemNameImage)
    ),
    Promise.all(
      getItemAmountDigitImages(image, boundingRects).map(recognizeDigit)
    ).then((amountDigits) => amountDigits.join('')),
  ]);
  if (!name && !amount) {
    return null;
  }
  return {
    name,
    amount,
    findIcon: (itemType) => recognizeItemIcon(image, itemType),
  };
}

function getItemAmountDigitImages(image: Mat, boundingRects: readonly Rect[]): readonly Mat[] {
  const amountBoundingRect = getItemAmountBoundingRect(image);
  const amountCenterY = getCenterY(amountBoundingRect);
  const rects = deduplicateSiblingBoundingRects(
    boundingRects.filter((boundingRect) => containRect(boundingRect, amountBoundingRect))
  ).filter(
    (boundingRect) =>
      // The rect should be close to the horizontal center.
      Math.abs(getCenterY(boundingRect) - amountCenterY) <= amountBoundingRect.height * 0.2
  );
  const maxRectArea = Math.max(...rects.map(getArea));
  return rects
    .filter((rect) => maxRectArea * 0.8 <= getArea(rect))
    .map((boundingRect) => image.getRegion(boundingRect));
}

async function detectLanguage(
  imagePath: string,
  schedulers: TesseractSchedulers
): Promise<Scheduler> {
  const { languageDetector, chineseRecognizer, englishRecognizer } = schedulers;
  try {
    const { data } = await languageDetector.addJob('detect', imagePath);
    switch (data.script) {
      case 'Latin':
        console.debug('Detected English script');
        return englishRecognizer;
      case 'Han':
        console.debug('Detected Chinese script');
        return chineseRecognizer;
      default:
        console.error('Detected unknown language', data);
        return chineseRecognizer;
    }
  } catch (e) {
    console.warn('Failed to detect language:', e);
    return chineseRecognizer;
  }
}

function getItemNameImage(itemStackImage: Mat): Mat {
  const padding = 2;
  const height = Math.round(itemStackImage.rows * 0.211);
  const itemNameRect = new Rect(
    padding,
    padding,
    itemStackImage.cols - padding * 2,
    height - padding * 2
  );
  return itemStackImage.getRegion(itemNameRect);
}

function getItemAmountBoundingRect(itemStackImage: Mat): Rect {
  const padding = 2;
  const width = Math.round(itemStackImage.cols * 0.21);
  const height = Math.round(itemStackImage.rows * 0.186);
  return new Rect(padding, itemStackImage.rows - height - padding, width - padding, height);
}

export default recognizeItems;
