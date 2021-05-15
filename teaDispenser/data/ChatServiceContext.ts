import ChatService from './ChatService';

interface ChatServiceContext {
  readonly chatService: ChatService;
  readonly channelId: string;
}

export default ChatServiceContext;
