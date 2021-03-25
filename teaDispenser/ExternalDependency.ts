import { Client } from 'discord.js';
import { Scheduler } from 'tesseract.js';
import Message from './data/Message';
import Reaction from './data/Reaction';
import RenderedMessageContent from './data/RenderedMessageContent';

interface ExternalDependency {
  readonly schedulers: TesseractSchedulers;
  readonly discordApi: MessageApi;
  readonly kaiheilaApi: MessageApi;
  readonly discordBot: Client;
}

export interface TesseractSchedulers {
  // readonly languageDetector: Scheduler;
  readonly chineseRecognizer: Scheduler;
  // readonly englishRecognizer: Scheduler;
}

export interface MessageApi {
  readonly userId: string;

  fetchMessage(channelId: string, messageId: MessageId): Promise<Message | null>;

  sendMessage(
    channelId: string,
    content: RenderedMessageContent,
    replyToUserId?: string
  ): Promise<MessageId | null>;

  editMessage(
    channelId: string,
    messageId: MessageId,
    content: RenderedMessageContent,
    replyToUserId?: string
  ): Promise<boolean>;

  deleteMessage(channelId: string, messageId: MessageId): Promise<boolean>;

  fetchReactions(channelId: string, messageId: MessageId): Promise<readonly Reaction[]>;

  reactMessage(channelId: string, messageId: MessageId, content: string): Promise<boolean>;
}

type MessageId = string;

export default ExternalDependency;
