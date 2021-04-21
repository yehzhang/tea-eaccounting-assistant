import Message from './Message';
import Reaction from './Reaction';
import RenderedMessageContent from './RenderedMessageContent';

interface ChatServiceApi {
  readonly botUserId: string;

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

export default ChatServiceApi;
