import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
import buildMessageOptions from './buildMessageOptions';
import fetchDiscordMessage from './fetchDiscordMessage';

function editMessage(
  channelId: string,
  messageId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<EventContext, boolean> {
  return fetchDiscordMessage(channelId, messageId).bind(async (message) => {
    if (!message) {
      return false;
    }

    try {
      await message.edit({
        // Remove the existing embed message, if any.
        embed: null,
        ...buildMessageOptions(content, replyToUserId),
      });
      return true;
    } catch (e) {
      console.error('Unexpected error when editing a Discord message', e);
      return false;
    }
  });
}

export default editMessage;
