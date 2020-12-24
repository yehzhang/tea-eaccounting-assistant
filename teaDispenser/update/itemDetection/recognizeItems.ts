import { stat, unlink } from 'fs/promises';
import * as _ from 'lodash';
import { Mat, Rect } from 'opencv4nodejs';
import { join } from 'path';
import { createScheduler, createWorker, PSM, Scheduler } from 'tesseract.js';
import RecognizedItem from '../../data/RecognizedItem';
import { containRect, getCenterY } from '../../data/rectUtils';
import locateItemStacks, { LocatedObject } from './locateItemStacks';
import recognizeDigit from './recognizeDigit';
import recognizeItemIcon from './recognizeItemIcon';
import { recognizeText } from './recognizeText';
import removeFactionSuperscript from './removeFactionSuperscript';

export async function recognizeItems(imagePath: string): Promise<readonly RecognizedItem[]> {
  console.debug('Recognizing image:', imagePath);

  const [locatedItemStacks, languageRecognizer] = await Promise.all([
    locateItemStacks(imagePath),
    detectLanguage(imagePath),
  ]);

  const recognizedItemStacks = await Promise.all(locatedItemStacks
      .map((locatedItemStack => recognizeItemStack(locatedItemStack, languageRecognizer))));
  return recognizedItemStacks.filter(({ name, amount }) => name || amount);
}

async function recognizeItemStack(locatedItemStack: LocatedObject, languageRecognizer: Scheduler): Promise<RecognizedItem> {
  const { image, boundingRects } = locatedItemStack;
  const [name, amount] = await Promise.all([
    removeFactionSuperscript(getItemNameImage(image))
        .then(itemNameImage => recognizeText(languageRecognizer, itemNameImage)),
    Promise.all(getItemAmountDigitImages(image, boundingRects).map(recognizeDigit))
        .then(amountDigits => amountDigits.join('')),
  ]);
  return {
    name,
    amount,
    findIcon: (itemType) => recognizeItemIcon(image, itemType),
  };
}

function getItemAmountDigitImages(image: Mat, boundingRects: readonly Rect[]): readonly Mat[] {
  const amountBoundingRect = getItemAmountBoundingRect(image);
  const amountCenterY = getCenterY(amountBoundingRect);
  return removeContainingSiblingBoundingRects(
      boundingRects
          .filter(boundingRect => containRect(boundingRect, amountBoundingRect) &&
              // Choose only rects close to the horizontal center.
              Math.abs(getCenterY(boundingRect) - amountCenterY) <= amountBoundingRect.height * 0.2))
      .map(boundingRect => image.getRegion(boundingRect));
}

/** Guarantees the returned `boundingRects` to be sorted by `x`. */
function removeContainingSiblingBoundingRects(boundingRects: readonly Rect[]): readonly Rect[] {
  const sortedBoundingRects = _.sortBy(boundingRects, ({ x }) => x);
  let boundingRectIndex = 1;
  while (boundingRectIndex < sortedBoundingRects.length) {
    const previousBoundingRect = sortedBoundingRects[boundingRectIndex - 1];
    const boundingRect = sortedBoundingRects[boundingRectIndex];
    if (containRect(previousBoundingRect, boundingRect)) {
      sortedBoundingRects.splice(boundingRectIndex - 1, 1);
      continue;
    }
    if (containRect(boundingRect, previousBoundingRect)) {
      sortedBoundingRects.splice(boundingRectIndex, 1);
      continue;
    }

    boundingRectIndex++;
  }
  return sortedBoundingRects;
}

async function detectLanguage(imagePath: string): Promise<Scheduler> {
  if (!schedulers) {
    throw new TypeError('Expected Tesseract to be setup');
  }

  const {
    languageDetector,
    chineseRecognizer,
    englishRecognizer,
  } = schedulers;
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
}

function getItemNameImage(itemStackImage: Mat): Mat {
  const padding = 2;
  const height = Math.round(itemStackImage.rows * 0.211);
  const itemNameRect = new Rect(padding, padding, itemStackImage.cols - padding * 2, height - padding * 2);
  return itemStackImage.getRegion(itemNameRect);
}

function getItemAmountBoundingRect(itemStackImage: Mat): Rect {
  const padding = 2;
  const width = Math.round(itemStackImage.cols * 0.21);
  const height = Math.round(itemStackImage.rows * 0.186);
  return new Rect(padding, itemStackImage.rows - height - padding, width - padding, height);
}

let schedulers: {
  languageDetector: Scheduler,
  chineseRecognizer: Scheduler,
  englishRecognizer: Scheduler,
} | null = null;

export async function setupTesseract() {
  async function createMonolingualScheduler(language: string, pageSegMode: PSM, tessedit_char_whitelist?: string): Promise<Scheduler> {
    const worker = createWorker({
      langPath: join(__dirname, '../../../training/outputTessdata'),
      gzip: false,
    });
    await worker.load();
    await worker.loadLanguage(language);
    await worker.initialize(language);
    await worker.setParameters({
      tessedit_pageseg_mode: pageSegMode,
      tessedit_char_whitelist,
    });

    const scheduler = createScheduler();
    scheduler.addWorker(worker);

    return scheduler;
  }

  const trainedDataFilenames = [
    'chi_sim.traineddata',
    'eng.traineddata',
  ];
  await Promise.all(trainedDataFilenames.map(async (filename) => {
    const path = join(__dirname, '../../../', filename);
    try {
      await stat(path);
    } catch {
      return;
    }
    await unlink(path);
  }));

  const [languageDetector, chineseRecognizer, englishRecognizer] = await Promise.all([
    createMonolingualScheduler('chi_sim', PSM.SPARSE_TEXT_OSD),
    createMonolingualScheduler('chi_sim', PSM.SINGLE_LINE),
    createMonolingualScheduler('eng', PSM.SINGLE_LINE),
  ]);

  schedulers = {
    languageDetector,
    chineseRecognizer,
    englishRecognizer,
  };

  return schedulers;
}