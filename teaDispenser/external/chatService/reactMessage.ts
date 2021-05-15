import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import discordReactMessage from './discord/reactMessage';
import kaiheilaReactMessage from './kaiheila/reactMessage';

function reactMessage(
  channelId: string,
  messageId: string,
  content: string
): Reader<EventContext & ChatServiceContext, boolean> {
  return chooseExternalApi({
    discord: discordReactMessage(channelId, messageId, content),
    kaiheila: kaiheilaReactMessage(channelId, messageId, content),
  });
}

export default reactMessage;
