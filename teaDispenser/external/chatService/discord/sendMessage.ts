import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import RenderedMessageContent from '../../../data/RenderedMessageContent';
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
      console.error('Unexpected error when sending a Discord message', e);
      return null;
    }
  });
}

export default sendMessage;
