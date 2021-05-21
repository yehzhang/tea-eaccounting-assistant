import getPathRelativeToFileDirname from '../getPathRelativeToFileDirname';

function getTestDataPath(filename: string): string {
  return getPathRelativeToFileDirname(import.meta.url, filename);
}

export default getTestDataPath;
