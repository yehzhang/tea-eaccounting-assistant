import { DMChannel, NewsChannel, TextChannel } from 'discord.js';
import Reader from '../../../core/Reader/Reader';
import EventContext from '../../EventContext';

function fetchDiscordChannel(
  channelId: string
): Reader<EventContext, TextChannel | DMChannel | null> {
  return new Reader(async ({ externalContext: { discordBot } }) => {
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
  });
}

export default fetchDiscordChannel;
