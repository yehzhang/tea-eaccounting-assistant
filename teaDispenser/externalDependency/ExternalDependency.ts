import { Scheduler } from 'tesseract.js';
import MessageApi from '../data/MessageApi';

interface ExternalDependency {
  readonly schedulers: TesseractSchedulers;
  readonly discordApi: MessageApi;
  readonly kaiheilaApi: MessageApi;
}

export interface TesseractSchedulers {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalDependency;
