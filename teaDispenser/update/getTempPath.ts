import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

function getTempPath(filename: string): string {
  if (tempDirectory === null) {
    tempDirectory = mkdtempSync(join(tmpdir(), 'teaDispenser_'));
    console.debug('Using temp directory:', tempDirectory);
  }
  return join(tempDirectory, filename);
}

let tempDirectory: string | null = null;

export default getTempPath;
