import { readdirSync } from 'fs';
import * as _ from 'lodash';
import { BORDER_REPLICATE, COLOR_RGB2GRAY, imread, IMREAD_GRAYSCALE, Mat } from 'opencv4nodejs';
import { join } from 'path';
import matchBestTemplate from './matchBestTemplate';
import resizeHeightTo from './resizeHeightTo';

/** Assumes the image is larger than the template. */
async function recognizeDigit(image: Mat): Promise<string> {
  const normalizedImage = await normalizeImage(image);
  return await matchBestTemplate(
      normalizedImage, Object.entries(characterTemplates), minTemplateMatchingConfidence) || '';
}

async function normalizeImage(image: Mat): Promise<Mat> {
  const greyscaleImage = await image.cvtColorAsync(COLOR_RGB2GRAY);
  const resizedImage = await resizeHeightTo(templateContourHeight, greyscaleImage);
  return resizedImage.copyMakeBorderAsync(imagePadding, imagePadding, imagePadding, imagePadding, BORDER_REPLICATE);
}

const imagePadding = 10;
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

const templateContourHeight = 46;

export default recognizeDigit;
