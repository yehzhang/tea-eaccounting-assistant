import { Mat, TM_CCOEFF_NORMED } from 'opencv4nodejs';

async function matchTemplate(image: Mat, template: Mat): Promise<Confidence> {
  const confidenceMatrix = await image.matchTemplateAsync(template, TM_CCOEFF_NORMED);
  const { maxLoc: { x, y } } = await confidenceMatrix.minMaxLocAsync();
  return confidenceMatrix.at(y, x);
}

type Confidence = number;

export default matchTemplate;
