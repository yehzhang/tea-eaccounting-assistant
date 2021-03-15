import { DMChannel, TextChannel, User } from 'discord.js';
import DiscordMessageContext from './DiscordMessageContext';

interface DiscordEventContext {
  readonly type: 'DiscordEventContext';
  readonly channel: TextChannel | DMChannel;
  readonly triggeringUser?: User;
  readonly messageContexts: DiscordMessageContext[];
}

export default DiscordEventContext;
