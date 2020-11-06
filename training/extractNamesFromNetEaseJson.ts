import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import * as _ from 'lodash';
import { join } from "path";

function writeEnglishNamesForTraining() {
  const enItemNames = _.compact(getEnglishItemNames().map((enItemName) => {
    const normalizedEnItemName = normalizeItemName(enItemName);
    if (normalizedEnItemName.search(/[^\x00-\x7F]+/) !== -1) {
      console.warn('Discarded non-English name', normalizedEnItemName);
      return null;
    }

    return normalizedEnItemName;
  }));
  writeText(formatTrainingTexts(enItemNames), 'en_item_names.txt');
}

function getEnglishItemNames(): readonly string[] {
  const zhTextData: { [id: string]: string } = getDataFromNetEaseJson('/Users/yehengz/Downloads/fsd2json/output/gettext/zh');
  const enTextData: { [id: string]: string } = getDataFromNetEaseJson('/Users/yehengz/Downloads/fsd2json/output/gettext/en');

  const itemNames = getChineseItemNames();
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

function writeTextsForNormalization() {
  const zhTexts: { [id: string]: string } = getDataFromNetEaseJson('/Users/yehengz/Downloads/fsd2json/output/gettext/zh');
  const enTexts: { [id: string]: string } = getDataFromNetEaseJson('/Users/yehengz/Downloads/fsd2json/output/gettext/en');
  const textIds = Array.from(new Set(Object.keys(zhTexts).concat(Object.keys(enTexts))));
  const textPacks = textIds.map(textId => ({
    zh: zhTexts[textId],
    en: enTexts[textId],
  }));

  writeText(JSON.stringify(textPacks, null, 2), 'texts.json');
}

function writeChineseNamesForTraining() {
  const itemNames = getChineseItemNames();
  const normalizedItemNames = itemNames.map(normalizeItemName);
  writeText(formatTrainingTexts(normalizedItemNames), 'zh_item_names.txt');
}

function formatTrainingTexts(texts: readonly string[]): string {
  const safeTexts = texts.filter(text => text.length <= maxLineWidth);
  return compactLines(safeTexts);
}

function writeText(text: string, filename: string) {
  const outDirectory = join(__dirname, '../build');
  if (!existsSync(outDirectory)) {
    mkdirSync(outDirectory);
  }

  const outPath = join(outDirectory, filename);
  writeFileSync(outPath, text);
}

function getChineseItemNames(): readonly string[] {
  const itemData = getDataFromNetEaseJson('/Users/yehengz/Downloads/fsd2json/output/items');
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

function getDataFromNetEaseJson(dataDirectory: string): { [key: string]: any } {
  const filenames = readdirSync(dataDirectory);
  return filenames.filter(filename => filename.match(/\d+\.json/))
      .map(filename => {
        const data = readFileSync(join(dataDirectory, filename), 'utf8');
        return JSON.parse(data);
      })
      .reduce((acc, data) => Object.assign(acc, data), {});
}

writeTextsForNormalization();
