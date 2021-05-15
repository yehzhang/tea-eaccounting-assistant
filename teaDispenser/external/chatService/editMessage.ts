import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import RenderedMessageContent from '../../data/RenderedMessageContent';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import discordEditMessage from './discord/editMessage';
import kaiheilaEditMessage from './kaiheila/editMessage';

function editMessage(
  channelId: string,
  messageId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<EventContext & ChatServiceContext, boolean> {
  return chooseExternalApi({
    discord: discordEditMessage(channelId, messageId, content, replyToUserId),
    kaiheila: kaiheilaEditMessage(messageId, content, replyToUserId),
  });
}

export default editMessage;
