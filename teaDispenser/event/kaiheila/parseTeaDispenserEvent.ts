import Event, { TeaDispenserChatServiceEventCommon } from '../Event';
import WebhookEvent from './WebhookEvent';

function parseTeaDispenserEvent(
  event: WebhookEvent,
  botUserId: string
): (Event & TeaDispenserChatServiceEventCommon) | null {
  // Ignore events triggered by the bot itself.
  if (event.triggeringUserId === botUserId) {
    return null;
  }

  switch (event.type) {
    case 'TextMessage': {
      const { content, channelId } = event;
      if (content === 'ping') {
        return {
          type: '[Chat] Pinged',
          chatService: 'kaiheilaTeaDispenser',
          channelId,
        };
      }

      // TODO parse and support commands.
      return null;
    }
    case 'ImageMessage': {
      const { triggeringUserNickname, content, channelId } = event;
      return {
        type: '[TeaDispenser] ImagePosted',
        chatService: 'kaiheilaTeaDispenser',
        channelId,
        urls: [content],
        username: triggeringUserNickname,
      };
    }
    case 'ReactionAdded': {
      const { channelId, messageId, emojiId, triggeringUserId } = event;
      const eventCommon: TeaDispenserChatServiceEventCommon = {
        chatService: 'kaiheilaTeaDispenser',
        channelId,
      };
      if (emojiId === '[#128588;]') {
        return {
          type: '[TeaDispenser] HandsUpButtonPressed',
          ...eventCommon,
          messageId: messageId,
        };
      }
      if (emojiId === '[#129373;]') {
        return {
          type: '[TeaDispenser] KiwiButtonPressed',
          ...eventCommon,
          messageId: messageId,
          triggeringUserId,
        };
      }
      return null;
    }
  }
}

export default parseTeaDispenserEvent;
