import ChatServiceContext from './ChatServiceContext';

interface MessageContext extends ChatServiceContext {
  readonly messageId: string;
}

export default MessageContext;
