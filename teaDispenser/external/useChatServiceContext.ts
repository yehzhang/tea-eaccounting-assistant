import ChatService from '../data/ChatService';
import ChatServiceContext from './ChatServiceContext';
import useExternalContext from './useExternalContext';

function useChatServiceContext(chatService: ChatService): ChatServiceContext {
  const context = useExternalContext();
  return context[chatService];
}

export default useChatServiceContext;
