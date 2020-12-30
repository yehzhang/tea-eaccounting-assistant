import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export function writeText(text: string, outputDirectory: string, filename: string) {
  if (!existsSync(outputDirectory)) {
    mkdirSync(outputDirectory);
  }

  const outPath = join(outputDirectory, filename);
  writeFileSync(outPath, text);
}
