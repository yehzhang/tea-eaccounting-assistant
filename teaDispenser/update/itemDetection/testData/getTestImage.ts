import { imreadAsync, Mat } from 'opencv4nodejs';
import getTestDataPath from './getTestDataPath';

async function getTestImage(filename: string): Promise<Mat> {
  const path = getTestDataPath(filename);
  return imreadAsync(path);
}

export default getTestImage;
