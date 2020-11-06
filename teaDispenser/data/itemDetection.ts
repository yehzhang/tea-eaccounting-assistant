import { readdirSync } from 'fs';
import * as _ from 'lodash';
import {
  CV_8U,
  imread,
  imreadAsync,
  imwriteAsync,
  Mat,
  Point2,
  Rect,
  THRESH_TOZERO,
  TM_CCOEFF_NORMED,
} from 'opencv4nodejs';
import { join } from 'path';
import { createScheduler, createWorker, PSM, RecognizeResult, Scheduler } from 'tesseract.js';
import { tempDirectory } from './tempDirectory';

export async function recognizeItems(imagePath: string): Promise<readonly RecognizedItemStack[]> {
  console.debug('Recognizing image:', imagePath);

  const image = await imreadAsync(imagePath);

  const uiWidth = getUiWidth(image);
  const itemsImage = image.getRegion(getItemsRegionInInventoryImage(image, uiWidth));

  const [itemAmounts, languageRecognizer] = await Promise.all([
    matchBestItemAmounts(itemsImage),
    detectLanguage(imagePath),
  ]);

  return recognizeItemStacks(languageRecognizer, itemsImage, itemAmounts, uiWidth);
}

function getUiWidth(image: Mat): number {
  // Inventory UI has a maximum width of 2150 when the screen has a height of 1125.
  return Math.min(image.rows * 86 / 45, image.cols);
}

function getItemsRegionInInventoryImage(image: Mat, uiWidth: number): Rect {
  const leftBarWidthRatio = 0.22;
  const itemsWindowWidth = uiWidth * (1 - leftBarWidthRatio);
  // The items window's height is ~73% of the screen's height.
  const itemsWindowHeight = image.rows * 0.73;
  const x = (image.cols - uiWidth) / 2 + uiWidth * leftBarWidthRatio;
  // The title bar's height is ~10.3% of the screen's height.
  const y = image.rows * 0.103;
  return new Rect(Math.round(x), Math.round(y), Math.round(itemsWindowWidth), Math.round(itemsWindowHeight));
}

