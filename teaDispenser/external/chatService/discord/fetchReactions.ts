import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import Reaction from '../../../data/Reaction';
import fetchDiscordMessage from './fetchDiscordMessage';

function fetchReactions(
  channelId: string,
  messageId: string
): Reader<EventContext, readonly Reaction[]> {
  return fetchDiscordMessage(channelId, messageId).bind((message) => {
    if (!message) {
      return [];
    }
    try {
      return message.reactions.cache
        .map((reaction) =>
          reaction.users.cache.map((user) => ({
            userId: user.id,
            content: reaction.emoji.name,
          }))
        )
        .flat();
    } catch (e) {
      console.error('Unexpected error when fetching Discord reactions', e);
      return [];
    }
  });
}

export default fetchReactions;
