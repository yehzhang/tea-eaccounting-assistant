import cv, { Mat } from 'opencv4nodejs';
import logErrorWithoutContext from '../../../external/logError';

async function matchTemplate(image: Mat, template: Mat): Promise<Confidence> {
  let confidenceMatrix;
  try {
    confidenceMatrix = await image.matchTemplateAsync(template, cv.TM_CCOEFF_NORMED);
  } catch (error) {
    logErrorWithoutContext('Unexpected error when matching template', {
      error,
      image,
      template,
    });
    return 0;
  }

  const {
    maxLoc: { x, y },
  } = await confidenceMatrix.minMaxLocAsync();
  return confidenceMatrix.at(y, x);
}

type Confidence = number;

export default matchTemplate;
