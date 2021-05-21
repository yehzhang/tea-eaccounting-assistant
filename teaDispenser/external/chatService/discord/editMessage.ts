import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
import logErrorWithContext from '../../logErrorWithContext';
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
      return logErrorWithContext('Unexpected error when editing a Discord message', e).replaceBy(
        false
      );
    }
  });
}

export default editMessage;
