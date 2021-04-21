import { Scheduler } from 'tesseract.js';
import ChatServiceContext from './ChatServiceContext';

interface ExternalContext {
  readonly schedulers: TesseractContext;
  readonly discordTeaDispenser: ChatServiceContext;
  readonly kaiheilaTeaDispenser: ChatServiceContext;
  readonly kaiheilaDmv: ChatServiceContext;
}

export interface TesseractContext {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalContext;
