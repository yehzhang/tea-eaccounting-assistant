import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
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
      console.error('Unexpected error when deleting a Discord message', e);
      return false;
    }
  });
}

export default deleteMessage;
