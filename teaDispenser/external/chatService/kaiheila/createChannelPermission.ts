import Reader from '../../../core/Reader/Reader';
import ChatServicePermission from '../../../data/ChatServicePermission';
import fetchKaiheilaReader from './fetchKaiheilaReader';
import KaiheilaEventContext from './KaiheilaEventContext';

function createChannelPermission(
  channelId: string,
  userId: string | number,
  allow: ChatServicePermission,
  deny: ChatServicePermission
): Reader<KaiheilaEventContext, boolean> {
  return new Reader(async (context) => {
    // The everyone role is always created already.
    if (userId !== 0) {
      const creationResponse = await fetchKaiheilaReader('POST', '/api/v3/channel-role/create', {
        channel_id: channelId,
        type: typeof userId === 'number' ? 'role_id' : 'user_id',
        value: userId,
      }).run(context);
      if (!creationResponse) {
        return false;
      }
    }

    const response = await fetchKaiheilaReader('POST', '/api/v3/channel-role/update', {
      channel_id: channelId,
      type: typeof userId === 'number' ? 'role_id' : 'user_id',
      value: userId,
      allow,
      deny,
    }).run(context);
    return !!response;
  });
}

export default createChannelPermission;
