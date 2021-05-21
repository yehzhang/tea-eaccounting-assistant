import { nanoid } from 'nanoid';
import allReaders from '../../core/Reader/allReaders';
import Reader from '../../core/Reader/Reader';
import ChatServicePermission from '../../data/ChatServicePermission';
import { DmvCryButtonPressedEvent } from '../../event/Event';
import botUserIdReader from '../../external/chatService/botUserIdReader';
import createChannel from '../../external/chatService/createChannel';
import createChannelPermission from '../../external/chatService/createChannelPermission';
import fetchChannel from '../../external/chatService/fetchChannel';
import fetchMessage from '../../external/chatService/fetchMessage';
import fetchReactionUsers from '../../external/chatService/fetchReactionUsers';
import logError from '../../external/logError';
import logErrorWithContext from '../../external/logErrorWithContext';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';

function updateOnDmvCryButtonPressed(
  event: DmvCryButtonPressedEvent
): Reader<MessageRenderingContext, boolean> {
  const { triggeringUserId, messageId, emojiId, channelId } = event;
  return allReaders([
    fetchMessage(channelId, messageId),
    fetchReactionUsers(messageId, emojiId),
    fetchChannel(channelId),
    botUserIdReader,
  ]).bind(([message, reactionUsers, channel, botUserId]) => {
    if (!message) {
      // Unexpected error, but no need to inform the user.
      return false;
    }
    const { externalUserId, mentionedRoles } = message;
    if (externalUserId !== botUserId) {
      // Intended exit.
      return false;
    }
    const triggeringUser = reactionUsers.find((user) => user.id === triggeringUserId);
    if (!triggeringUser) {
      logError('Expected triggering user. Using random channel name', {
        reactionUsers,
        triggeringUserId,
      });
    }
    if (!channel) {
      // TODO Somehow inform user of the failure.
      return logErrorWithContext('Expected channel. Using random category', channelId).replaceBy(
        false
      );
    }

    const { guildId, categoryId } = channel;
    const { name: username = nanoid() } = triggeringUser || {};
    const channelName = `蓝加申诉 - ${username}`;
    return createChannel(guildId, channelName, categoryId).bind((newChannelId) => {
      if (!newChannelId) {
        // TODO Somehow inform user of the failure.
        return false;
      }

      return allReaders([
        createChannelPermission(
          newChannelId,
          /* userId= */ 0,
          /* allow= */ ChatServicePermission.NONE,
          /* deny= */ ChatServicePermission.VIEW
        ),
        createChannelPermission(
          newChannelId,
          triggeringUserId,
          /* allow= */ ChatServicePermission.VIEW,
          /* deny= */ ChatServicePermission.NONE
        ),
        ...mentionedRoles.map((mentionedRole) =>
          createChannelPermission(
            newChannelId,
            mentionedRole,
            /* allow= */ ChatServicePermission.INVITATION_LINK |
              ChatServicePermission.CHANNEL_METADATA |
              ChatServicePermission.PERMISSION |
              ChatServicePermission.VIEW,
            /* deny= */ ChatServicePermission.NONE
          )
        ),
      ])
        .sequence(
          dispatchView({
            type: 'BlueFuckeryTicketIntroductionView',
            mentionedRoles,
          })
        )
        .mapContext((context: MessageRenderingContext) => ({
          ...context,
          channelId: newChannelId,
          replyToUserId: event.triggeringUserId,
        }));
    });
  });
}

export default updateOnDmvCryButtonPressed;
