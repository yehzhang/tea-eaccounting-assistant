import { DMChannel, Message, TextChannel } from 'discord.js';

async function fetchDiscordMessage(
  channel: TextChannel | DMChannel,
  messageId: string
): Promise<Message | null> {
  try {
    return channel.messages.fetch(messageId);
  } catch (error) {
    console.error('Unexpected error when fetching a discord message:', error);
    return null;
  }
}

export default fetchDiscordMessage;
