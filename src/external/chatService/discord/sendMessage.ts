import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
import logErrorWithContext from '../../logErrorWithContext';
import buildMessageOptions from './buildMessageOptions';
import fetchDiscordChannel from './fetchDiscordChannel';

function sendMessage(
  channelId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<EventContext, string | null> {
  return fetchDiscordChannel(channelId).bind(async (channel) => {
    if (!channel) {
      return null;
    }
    try {
      const message = await channel.send(buildMessageOptions(content, replyToUserId));
      return message.id;
    } catch (e) {
      return logErrorWithContext('Unexpected error when sending a Discord message', e).replaceBy(
        null
      );
    }
  });
}

export default sendMessage;
