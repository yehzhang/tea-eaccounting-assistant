import { DMChannel, NewsChannel, TextChannel } from 'discord.js';
import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import teaDispenserClient from './teaDispenserClient';

/** This function assumes the client is TeaDispenser. */
function fetchDiscordChannel(
  channelId: string
): Reader<EventContext, TextChannel | DMChannel | null> {
  return new Reader(async () => {
    try {
      const channel = await teaDispenserClient.channels.fetch(channelId);
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
