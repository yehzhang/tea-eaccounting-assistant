import Reader from '../../core/Reader/Reader';
import ChatServiceContext from '../../data/ChatServiceContext';
import ChatServicePermission from '../../data/ChatServicePermission';
import EventContext from '../EventContext';
import chooseExternalApi from './chooseExternalApi';
import kaiheilaCreateChannelPermission from './kaiheila/createChannelPermission';

/** If `userId` is number, it means role ID. `0` means everyone. */
function createChannelPermission(
  channelId: string,
  userId: string | number,
  allow: ChatServicePermission,
  deny: ChatServicePermission
): Reader<EventContext & ChatServiceContext, boolean> {
  return chooseExternalApi({
    discord: new Reader(() => {
      throw new TypeError('Not implemented');
    }),
    kaiheila: kaiheilaCreateChannelPermission(channelId, userId, allow, deny),
  });
}

export default createChannelPermission;
