import { Client, DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';

async function fetchDiscordMessage(
  discordBot: Client,
  channelId: string,
  messageId: string
): Promise<[Message, TextChannel | DMChannel] | null> {
  try {
    const channel = await discordBot.channels.fetch(channelId);
    if (!channel.isText() || channel instanceof NewsChannel) {
      console.error('Expected message from a text channel, got', channel);
      return null;
    }

    const message = await channel.messages.fetch(messageId);
    return [message, channel];
  } catch (error) {
    console.error('Unexpected error when fetching a discord message:', error);
    return null;
  }
}

export default fetchDiscordMessage;
