import { stat } from 'fs/promises';
import { COLOR_RGB2GRAY, imreadAsync, imwriteAsync, Vec3 } from 'opencv4nodejs';
import { join } from 'path';
import getTempPath from '../getTempPath';
import locateItemStacks from './locateItemStacks';
import getTestDataPath from './testData/getTestDataPath';
import getTestImage from './testData/getTestImage';

describe('locateItemStacks', () => {
  beforeEach(() => {
    // Increased for debugging.
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
  });

  it('locates items from chn_armors_1', async () => {
    await expectNoRegression('chn_armors_1.png');
  });

  it('locates items from chn_armors_2', async () => {
    await expectNoRegression('chn_armors_2.png');
  });

  it('locates items from chn_armors_3', async () => {
    await expectNoRegression('chn_armors_3.png');
  });

  it('locates items from chn_armors_4', async () => {
    await expectNoRegression('chn_armors_4.png');
  });

  it('locates items from chn_blueprints_1', async () => {
    await expectNoRegression('chn_blueprints_1.png');
  });

  it('locates items from chn_blueprints_2', async () => {
    await expectNoRegression('chn_blueprints_2.png');
  });

  it('locates items from chn_blueprints_3', async () => {
    await expectNoRegression('chn_blueprints_3.png');
  });

  it('locates items from chn_blueprints_4', async () => {
    await expectNoRegression('chn_blueprints_4.png');
  });

  // P2 bug: Recognize items obstructed by the filter bar.
  it('locates items from chn_blueprints_5', async () => {
    await expectNoRegression('chn_blueprints_5.png');
  });

  it('locates items from chn_blueprints_6', async () => {
    await expectNoRegression('chn_blueprints_6.png');
  });

  it('locates items from chn_datacores_1', async () => {
    await expectNoRegression('chn_datacores_1.png');
  });

  it('locates items from chn_debris_1', async () => {
    await expectNoRegression('chn_debris_1.png');
  });

  it('locates items from chn_drones_1', async () => {
    await expectNoRegression('chn_drones_1.png');
  });

  it('locates items from chn_lasers_1', async () => {
    await expectNoRegression('chn_lasers_1.png');
  });

  it('locates items from chn_lasers_2', async () => {
    await expectNoRegression('chn_lasers_2.png');
  });

  it('locates items from chn_lasers_3', async () => {
    await expectNoRegression('chn_lasers_3.png');
  });

  it('locates items from chn_lasers_4', async () => {
    await expectNoRegression('chn_lasers_4.png');
  });

  it('locates items from chn_neuts_1', async () => {
    await expectNoRegression('chn_neuts_1.png');
  });

  it('locates items from chn_nos_1', async () => {
    await expectNoRegression('chn_nos_1.png');
  });

  it('locates items from chn_remotes_1', async () => {
    await expectNoRegression('chn_remotes_1.png');
  });

  it('locates items from chn_remotes_2', async () => {
    await expectNoRegression('chn_remotes_2.png');
  });

  it('locates items from chn_remotes_3', async () => {
    await expectNoRegression('chn_remotes_3.png');
  });

  it('locates items from chn_reps_1', async () => {
    await expectNoRegression('chn_reps_1.png');
  });

  it('locates items from chn_reps_2', async () => {
    await expectNoRegression('chn_reps_2.png');
  });

  it('locates items from chn_smoothened_1', async () => {
    await expectNoRegression('chn_smoothened_1.png');
  });

  it('locates items from chn_storyline_1', async () => {
    await expectNoRegression('chn_storyline_1.png');
  });

  it('locates items from chn_unselected_1', async () => {
    await expectNoRegression('chn_unselected_1.png');
  });

  it('locates items from chn_unselected_2', async () => {
    await expectNoRegression('chn_unselected_2.png');
  });

  it('locates items from chn_unselected_3', async () => {
    await expectNoRegression('chn_unselected_3.png');
  });

  it('locates items from chn_unselected_4', async () => {
    await expectNoRegression('chn_unselected_4.png');
  });

  it('locates items from eng_filtered_1', async () => {
    await expectNoRegression('eng_filtered_1.png');
  });

  it('locates items from eng_filtered_2', async () => {
    await expectNoRegression('eng_filtered_2.png');
  });

  it('locates items from eng_missiles_1', async () => {
    await expectNoRegression('eng_missiles_1.png');
  });

  it('locates items from eng_unselected_1', async () => {
    await expectNoRegression('eng_unselected_1.png');
  });

  it('locates items from chn_deadspace_1', async () => {
    await expectNoRegression('chn_deadspace_1.png');
  });

  it('locates items from chn_deadspace_2', async () => {
    await expectNoRegression('chn_deadspace_2.png');
  });

  it('locates items from chn_deadspace_3', async () => {
    await expectNoRegression('chn_deadspace_3.png');
  });

  // P2 bug: Recognize digit contours close to the item border.
  it('locates items from chn_deadspace_4', async () => {
    await expectNoRegression('chn_deadspace_4.png');
  });

  it('locates items from chn_deadspace_5', async () => {
    await expectNoRegression('chn_deadspace_5.png');
  });

  it('locates items from chn_deadspace_6', async () => {
    await expectNoRegression('chn_deadspace_6.jpeg');
  });

  it('locates items from chn_lowres_1', async () => {
    await expectNoRegression('chn_lowres_1.png');
  });

  it('locates items from chn_unselected_5', async () => {
    await expectNoRegression('chn_unselected_5.png');
  });

  it('locates items from eng_blueprints_1', async () => {
    await expectNoRegression('eng_blueprints_1.png');
  });

  it('locates items from eng_lossy_1', async () => {
    await expectNoRegression('eng_lossy_1.png');
  });

  it('locates items from chn_decomposers_1', async () => {
    await expectNoRegression('chn_decomposers_1.png');
  });

  it('locates items from chn_lossy_1', async () => {
    await expectNoRegression('chn_lossy_1.png');
  });

  it('locates items from chn_lossy_2', async () => {
    await expectNoRegression('chn_lossy_2.png');
  });

  // P2 bug: Recognize item stacks partially obstructed by the yellow filter bar.
  it('locates items from chn_lossy_3', async () => {
    await expectNoRegression('chn_lossy_3.png');
  });

  it('locates items from chn_lossy_4', async () => {
    await expectNoRegression('chn_lossy_4.png');
  });

  it('locates items from chn_lossy_5', async () => {
    await expectNoRegression('chn_lossy_5.png');
  });

  it('locates items from chn_hybrid_1', async () => {
    await expectNoRegression('chn_hybrid_1.png');
  });
});

