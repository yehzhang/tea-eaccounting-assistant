import { Message } from 'discord.js';
import EventContext from '../../../core/EventContext';
import Reader from '../../../core/Reader/Reader';
import logErrorWithContext from '../../logErrorWithContext';
import fetchDiscordChannel from './fetchDiscordChannel';

function fetchDiscordMessage(
  channelId: string,
  messageId: string
): Reader<EventContext, Message | null> {
  return fetchDiscordChannel(channelId).bind((channel) => {
    if (!channel) {
      return null;
    }

    try {
      return channel.messages.fetch(messageId);
    } catch (error) {
      return logErrorWithContext(
        'Unexpected error when fetching a discord message:',
        error
      ).replaceBy(null);
    }
  });
}

export default fetchDiscordMessage;
