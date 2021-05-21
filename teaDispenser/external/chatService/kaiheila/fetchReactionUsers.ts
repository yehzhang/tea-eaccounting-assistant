import _ from 'lodash';
import Reader from '../../../core/Reader/Reader';
import User from '../../../data/User';
import logError from '../../logError';
import logErrorWithContext from '../../logErrorWithContext';
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
      return logErrorWithContext('Expected user array', response).replaceBy([]);
    }
    return _.compact(
      response.map((userData) => {
        if (typeof userData !== 'object' || !userData) {
          logError('Expected user object', response);
          return null;
        }
        const { id, username } = userData;
        if (typeof id !== 'string' || typeof username !== 'string') {
          logError('Expected valid user object', response);
          return null;
        }
        return {
          id,
          name: username,
        };
      })
    );
  });
}

export default fetchReactionUsers;
