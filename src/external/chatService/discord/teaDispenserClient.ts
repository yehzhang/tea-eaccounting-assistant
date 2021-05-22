import { Client } from 'discord.js';
import getEnvironmentVariable from '../../getEnvironmentVariable';

const teaDispenserClient = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

await Promise.all([
  teaDispenserClient.login(getEnvironmentVariable('DISCORD_BOT_TOKEN')),
  new Promise((resolve) => void teaDispenserClient.on('ready', () => resolve(null))),
]);

export default teaDispenserClient;
