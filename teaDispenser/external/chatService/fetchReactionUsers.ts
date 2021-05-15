import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import User from '../../data/User';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import kaiheilaFetchReactionUsers from './kaiheila/fetchReactionUsers';

function fetchReactionUsers(
  channelId: string,
  messageId: string
): Reader<EventContext & ChatServiceContext, readonly User[]> {
  return chooseExternalApi({
    discord: new Reader(() => {
      throw new TypeError('Not implemented');
    }),
    kaiheila: kaiheilaFetchReactionUsers(channelId, messageId),
  });
}

export default fetchReactionUsers;