async function recognizeItemStacks(languageRecognizer: Scheduler, image: Mat, itemAmounts: readonly TemplateMatchingResult[], uiWidth: number): Promise<RecognizedItemStack[]> {
  const itemWidth = uiWidth * 3 / 16;
  const itemHeight = itemWidth / 1.55;
  const itemStacks = await Promise.all(itemAmounts.map(async (itemAmount): Promise<[TemplateMatchingResult, string] | null> => {
    const itemNameImage = getItemNameImage(image, itemAmount.location, itemWidth, itemHeight);
    if (!itemNameImage) {
      return null;
    }

    const itemNameImagePath = join(tempDirectory, `tmp_${Math.random().toString().slice(2)}.png`);
    await imwriteAsync(itemNameImagePath, itemNameImage);

    const itemName = await recognizeItemName(languageRecognizer, itemNameImagePath);
    if (!itemName) {
      return null;
    }
    return [itemAmount, itemName];
  }));
  return _.compact(itemStacks).map(([itemAmount, itemName]) => ({
    name: itemName,
    amount: itemAmount.text,
  }));
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
  const { data } = await (await languageDetector).addJob('detect', imagePath);
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

function getItemNameImage(image: Mat, itemAmountLocation: Point2, itemWidth: number, itemHeight: number): Mat | null {
  const itemNameX = itemAmountLocation.x - 10;
  const safeItemNameX = Math.max(itemNameX, 0);
  const itemNameY = itemAmountLocation.y + 43 - itemHeight;
  if (itemNameY <= -20) {
    // The item name must have gone beyond the top border of the image. Do not try to recognize.
    return null;
  }
  if (itemAmountLocation.y <= itemNameY) {
    console.error('Expected item name above item amount');
    return null;
  }
  const safeItemNameY = Math.min(Math.max(itemNameY, 0), image.rows);

  const itemNameHeight = itemHeight * 0.211;
  const safeItemNameWidth = Math.min(itemNameX + itemWidth, image.cols) - itemNameX;
  const safeItemNameHeight = Math.min(itemNameY + itemNameHeight, image.rows) - itemNameY;

  const rect = new Rect(safeItemNameX, Math.round(safeItemNameY), Math.round(safeItemNameWidth), Math.round(safeItemNameHeight));
  return image.getRegion(rect);
}

/** Returns an empty string if failed to recognize anything. */
async function recognizeItemName(languageRecognizer: Scheduler, itemNameImagePath: string): Promise<string> {
  const { data }: RecognizeResult = await languageRecognizer.addJob('recognize', itemNameImagePath) as any;

  const confidentText = _.compact(data.words
      .map(word => word.symbols
          .filter(symbol => minRecognizingConfidence <= symbol.confidence)
          .map(symbol => symbol.text)
          .join('')))
      .join(' ');
  const cleanText = _.trimEnd(confidentText, ` ‘\n\t'",/#!$%^&*;:{}=-_\`~()[]{}\\`)
      .replace(/[丨|]/g, 'I')
      .replace(/‖/g, 'II');

  console.dir({
    rawText: data.text,
    confidence: data.confidence,
    itemNameImagePath,
    wordsChoices: data.words.map(word => word.choices),
    cleanText,
    // symbolsChoices: data.symbols.map(symbol => symbol.choices),
  }, {
    depth: null,
  });

  if (data.confidence < minRecognizingConfidence) {
    return '';
  }
  return cleanText;
}

// If 70, it can filter out invalid names like '|中型'. However, it may filter out valid names, too.
const minRecognizingConfidence = 65;

/** Item amounts are sorted by their visual positions. */
async function matchBestItemAmounts(image: Mat): Promise<TemplateMatchingResult[]> {
  const matchedItemAmountResultsChoices: TemplateMatchingResult[][] = await Promise.all(
      Array.from(characterTemplatesChoices.values())
          .map((characterTemplates) => matchItemAmounts(image, characterTemplates)));
  return _.maxBy(matchedItemAmountResultsChoices, matchedItemAmountResults =>
      matchedItemAmountResults.length * 1e6 + _.sumBy(matchedItemAmountResults, ({ confidence }) => confidence),
  )!.sort((itemAmount, otherItemAmount) => {
    // Sort items by position.
    const { x, y } = itemAmount.location;
    const { x: otherX, y: otherY } = otherItemAmount.location;
    const row = y - otherY;
    if (maxSameWordCharactersDistance <= Math.abs(row)) {
      return row;
    }
    return x - otherX;
  });
}

async function matchItemAmounts(image: Mat, templates: TemplateSet): Promise<TemplateMatchingResult[]> {
  const matchedCharacterResults = await Promise.all(Array.from(templates.entries()).map(([text, template]) => matchItemAmountCharacter(image, template, text)));
  // Deduplicate different matches from different characters.
  const dedupedCharacterResults = selectMostConfidentResultPerCluster(matchedCharacterResults.flat());
  return clusterAdjacentItems(dedupedCharacterResults, maxSameWordCharactersDistance)
      .map(sameItemCluster => ({
        location: sameItemCluster[0].location,
        text: sameItemCluster.map(({ text }) => text).join(''),
        confidence: Math.min(...sameItemCluster.map(({ confidence }) => confidence)),
      }));
}

async function matchItemAmountCharacter(image: Mat, template: Mat, text: string): Promise<TemplateMatchingResult[]> {
  const matched = await image.matchTemplateAsync(template, TM_CCOEFF_NORMED);

  const threshold = 0.83;
  const significanceMatrix = await matched.thresholdAsync(threshold, NaN, THRESH_TOZERO);
  const significanceMatrix8U = await significanceMatrix.convertToAsync(CV_8U);
  const significantLocations = await significanceMatrix8U.findNonZeroAsync();

  // Deduplicate different matches from the same character.
  return selectMostConfidentResultPerCluster(significantLocations.map((location) => ({
    location,
    text,
    confidence: significanceMatrix.at(location.y, location.x),
  })));
}

function selectMostConfidentResultPerCluster(results: readonly TemplateMatchingResult[]): TemplateMatchingResult[] {
  return clusterAdjacentItems(results, maxDuplicateCharactersDistance)
      .map(cluster => _.maxBy(cluster, ({ confidence }) => confidence)!)
}

const maxDuplicateCharactersDistance = 2;
const maxSameWordCharactersDistance = 30;

/**
 * Assumes items are either less than the specified threshold of pixels apart or super far away.
 * This is the case for duplicate or consecutive characters in template matching.
 *
 * Items in a cluster are guaranteed to be sorted by `location.x`.
 */
function clusterAdjacentItems<T extends { location: Point2 }>(items: readonly T[], threshold: number): readonly T[][] {
  const sets: T[][] = [];
  const sortedItems = _.sortBy(items, ({ location }) => location.x);
  for (const item of sortedItems) {
    const setToUnion = sets.find(set =>
        set.find(element => element.location.sub(item.location).norm() <= threshold),
    );
    if (setToUnion) {
      setToUnion.push(item);
    } else {
      sets.push([item]);
    }
  }
  return sets;
}

interface TemplateMatchingResult {
  readonly location: Point2;
  readonly text: string;
  // Range: [0, 1]
  readonly confidence: number;
}

export interface RecognizedItemStack {
  readonly name: string;
  readonly amount: string;
}

const characterTemplatesChoices: TemplateSetChoices = (() => {
  const templateDirectory = join(__dirname, 'amountTemplate');
  const templateFilenames = readdirSync(templateDirectory);

  const choices = new Map();
  for (const templateFilename of templateFilenames) {
    const filenameSegments = templateFilename.split('.')[0].split('_');
    if (filenameSegments.length !== 3) {
      continue;
    }
    const [title, character, fontSize] = filenameSegments;
    if (title !== 'tmpl') {
      continue;
    }

    const templatePath = join(templateDirectory, templateFilename);
    const template = imread(templatePath);

    let characterTemplates = choices.get(fontSize);
    if (!characterTemplates) {
      characterTemplates = new Map();
      choices.set(fontSize, characterTemplates);
    }

    characterTemplates.set(character, template);
  }

  if (!choices.size) {
    console.error('Expected amount templates');
  }

  return choices;
})();

type TemplateSetChoices = ReadonlyMap<FontSize, TemplateSet>;
type TemplateSet = ReadonlyMap<Text, Mat>;
type Text = string;
type FontSize = string;

let schedulers: {
  languageDetector: Promise<Scheduler>,
  chineseRecognizer: Promise<Scheduler>,
  englishRecognizer: Promise<Scheduler>,
} | null = null;

export function setupTesseract() {
  async function createMonolingualScheduler(language: string, pageSegMode: PSM): Promise<Scheduler> {
    const worker = createWorker({
      langPath: join(__dirname, '../../training/outputTessdata'),
      gzip: false,
    });
    await worker.load();
    await worker.loadLanguage(language);
    await worker.initialize(language);
    await worker.setParameters({
      tessedit_pageseg_mode: pageSegMode,
      user_defined_dpi: '72',
    });

    const scheduler = createScheduler();
    scheduler.addWorker(worker);

    return scheduler;
  }

  schedulers = {
    languageDetector: createMonolingualScheduler('chi_sim', PSM.SPARSE_TEXT_OSD),
    chineseRecognizer: createMonolingualScheduler('chi_sim', PSM.SPARSE_TEXT),
    englishRecognizer: createMonolingualScheduler('eng', PSM.SPARSE_TEXT),
  };

  return schedulers;
}
