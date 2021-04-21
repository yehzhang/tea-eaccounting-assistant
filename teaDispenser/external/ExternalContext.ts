import { Scheduler } from 'tesseract.js';
import ChatServiceContext from './ChatServiceContext';

interface ExternalContext {
  readonly schedulers: TesseractContext;
  readonly discord: ChatServiceContext;
  readonly kaiheila: ChatServiceContext;
}

export interface TesseractContext {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalContext;
