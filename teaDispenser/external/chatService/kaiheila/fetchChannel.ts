import Reader from '../../../core/Reader/Reader';
import Channel from '../../../data/Channel';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function fetchChannel(channelId: string): Reader<KaiheilaEventContext, Channel | null> {
  return fetchKaiheilaReader('GET', '/api/v3/channel/view', {
    target_id: channelId,
  }).bind((response) => {
    if (!response) {
      return null;
    }

    const { id, guild_id: guildId, parent_id: categoryId } = response;
    if (typeof id !== 'string' || typeof guildId !== 'string' || typeof categoryId !== 'string') {
      console.error('Expected valid channel, got', response);
      return null;
    }

    return {
      id,
      guildId,
      categoryId,
    };
  });
}

export default fetchChannel;
