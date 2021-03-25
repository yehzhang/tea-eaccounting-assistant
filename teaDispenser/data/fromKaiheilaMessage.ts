import KaiheilaMessageType from './KaiheilaMessageType';
import Message from './Message';

function fromKaiheilaMessage(message: { readonly [key: string]: any }): Message | null {
  const { id, type, author, content, create_at } = message;
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
    isNaN(createdAt.getTime())
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
  };
}

export default fromKaiheilaMessage;
