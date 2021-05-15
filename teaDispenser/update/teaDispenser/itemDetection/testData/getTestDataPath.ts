import { join } from 'path';

function getTestDataPath(filename: string): string {
  return join(__dirname, filename);
}

export default getTestDataPath;
