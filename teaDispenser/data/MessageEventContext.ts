import ChatService from './ChatService';

interface MessageEventContext {
  readonly eventId: string;
  readonly channelId: string;
  readonly replyToUserId: string | null;
  readonly chatService: ChatService;
  messageIdToEdit: string | null;
}

export default MessageEventContext;
