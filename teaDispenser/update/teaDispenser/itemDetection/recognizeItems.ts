import { imreadAsync, Mat } from 'opencv4nodejs';
import { Scheduler } from 'tesseract.js';
import RecognizedItem from '../../../data/RecognizedItem';
import { TesseractContext } from '../../../external/ExternalContext';
import locateItemStacks, { LocatedItemStack } from './locateItemStacks';
import recognizeDigit from './recognizeDigit';
import recognizeItemIcon from './recognizeItemIcon';
import recognizeText from './recognizeText';
import removeFactionSuperscript from './removeFactionSuperscript';

async function recognizeItems(
  imagePath: string,
  schedulers: TesseractContext
): Promise<readonly Promise<RecognizedItem | null>[]> {
  console.debug('Recognizing image:', imagePath);

  const image = await imreadAsync(imagePath);
  const locatedItemStacks = await locateItemStacks(image);
  return locatedItemStacks.map((locatedItemStack) =>
    recognizeItemStack(image, locatedItemStack, schedulers.chineseRecognizer)
  );
}

async function recognizeItemStack(
  image: Mat,
  locatedItemStack: LocatedItemStack,
  languageRecognizer: Scheduler
): Promise<RecognizedItem | null> {
  const { itemStackBoundingBox, nameBoundingRect, amountDigitBoundingRects } = locatedItemStack;
  const [name, amountDigits] = await Promise.all([
    removeFactionSuperscript(image.getRegion(nameBoundingRect)).then((itemNameImage) =>
      recognizeText(languageRecognizer, itemNameImage)
    ),
    Promise.all(
      amountDigitBoundingRects.map((boundingRects) =>
        recognizeDigit(image.getRegion(boundingRects))
      )
    ),
  ]);
  const amount = Number(amountDigits.join(''));
  if (!name && isNaN(amount)) {
    return null;
  }
  return {
    name,
    amount: isNaN(amount) ? null : amount,
    findIcon: (itemType) => recognizeItemIcon(image.getRegion(itemStackBoundingBox), itemType),
  };
}

export default recognizeItems;
