import * as _ from 'lodash';
import { join } from "path";
import { readNeoxJson } from '../data/readNeoxJson';
import { writeText } from '../data/writeText';

function main() {
  const [, , itemsDataDirectory, getTextDataDirectory, outputDirectory] = process.argv;
  writeEnglishNamesForTraining(itemsDataDirectory, getTextDataDirectory, outputDirectory);
  writeChineseNamesForTraining(itemsDataDirectory, outputDirectory);
}

function writeEnglishNamesForTraining(itemsDataDirectory: string, getTextDataDirectory: string, outputDirectory: string) {
  const enItemNames = _.compact(getEnglishItemNames(itemsDataDirectory, getTextDataDirectory).map((enItemName) => {
    const normalizedEnItemName = normalizeItemName(enItemName);
    if (normalizedEnItemName.search(/[^\x00-\x7F]+/) !== -1) {
      console.warn('Discarded non-English name', normalizedEnItemName);
      return null;
    }

    return normalizedEnItemName;
  }));
  writeText(formatTrainingTexts(enItemNames), outputDirectory, 'en_item_names.txt');
}

function getEnglishItemNames(itemsDataDirectory: string, getTextDataDirectory: string): readonly string[] {
  const zhTextData: { [id: string]: string } = readNeoxJson(join(getTextDataDirectory, 'zh'));
  const enTextData: { [id: string]: string } = readNeoxJson(join(getTextDataDirectory, 'en'));

  const itemNames = getChineseItemNames(itemsDataDirectory);
  const invertedZhTextData = _.invert(zhTextData);
  return _.compact(itemNames.map((itemName) => {
    const itemNameId = invertedZhTextData[itemName];
    if (!itemNameId) {
      return null;
    }

    const enItemName = enTextData[itemNameId];
    if (!enItemName) {
      console.error('Cannot find English name for item:', itemName, 'ID:', itemNameId);
      return null;
    }

    return enItemName;
  }));
}

function writeChineseNamesForTraining(itemsDataDirectory: string, outputDirectory: string) {
  const itemNames = getChineseItemNames(itemsDataDirectory);
  const normalizedItemNames = itemNames.map(normalizeItemName);
  writeText(formatTrainingTexts(normalizedItemNames), outputDirectory, 'zh_item_names.txt');
}

function formatTrainingTexts(texts: readonly string[]): string {
  const safeTexts = texts.filter(text => text.length <= maxLineWidth);
  return compactLines(safeTexts);
}

function getChineseItemNames(itemsDataDirectory: string): readonly string[] {
  const itemData = readNeoxJson(itemsDataDirectory);
  return Object.values(itemData).map(item => (item as any).zh_name);
}

function normalizeItemName(itemName: string): string {
  return _.trimEnd(itemName, '⁹⁸⁷⁶⁵⁴³²¹⁰');
}

function compactLines(texts: readonly string[]): string {
  if (!texts.length) {
    return '';
  }

  const output = [];
  let line = texts[0];
  for (const text of texts.slice(1)) {
    const newLine = `${line} ${text}`;
    if (newLine.length > maxLineWidth) {
      output.push(line);
      line = text;
      continue;
    }
    line = newLine;
  }
  if (line) {
    output.push(line);
  }
  return output.join('\n');
}

const maxLineWidth = 65;

main();
