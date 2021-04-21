import Channel from './Channel';
import ChatServicePermission from './ChatServicePermission';
import Message from './Message';
import Reaction from './Reaction';
import RenderedMessageContent from './RenderedMessageContent';
import User from './User';

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

  fetchReactionUsers(messageId: MessageId, emojiId: string): Promise<readonly User[]>;

  reactMessage(channelId: string, messageId: MessageId, content: string): Promise<boolean>;

  createChannel(guildId: string, name: string, categoryId: string): Promise<string | null>;

  /** If `userId` is number, it means role ID. `0` means everyone. */
  createChannelPermission(
    channelId: string,
    userId: string | number,
    allow: ChatServicePermission,
    deny: ChatServicePermission
  ): Promise<boolean>;

  fetchChannel(channelId: string): Promise<Channel | null>;
}

type MessageId = string;

export default ChatServiceApi;
