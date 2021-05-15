import { Client } from 'discord.js';
import { Scheduler } from 'tesseract.js';
import DiscordApiContext from './chatService/discord/ApiContext';
import KaiheilaApiContext from './chatService/kaiheila/ApiContext';

interface ExternalContext {
  readonly schedulers: TesseractContext;
  readonly discordBot: Client;
  readonly discordTeaDispenser: DiscordApiContext;
  readonly kaiheilaTeaDispenser: KaiheilaApiContext;
  readonly kaiheilaDmv: KaiheilaApiContext;
}

export interface TesseractContext {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export default ExternalContext;
