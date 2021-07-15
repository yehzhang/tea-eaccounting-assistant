import { stat, unlink } from 'fs/promises';
import { createScheduler, createWorker, PSM, Scheduler } from 'tesseract.js';
import getPathRelativeToFileDirname
  from '../update/teaDispenser/itemDetection/getPathRelativeToFileDirname';
import logError from './logError';

async function createMonolingualScheduler(
  language: string,
  pageSegMode: PSM,
  tessedit_char_whitelist?: string
): Promise<Scheduler> {
  const worker = createWorker({
    langPath: getPathRelativeToFileDirname(import.meta.url, '../../training/outputTessdata'),
    gzip: false,
    errorHandler: (error) => void logError('Tesseract worker error:', error),
  });
  await worker.load();
  await worker.loadLanguage(language);
  await worker.initialize(language);
  await worker.setParameters({
    tessedit_pageseg_mode: pageSegMode,
    tessedit_char_whitelist,
  });

  const scheduler = createScheduler();
  scheduler.addWorker(worker);

  return scheduler;
}

// Remove the working copies of the trained data to avoid corruption.
const trainedDataFilenames = ['chi_sim.traineddata', 'eng.traineddata'];
await Promise.all(
  trainedDataFilenames.map(async (filename) => {
    const path = getPathRelativeToFileDirname(import.meta.url, '../../', filename);
    try {
      await stat(path);
    } catch {
      return;
    }
    await unlink(path);
  })
);

export const [chineseRecognizer] = await Promise.all([
  createMonolingualScheduler('chi_sim', PSM.SINGLE_LINE),
]);
