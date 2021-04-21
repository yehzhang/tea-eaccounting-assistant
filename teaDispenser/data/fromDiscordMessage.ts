import { Message as DiscordMessage } from 'discord.js';
import Message from './Message';

function fromDiscordMessage(message: DiscordMessage): Message {
  const { id, author, content, embeds, createdAt } = message;
  if (2 <= embeds.length) {
    console.warn('Expected at most one embed, got', embeds);
  }
  return {
    internalId: `discord/${id}`,
    externalUserId: author.id,
    content,
    embed: embeds[0]
      ? {
          title: embeds[0].title || '',
          description: embeds[0].description || '',
        }
      : null,
    createdAt,
    // TODO implement
    mentionedRoles: [],
  };
}

export default fromDiscordMessage;
