import EventContext from '../external/EventContext';
import MessageContext from './MessageContext';

interface MessageEventContext extends EventContext, MessageContext {}

export default MessageEventContext;
