import { nanoid } from 'nanoid';
import ChatServicePermission from '../../data/ChatServicePermission';
import DispatchView from '../../data/DispatchView';
import { DmvCryButtonPressedEvent } from '../../event/Event';
import useExternalContext from '../../external/useExternalContext';
import MessageView from '../../view/message/MessageView';

async function updateOnDmvCryButtonPressed(
  event: DmvCryButtonPressedEvent,
  dispatchMessageView: DispatchView<MessageView, [channelId: string]>
): Promise<boolean> {
  const {
    kaiheilaDmv: { api },
  } = useExternalContext();
  const { triggeringUserId, messageId, emojiId, channelId } = event;
  const [message, reactionUsers, channel] = await Promise.all([
    api.fetchMessage(channelId, messageId),
    api.fetchReactionUsers(messageId, emojiId),
    api.fetchChannel(channelId),
  ]);

  if (!message) {
    // Unexpected error, but no need to inform the user.
    return false;
  }
  const { externalUserId, mentionedRoles } = message;
  if (externalUserId !== api.botUserId) {
    // Intended exit.
    return false;
  }
  const triggeringUser = reactionUsers.find((user) => user.id === triggeringUserId);
  if (!triggeringUser) {
    console.error(
      'Expected triggering user. Using random channel name',
      reactionUsers,
      triggeringUserId
    );
  }
  if (!channel) {
    // TODO Somehow inform user of the failure.
    console.error('Expected channel. Using random category', channelId);
    return false;
  }

  const { guildId, categoryId } = channel;
  const { name: username = nanoid() } = triggeringUser || {};
  const channelName = `蓝加申诉 - ${username}`;
  const newChannelId = await api.createChannel(guildId, channelName, categoryId);
  if (!newChannelId) {
    // TODO Somehow inform user of the failure.
    return false;
  }

  await Promise.all([
    api.createChannelPermission(
      newChannelId,
      /* userId= */ 0,
      /* allow= */ ChatServicePermission.NONE,
      /* deny= */ ChatServicePermission.VIEW
    ),
    api.createChannelPermission(
      newChannelId,
      triggeringUserId,
      /* allow= */ ChatServicePermission.VIEW,
      /* deny= */ ChatServicePermission.NONE
    ),
    ...mentionedRoles.map((mentionedRole) =>
      api.createChannelPermission(
        newChannelId,
        mentionedRole,
        /* allow= */ ChatServicePermission.INVITATION_LINK |
          ChatServicePermission.CHANNEL_METADATA |
          ChatServicePermission.PERMISSION |
          ChatServicePermission.VIEW,
        /* deny= */ ChatServicePermission.NONE
      )
    ),
  ]);

  return dispatchMessageView(
    {
      type: 'BlueFuckeryTicketIntroductionView',
      mentionedRoles
    },
    newChannelId
  );
}

export default updateOnDmvCryButtonPressed;
