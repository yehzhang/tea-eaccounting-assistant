import Reader from '../../../core/Reader/Reader';
import EventContext from '../../EventContext';
import fetchDiscordMessage from './fetchDiscordMessage';

function reactMessage(
  channelId: string,
  messageId: string,
  content: string
): Reader<EventContext, boolean> {
  return fetchDiscordMessage(channelId, messageId).bind(async (message) => {
    if (!message) {
      return false;
    }

    try {
      await message.react(content);
      return true;
    } catch (e) {
      console.error('Unexpected error when reacting to a Discord message', e);
      return false;
    }
  });
}

export default reactMessage;
