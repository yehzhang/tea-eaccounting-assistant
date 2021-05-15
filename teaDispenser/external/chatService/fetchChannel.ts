import Reader from '../../core/Reader/Reader';
import Channel from '../../data/Channel';
import ChatServiceContext from '../../data/ChatServiceContext';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import kaiheilaFetchChannel from './kaiheila/fetchChannel';

function fetchChannel(
  channelId: string
): Reader<EventContext & ChatServiceContext, Channel | null> {
  return chooseExternalApi({
    discord: new Reader(() => {
      throw new TypeError('Not implemented');
    }),
    kaiheila: kaiheilaFetchChannel(channelId),
  });
}

export default fetchChannel;
