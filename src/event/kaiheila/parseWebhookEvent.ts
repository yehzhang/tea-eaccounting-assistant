import _ from 'lodash';
import logErrorWithoutContext from '../../external/logError';
import KaiheilaMessageType from './KaiheilaMessageType';
import WebhookEvent from './WebhookEvent';

function parseWebhookEvent(data: { readonly [key: string]: any }): WebhookEvent | null {
  if (data.type === KaiheilaMessageType.TEXT || data.type === KaiheilaMessageType.IMAGE) {
    const { mention_roles: mentionedRoles, author = {} } = data.extra;
    const { username: triggeringUsername, id: triggeringUserId } = author;
    const { target_id: channelId, content } = data;
    if (
      typeof triggeringUserId !== 'string' ||
      typeof channelId !== 'string' ||
      typeof content !== 'string' ||
      typeof triggeringUsername !== 'string'
    ) {
      logErrorWithoutContext('Expected valid content', data);
      return null;
    }
    if (data.type === KaiheilaMessageType.TEXT) {
      if (!_.isArray(mentionedRoles) || !mentionedRoles.every(_.isNumber)) {
        logErrorWithoutContext('Expected valid content', data);
        return null;
      }
      return {
        type: 'TextMessage',
        channelId,
        triggeringUserId,
        triggeringUsername,
        content,
        mentionedRoles,
      };
    }
    return {
      type: 'ImageMessage',
      channelId,
      triggeringUserId,
      triggeringUsername,
      content,
    };
  }
  if (data.type === KaiheilaMessageType.SYSTEM) {
    const { extra } = data;
    if (typeof extra !== 'object' || !extra) {
      logErrorWithoutContext('Expected valid content', data);
      return null;
    }
    const { type, body } = extra;
    if (type !== 'added_reaction') {
      return null;
    }
    if (typeof body !== 'object' || !body) {
      logErrorWithoutContext('Expected valid reaction body', data);
      return null;
    }
    const { channel_id: channelId, user_id: triggeringUserId, msg_id: messageId, emoji } = body;
    if (
      typeof channelId !== 'string' ||
      typeof triggeringUserId !== 'string' ||
      typeof messageId !== 'string' ||
      typeof emoji !== 'object' ||
      !emoji ||
      typeof emoji.id !== 'string'
    ) {
      logErrorWithoutContext('Expected valid reaction body data', data);
      return null;
    }
    return {
      type: 'ReactionAdded',
      channelId,
      messageId,
      triggeringUserId,
      emojiId: emoji.id,
    };
  }
  return null;
}

export default parseWebhookEvent;
