import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import RenderedMessageContent from '../../data/RenderedMessageContent';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import discordSendMessage from './discord/sendMessage';
import kaiheilaSendMessage from './kaiheila/sendMessage';

function sendMessage(
  channelId: string,
  content: RenderedMessageContent,
  replyToUserId?: string
): Reader<EventContext & ChatServiceContext, string | null> {
  return chooseExternalApi({
    discord: discordSendMessage(channelId, content, replyToUserId),
    kaiheila: kaiheilaSendMessage(channelId, content, replyToUserId),
  });
}

export default sendMessage;
