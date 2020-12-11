import { join } from "path";
import { readNeoxJson } from './readNeoxJson';
import { writeText } from './writeText';

function main() {
  const [, , getTextDataDirectory, outputDirectory] = process.argv;

  const zhTexts: { [id: string]: string } = readNeoxJson(join(getTextDataDirectory, 'zh'));
  const enTexts: { [id: string]: string } = readNeoxJson(join(getTextDataDirectory, 'en'));
  const textIds = Array.from(new Set(Object.keys(zhTexts).concat(Object.keys(enTexts))));
  const textPacks = textIds.map(textId => ({
    zh: zhTexts[textId],
    en: enTexts[textId],
  }));

  const textPacksString = JSON.stringify(textPacks, null, 2);
  writeText(textPacksString, outputDirectory, 'textPacks.json');
}

main();
