import { DMChannel, NewsChannel, TextChannel } from 'discord.js';
import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
import teaDispenserClient from './teaDispenserClient';

/** This function assumes the client is TeaDispenser. */
function fetchDiscordChannel(
  channelId: string
): Reader<EventContext, TextChannel | DMChannel | null> {
  return new Reader(async () => {
    try {
      const channel = await teaDispenserClient.channels.fetch(channelId);
      if (!channel.isText() || channel instanceof NewsChannel) {
        return logErrorWithContext('Expected message from a text channel', channel).replaceBy(null);
      }
      return channel;
    } catch (error) {
      return logErrorWithContext(
        'Unexpected error when fetching a discord channel',
        error
      ).replaceBy(null);
    }
  });
}

export default fetchDiscordChannel;
