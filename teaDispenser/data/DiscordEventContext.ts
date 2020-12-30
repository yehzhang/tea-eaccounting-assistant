import { Message, User } from 'discord.js';
import DiscordMessageContext from './DiscordMessageContext';

interface DiscordEventContext {
  readonly message: Message;
  readonly triggeringUser: User;
  readonly clientUser: User;
  readonly messageContexts: DiscordMessageContext[];
}

export default DiscordEventContext;
