import _ from 'lodash';
import Reader from '../../../core/Reader/Reader';
import User from '../../../data/User';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function fetchReactionUsers(
  messageId: string,
  emojiId: string
): Reader<KaiheilaEventContext, readonly User[]> {
  return fetchKaiheilaReader('GET', '/api/v3/message/reaction-list', {
    msg_id: messageId,
    emoji: emojiId,
  }).bind((response) => {
    if (!response) {
      return [];
    }

    if (!_.isArray(response)) {
      console.error('Expected user array, got', response);
      return [];
    }
    return _.compact(
      response.map((userData) => {
        if (typeof userData !== 'object' || !userData) {
          console.error('Expected user object, got', response);
          return null;
        }
        // `nickname` is actually the same as `username` - no server nicknames available.
        const { id, nickname } = userData;
        if (typeof id !== 'string' || typeof nickname !== 'string') {
          console.error('Expected valid user object, got', response);
          return null;
        }
        return {
          id,
          name: nickname,
        };
      })
    );
  });
}

export default fetchReactionUsers;
