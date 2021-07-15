import { Client } from 'discord.js';

const teaDispenserClient = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER'] });

if (process.env.DISCORD_BOT_TOKEN) {
  await teaDispenserClient.login(process.env.DISCORD_BOT_TOKEN);
  console.log('Using Discord Tea Dispenser,', teaDispenserClient.user?.tag);
}

export default teaDispenserClient;
