import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import chooseExternalApi from './chooseExternalApi';
import discordDeleteMessage from './discord/deleteMessage';
import kaiheilaDeleteMessage from './kaiheila/deleteMessage';

function deleteMessage(
  channelId: string,
  messageId: string
): Reader<EventContext & ChatServiceContext, boolean> {
  return chooseExternalApi({
    discord: discordDeleteMessage(channelId, messageId),
    kaiheila: kaiheilaDeleteMessage(channelId, messageId),
  });
}

export default deleteMessage;
