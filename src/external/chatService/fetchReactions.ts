import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import Reaction from '../../data/Reaction';
import chooseExternalApi from './chooseExternalApi';
import discordFetchReactions from './discord/fetchReactions';
import kaiheilaFetchReactions from './kaiheila/fetchReactions';

function fetchReactions(
  channelId: string,
  messageId: string
): Reader<EventContext & ChatServiceContext, readonly Reaction[]> {
  return chooseExternalApi({
    discord: discordFetchReactions(channelId, messageId),
    kaiheila: kaiheilaFetchReactions(),
  });
}

export default fetchReactions;
