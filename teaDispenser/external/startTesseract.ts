import { stat, unlink } from 'fs/promises';
import { join } from 'path';
import { createScheduler, createWorker, PSM, Scheduler } from 'tesseract.js';
import { TesseractContext } from './ExternalContext';

async function startTesseract(): Promise<TesseractContext> {
  async function createMonolingualScheduler(
    language: string,
    pageSegMode: PSM,
    tessedit_char_whitelist?: string
  ): Promise<Scheduler> {
    const worker = createWorker({
      langPath: join(__dirname, '../../../training/outputTessdata'),
      gzip: false,
      errorHandler: (error) => void console.warn('Tesseract worker error:', error),
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
      const path = join(__dirname, '../../../', filename);
      try {
        await stat(path);
      } catch {
        return;
      }
      await unlink(path);
    })
  );

  const [chineseRecognizer] = await Promise.all([
    createMonolingualScheduler('chi_sim', PSM.SINGLE_LINE),
  ]);

  return {
    chineseRecognizer,
  };
}

export default startTesseract;
