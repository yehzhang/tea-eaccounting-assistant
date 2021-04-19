import KaiheilaMessageType from '../../data/KaiheilaMessageType';
import MessageApi from '../../data/MessageApi';
import parseFleetLootRecord from '../discord/parseFleetLootRecord';
import Event, { MessageServiceEventCommon } from '../Event';

async function parseEventsFromWebhookEvent(
  data: { readonly [key: string]: any },
  messageApi: MessageApi
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

    if (triggeringUserId === messageApi.userId) {
      return null;
    }

    if (content === 'ping') {
      return {
        type: '[Message] Pinged',
        messageServiceProvider: 'kaiheila',
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

    if (triggeringUserId === messageApi.userId) {
      return null;
    }

    return {
      type: '[Message] ImagePosted',
      messageServiceProvider: 'kaiheila',
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
    if (triggeringUserId === messageApi.userId) {
      return null;
    }

    const message = await messageApi.fetchMessage(channelId, messageId);
    if (!message || message.externalUserId !== messageApi.userId) {
      return null;
    }
    const fleetLootRecord = parseFleetLootRecord(message);
    if (!fleetLootRecord) {
      return null;
    }

    const eventCommon: MessageServiceEventCommon = {
      messageServiceProvider: 'kaiheila',
      channelId,
      triggeringUserId,
    };
    if (emoji.id === '[#128588;]') {
      return {
        type: '[Message] HandsUpButtonPressed',
        ...eventCommon,
        fleetLoot: fleetLootRecord.fleetLoot,
        fleetLootRecordTitle: fleetLootRecord.title,
        needs: fleetLootRecord.needs,
      };
    }
    if (emoji.id === '[#129373;]') {
      return {
        type: '[Message] KiwiButtonPressed',
        ...eventCommon,
        fleetLootRecord,
        userId: triggeringUserId,
        buttonAssociatedMessageId: messageId,
      };
    }
    return null;
  }
  return null;
}

export default parseEventsFromWebhookEvent;
