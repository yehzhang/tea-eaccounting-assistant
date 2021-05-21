import EventContext from '../../core/EventContext';
import ChatServiceContext from '../../data/ChatServiceContext';
import Ref from '../../data/Ref';

interface MessageRenderingContext extends EventContext, ChatServiceContext {
  readonly replyToUserId?: string;
  readonly messageIdToEditRef: Ref<string>;
}

export default MessageRenderingContext;
