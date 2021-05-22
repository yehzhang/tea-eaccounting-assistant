import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function getPathRelativeToFileDirname(fileUrl: string, ...paths: readonly string[]): string {
  return join(dirname(fileURLToPath(fileUrl)), ...paths);
}

export default getPathRelativeToFileDirname;
