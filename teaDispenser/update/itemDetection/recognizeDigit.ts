import { readdirSync } from 'fs';
import * as _ from 'lodash';
import { COLOR_RGB2GRAY, imread, IMREAD_GRAYSCALE, Mat } from 'opencv4nodejs';
import { join } from 'path';
import matchBestTemplate from './matchBestTemplate';
import resizeHeightTo from './resizeHeightTo';

/** Assumes the image is larger than the template. */
async function recognizeDigit(image: Mat): Promise<string> {
  const normalizedImage = await normalizeImage(image, Object.values(characterTemplates));
  return (
    (await matchBestTemplate(
      normalizedImage,
      Object.entries(characterTemplates),
      minTemplateMatchingConfidence
    )) || ''
  );
}

async function normalizeImage(image: Mat, templates: readonly Mat[]): Promise<Mat> {
  const greyscaleImage = await image.cvtColorAsync(COLOR_RGB2GRAY);

  const maxTemplateHeight = Math.max(...templates.map((template) => template.rows));
  return resizeHeightTo(maxTemplateHeight, greyscaleImage);
}

const minTemplateMatchingConfidence = 0.3;

const characterTemplates: TemplateSet = (() => {
  const templateDirectory = join(__dirname, 'template/digit');
  const templateFilenames = readdirSync(templateDirectory);

  const templates: { [character: string]: Mat } = {};
  for (const templateFilename of templateFilenames) {
    const filenameSegments = templateFilename.split('.')[0].split('_');
    if (filenameSegments.length !== 3) {
      continue;
    }
    const [title, character] = filenameSegments;
    if (title !== 'tmpl') {
      continue;
    }

    const templatePath = join(templateDirectory, templateFilename);
    templates[character] = imread(templatePath, IMREAD_GRAYSCALE);
  }

  if (!Object.keys(templates).length) {
    console.warn('Expected amount templates');
  }

  return templates;
})();

interface TemplateSet {
  readonly [character: string]: Mat;
}

export default recognizeDigit;
