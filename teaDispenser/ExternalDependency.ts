import { Scheduler } from 'tesseract.js';

interface ExternalDependency {
  readonly schedulers: TesseractSchedulers;
}

export interface TesseractSchedulers {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalDependency;
