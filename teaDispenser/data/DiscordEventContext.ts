import { DMChannel, Message, TextChannel, User } from 'discord.js';

interface DiscordEventContext {
  readonly type: 'DiscordEventContext';
  readonly channel: TextChannel | DMChannel;
  readonly triggeringUser?: User;
  sentMessage?: Message;
}

export default DiscordEventContext;
