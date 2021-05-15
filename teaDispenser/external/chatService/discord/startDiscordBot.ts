import { Client } from 'discord.js';
import getEnvironmentVariable from '../../getEnvironmentVariable';

async function startDiscordBot(): Promise<Client> {
  const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });
  await Promise.all([
    client.login(getEnvironmentVariable('DISCORD_BOT_TOKEN')),
    new Promise((resolve) => void client.on('ready', () => resolve(null))),
  ]);
  return client;
}

export default startDiscordBot;
