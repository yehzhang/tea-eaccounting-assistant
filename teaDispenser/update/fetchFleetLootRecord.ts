import { Client, DMChannel, Message, TextChannel } from 'discord.js';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import WebServerEventContext from '../data/WebServerEventContext';
import parseFleetLootRecord from '../discord/parseFleetLootRecord';
import WebServerView from '../view/webServer/WebServerView';
import fetchDiscordMessage from './fetchDiscordMessage';

async function fetchFleetLootRecord(
  discordBot: Client,
  channelId: string,
  messageId: string,
  dispatchWebView: DispatchView<WebServerView, WebServerEventContext>,
  context: WebServerEventContext
): Promise<{
  readonly fleetLootRecord: FleetLootRecord;
  readonly message: Message;
  readonly channel: TextChannel | DMChannel;
} | void> {
  const fetchResult = await fetchAuthorizedMessage(discordBot, channelId, messageId);
  if (!fetchResult) {
    return dispatchWebView(
      {
        type: 'InvalidFleetLootRecord',
      },
      context
    );
  }

  const [message, channel] = fetchResult;
  const fleetLootRecord = parseFleetLootRecord(message);
  if (!fleetLootRecord) {
    return dispatchWebView(
      {
        type: 'InvalidFleetLootRecord',
      },
      context
    );
  }

  return {
    message,
    channel,
    fleetLootRecord,
  };
}

async function fetchAuthorizedMessage(
  discordBot: Client,
  channelId: string,
  messageId: string
): Promise<[Message, TextChannel | DMChannel] | null> {
  const { user: discordBotUser } = discordBot;
  if (!discordBotUser) {
    console.error('Expected signed-in user from Discord bot:', discordBot);
    return null;
  }

  const fetchResult = await fetchDiscordMessage(discordBot, channelId, messageId);
  if (!fetchResult) {
    return null;
  }

  if (fetchResult[0].author.id !== discordBotUser.id) {
    console.warn('Unexpected access to an unauthorized message:', {
      channelId,
      messageId,
      fetchResult,
      discordBot,
    });
    return null;
  }

  return fetchResult;
}

export default fetchFleetLootRecord;
