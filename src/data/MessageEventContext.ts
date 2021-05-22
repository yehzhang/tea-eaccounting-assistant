import EventContext from '../core/EventContext';
import MessageContext from './MessageContext';

interface MessageEventContext extends EventContext, MessageContext {}

export default MessageEventContext;
