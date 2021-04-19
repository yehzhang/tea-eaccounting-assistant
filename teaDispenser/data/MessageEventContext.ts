import MessageApi from './MessageApi';

interface MessageEventContext {
  readonly eventId: string;
  readonly channelId: string;
  readonly replyToUserId: string | null;
  readonly messageApi: MessageApi;
  messageIdToEdit: string | null;
}

export default MessageEventContext;
