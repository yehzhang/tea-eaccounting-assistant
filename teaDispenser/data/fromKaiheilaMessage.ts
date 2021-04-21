import _ from 'lodash';
import KaiheilaMessageType from '../event/kaiheila/KaiheilaMessageType';
import Message from './Message';

function fromKaiheilaMessage(message: { readonly [key: string]: any }): Message | null {
  const { id, type, author, content, create_at, mention_roles: mentionedRoles } = message;
  if (type !== KaiheilaMessageType.MARKDOWN) {
    // Only markdown message is currently sent.
    // TODO Change to support embed message.
    return null;
  }
  const createdAt = new Date(create_at);
  if (
    typeof id !== 'string' ||
    typeof author.id !== 'string' ||
    typeof content !== 'string' ||
    isNaN(createdAt.getTime()) ||
    !_.isArray(mentionedRoles) ||
    !mentionedRoles.every(_.isNumber)
  ) {
    console.error('Expected valid Kaiheila message, got', message);
    return null;
  }

  // TODO Implement embed message.
  const { groups } = content.match(/^\*\*(?<title>.*分赃记录)\*\*\n(?<description>(.|\n)+)/m) || {};
  return {
    internalId: `kaiheila/${id}`,
    externalUserId: author.id,
    content: groups ? '' : content,
    embed: groups
      ? {
          title: groups.title,
          description: groups.description,
        }
      : null,
    createdAt,
    mentionedRoles,
  };
}

export default fromKaiheilaMessage;
