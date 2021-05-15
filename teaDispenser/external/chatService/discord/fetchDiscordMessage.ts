import { Message } from 'discord.js';
import Reader from '../../../core/Reader/Reader';
import EventContext from '../../EventContext';
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
      console.error('Unexpected error when fetching a discord message:', error);
      return null;
    }
  });
}

export default fetchDiscordMessage;
