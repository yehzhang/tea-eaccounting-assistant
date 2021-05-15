import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import Message from '../../data/Message';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import discordFetchMessage from './discord/fetchMessage';
import kaiheilaFetchMessage from './kaiheila/fetchMessage';

function fetchMessage(
  channelId: string,
  messageId: string
): Reader<EventContext & ChatServiceContext, Message | null> {
  return chooseExternalApi({
    discord: discordFetchMessage(channelId, messageId),
    kaiheila: kaiheilaFetchMessage(channelId, messageId),
  });
}

export default fetchMessage;
