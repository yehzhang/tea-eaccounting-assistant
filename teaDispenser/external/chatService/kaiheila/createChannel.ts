import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function createChannel(
  guildId: string,
  name: string,
  categoryId: string
): Reader<KaiheilaEventContext, string | null> {
  return fetchKaiheilaReader('POST', '/api/v3/channel/create', {
    guild_id: guildId,
    parent_id: categoryId,
    name,
  }).bind((response) => {
    if (!response) {
      return null;
    }
    const { id } = response || {};
    if (typeof id !== 'string') {
      return logErrorWithContext('Expected channel id in response', response).replaceBy(null);
    }
    return id;
  });
}

export default createChannel;
