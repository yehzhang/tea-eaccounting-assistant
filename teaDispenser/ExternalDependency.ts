import { Client } from 'discord.js';
import { Scheduler } from 'tesseract.js';

interface ExternalDependency {
  readonly schedulers: TesseractSchedulers;
  readonly discordBot: Client;
}

export interface TesseractSchedulers {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalDependency;
