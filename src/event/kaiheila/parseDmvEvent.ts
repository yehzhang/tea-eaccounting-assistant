import { dmvBotUserId } from '../../external/chatService/kaiheila/botUserIds';
import Event, { DmvChatServiceEventCommon } from '../Event';
import WebhookEvent from './WebhookEvent';

function parseDmvEvent(event: WebhookEvent): (Event & DmvChatServiceEventCommon) | null {
  // Ignore events triggered by the bot itself.
  if (event.triggeringUserId === dmvBotUserId) {
    return null;
  }

  switch (event.type) {
    case 'TextMessage': {
      const { content, channelId, mentionedRoles } = event;
      if (content === 'ping') {
        return {
          type: '[Chat] Pinged',
          chatService: 'kaiheilaDmv',
          channelId,
        };
      }
      if (content.startsWith('!install')) {
        return {
          type: '[Dmv] InstallCommandIssued',
          chatService: 'kaiheilaDmv',
          channelId,
          mentionedRoles,
        };
      }
      return null;
    }
    case 'ReactionAdded': {
      const { channelId, messageId, emojiId, triggeringUserId } = event;
      if (emojiId === '[#128546;]') {
        return {
          type: '[Dmv] CryButtonPressed',
          chatService: 'kaiheilaDmv',
          channelId,
          triggeringUserId,
          messageId,
          emojiId,
        };
      }
      return null;
    }
    case 'ImageMessage':
      return null;
  }
}

export default parseDmvEvent;
