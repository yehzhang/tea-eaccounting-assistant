import _ from 'lodash';
import { Mat } from 'opencv4nodejs';
import matchTemplate from './matchTemplate';

async function matchBestTemplate<T>(image: Mat, templates: readonly (readonly [T, Mat])[], minConfidence: number): Promise<T | null> {
  const matches = await Promise.all(templates.map(async ([key, template]) => ({
    confidence: await matchTemplate(image, template),
    key,
  })));
  const bestMatch = _.maxBy(matches.filter(({ confidence }) => minConfidence <= confidence), ({ confidence }) => confidence);
  return bestMatch ? bestMatch.key : null;
}

export default matchBestTemplate;
