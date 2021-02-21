import { Mat, TM_CCOEFF_NORMED } from 'opencv4nodejs';

async function matchTemplate(image: Mat, template: Mat): Promise<Confidence> {
  let confidenceMatrix;
  try {
    confidenceMatrix = await image.matchTemplateAsync(template, TM_CCOEFF_NORMED);
  } catch (e) {
    console.dir(
      {
        message: 'Unexpected error when matching template',
        e,
        image,
        template,
      },
      { depth: null }
    );
    return 0;
  }

  const {
    maxLoc: { x, y },
  } = await confidenceMatrix.minMaxLocAsync();
  return confidenceMatrix.at(y, x);
}

type Confidence = number;

export default matchTemplate;
