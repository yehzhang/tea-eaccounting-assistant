import * as _ from 'lodash';
import { imwriteAsync, Mat } from 'opencv4nodejs';
import { RecognizeResult, Scheduler } from 'tesseract.js';
import getTempPath from '../getTempPath';
import resizeHeightTo from './resizeHeightTo';

/** Returns an empty string if failed to recognize anything. */
async function recognizeText(languageRecognizer: Scheduler, image: Mat): Promise<string> {
  // The optimal character size is 30, which roughly translates to 54 in title height.
  const normalizedImage = await resizeHeightTo(54, image);

  const imagePath = await getTempPath(`tmp_${Math.random().toString().slice(2)}.png`);
  await imwriteAsync(imagePath, normalizedImage);

  const { data }: RecognizeResult = (await languageRecognizer.addJob(
    'recognize',
    imagePath
  )) as any;

  const confidentText = _.compact(
    data.words.map((word) =>
      word.symbols
        .filter((symbol) => minRecognizingConfidence <= symbol.confidence)
        .map((symbol) => symbol.text)
        .join('')
    )
  ).join(' ');
  const ellipsis = confidentText.replace(/[·',"]/g, '.').search(/(\.\.\.|…)$/) !== -1;
  const cleanText =
    _.trimEnd(confidentText, ` ‘\n\t'",/#!$%^&*;:{}=-_\`~()[]{}\\·….«`)
      .replace(/[丨|]/g, 'I')
      .replace(/‖/g, 'II') + (ellipsis ? '...' : '');

  console.dir(
    {
      rawText: data.text,
      confidentText,
      cleanText,
      confidence: data.confidence,
      normalizedImagePath: imagePath,
      wordsChoices: data.words.map((word) => word.choices),
      // symbolsChoices: data.symbols.map(symbol => symbol.choices),
    },
    {
      depth: null,
    }
  );

  return cleanText
    .replace('激光炮苜Z调节装置', '激光炮发散调节装置')
    .replace('无\\木几射五亘力口弓虽装置', '无人机射速加强装置')
    .replace('克尔姆', '克尔鲁姆')
    .replace('短磁', '短管磁');
}

const minRecognizingConfidence = 60;

export default recognizeText;
