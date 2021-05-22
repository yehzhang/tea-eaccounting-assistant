import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
import fetchDiscordMessage from './fetchDiscordMessage';

function deleteMessage(channelId: string, messageId: string): Reader<EventContext, boolean> {
  return fetchDiscordMessage(channelId, messageId).bind(async (message) => {
    if (!message) {
      return false;
    }

    try {
      await message.delete();
      return true;
    } catch (e) {
      return logErrorWithContext('Unexpected error when deleting a Discord message', e).replaceBy(
        false
      );
    }
  });
}

export default deleteMessage;
