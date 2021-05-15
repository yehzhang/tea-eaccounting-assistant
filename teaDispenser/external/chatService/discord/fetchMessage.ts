import Reader from '../../../core/Reader/Reader';
import Message from '../../../data/Message';
import EventContext from '../../EventContext';
import fetchDiscordMessage from './fetchDiscordMessage';
import fromDiscordMessage from './fromDiscordMessage';

function fetchMessage(channelId: string, messageId: string): Reader<EventContext, Message | null> {
  return fetchDiscordMessage(channelId, messageId).bind(
    (message) => message && fromDiscordMessage(message)
  );
}

export default fetchMessage;