async function expectNoRegression(rawInputImageFilename: string) {
  // Convert the input to PNG.
  // If the input is JPEG, it will be significantly different when saved as PNG.
  const rawInputImage = await getTestImage(join('inventory', rawInputImageFilename));
  const inputImageFilename = replaceImageFileExtension(rawInputImageFilename);
  const inputImagePath = getTempPath(`input_${inputImageFilename}`);
  await imwriteAsync(inputImagePath, rawInputImage);
  const testImage = await imreadAsync(inputImagePath);

  const locatedItems = await locateItemStacks(testImage);
  const red = new Vec3(0, 0, 255);
  const green = new Vec3(0, 255, 0);
  const blue = new Vec3(255, 0, 0);
  const width = 2;
  for (const { itemStackBoundingBox, nameBoundingRect, amountDigitBoundingRects } of locatedItems) {
    testImage.drawRectangle(itemStackBoundingBox, blue, width);
    testImage.drawRectangle(nameBoundingRect, green, width);
    for (const amountDigitBoundingRect of amountDigitBoundingRects) {
      testImage.drawRectangle(amountDigitBoundingRect, red, width);
    }
  }

  const referenceImagePath = getTestDataPath(join('inventory/golden', inputImageFilename));
  if (!(await existFile(referenceImagePath))) {
    await imwriteAsync(referenceImagePath, testImage);
    console.info('Reference image created:', referenceImagePath);
    return;
  }

  const referenceImage = await imreadAsync(referenceImagePath);
  const diffImage = testImage.absdiff(referenceImage);
  const greyscaleDiffImage = await diffImage.cvtColorAsync(COLOR_RGB2GRAY);
  const mismatchedPixelCount = await greyscaleDiffImage.countNonZeroAsync();
  if (!mismatchedPixelCount) {
    return;
  }

  const diffImagePath = getTempPath(`diff_${inputImageFilename}`);
  await imwriteAsync(diffImagePath, diffImage);
  const testImagePath = getTempPath(`test_${inputImageFilename}`);
  await imwriteAsync(testImagePath, testImage);
  fail(
    `Unexpected image diff: ${diffImagePath}\nTest image: ${testImagePath}` +
    `\nReference image: ${referenceImagePath}` +
    `\nUpdate golden by: mv ${testImagePath} ${referenceImagePath}`
  );
}

function replaceImageFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) {
    return filename;
  }

  parts[parts.length - 1] = 'png';
  return parts.join('.');
}

async function existFile(path: string): Promise<boolean> {
  try {
    await stat(path);
  } catch {
    return false;
  }
  return true;
}
