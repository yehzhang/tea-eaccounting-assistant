import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
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
      return logErrorWithContext(
        'Unexpected error when reacting to a Discord message',
        e
      ).replaceBy(false);
    }
  });
}

export default reactMessage;
