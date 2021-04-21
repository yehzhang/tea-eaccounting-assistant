import { Client, DMChannel, NewsChannel, TextChannel } from 'discord.js';

async function fetchDiscordChannel(
  discordBot: Client,
  channelId: string
): Promise<TextChannel | DMChannel | null> {
  try {
    const channel = await discordBot.channels.fetch(channelId);
    if (!channel.isText() || channel instanceof NewsChannel) {
      console.error('Expected message from a text channel, got', channel);
      return null;
    }
    return channel;
  } catch (error) {
    console.error('Unexpected error when fetching a discord channel:', error);
    return null;
  }
}

export default fetchDiscordChannel;
