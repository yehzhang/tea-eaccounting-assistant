import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import chooseExternalApi from './chooseExternalApi';
import kaiheilaCreateChannel from './kaiheila/createChannel';

function createChannel(
  guildId: string,
  name: string,
  categoryId: string
): Reader<EventContext & ChatServiceContext, string | null> {
  return chooseExternalApi({
    discord: new Reader(() => {
      throw new TypeError('Not implemented');
    }),
    kaiheila: kaiheilaCreateChannel(guildId, name, categoryId),
  });
}

export default createChannel;
