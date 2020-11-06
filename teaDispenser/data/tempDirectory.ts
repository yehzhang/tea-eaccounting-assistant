import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export const tempDirectory = mkdtempSync(join(tmpdir(), 'teaDispenser_'));

console.debug('Using temp directory:', tempDirectory);
