import ChatServiceApi from '../../data/ChatServiceApi';
import KaiheilaMessageType from '../../data/KaiheilaMessageType';
import Event from '../Event';
import parseEventFromMessageReaction from './parseEventFromMessageReaction';

async function parseEventFromWebhookEvent(
  data: { readonly [key: string]: any },
  chatServiceApi: ChatServiceApi,
): Promise<Event | null> {
  if (data.type === KaiheilaMessageType.TEXT) {
    const triggeringUserId = data.extra?.author?.id;
    const { target_id: channelId, content } = data;
    if (
      typeof triggeringUserId !== 'string' ||
      typeof channelId !== 'string' ||
      typeof content !== 'string'
    ) {
      console.error('Expected valid content, got', data);
      return null;
    }

    if (triggeringUserId === chatServiceApi.botUserId) {
      return null;
    }

    if (content === 'ping') {
      return {
        type: '[Chat] Pinged',
        chatService: 'kaiheila',
        channelId,
        triggeringUserId,
      };
    }

    // TODO parse and support commands.

    return null;
  }
  if (data.type === KaiheilaMessageType.IMAGE) {
    const { nickname: username, id: triggeringUserId } = data.extra?.author || {};
    const channelId = data.target_id;
    if (
      typeof data.content !== 'string' ||
      typeof username !== 'string' ||
      typeof triggeringUserId !== 'string' ||
      typeof channelId !== 'string'
    ) {
      console.error('Expected valid content, got', data);
      return null;
    }

    if (triggeringUserId === chatServiceApi.botUserId) {
      return null;
    }

    return {
      type: '[Chat] ImagePosted',
      chatService: 'kaiheila',
      channelId,
      triggeringUserId,
      urls: [data.content],
      username,
    };
  }
  if (data.type === KaiheilaMessageType.SYSTEM) {
    const { extra } = data;
    if (typeof extra !== 'object' || !extra) {
      console.error('Expected valid content, got', data);
      return null;
    }
    const { type, body } = extra;
    if (type !== 'added_reaction') {
      return null;
    }
    if (typeof body !== 'object' || !body) {
      console.error('Expected valid reaction body, got', data);
      return null;
    }
    const { channel_id: channelId, user_id: triggeringUserId, msg_id: messageId, emoji } = body;
    if (
      typeof channelId !== 'string' ||
      typeof triggeringUserId !== 'string' ||
      typeof messageId !== 'string' ||
      typeof emoji !== 'object' ||
      !emoji
    ) {
      console.error('Expected valid reaction body data, got', data);
      return null;
    }

    // TODO Remove this once update logic is updated.
    if (triggeringUserId === chatServiceApi.botUserId) {
      return null;
    }

    const message = await chatServiceApi.fetchMessage(channelId, messageId);
    if (!message || message.externalUserId !== chatServiceApi.botUserId) {
      return null;
    }
    return parseEventFromMessageReaction(emoji.id, message, messageId, channelId, triggeringUserId);
  }
  return null;
}

export default parseEventFromWebhookEvent;
