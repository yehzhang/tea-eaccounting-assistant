import ChatServiceContext from '../../data/ChatServiceContext';
import Ref from '../../data/Ref';
import EventContext from '../../external/EventContext';

interface MessageRenderingContext extends EventContext, ChatServiceContext {
  readonly replyToUserId?: string;
  readonly messageIdToEditRef: Ref<string>;
}

export default MessageRenderingContext;
