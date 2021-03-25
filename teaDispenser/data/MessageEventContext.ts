interface MessageEventContext {
  readonly eventId: string;
  readonly serviceProvider: 'discord' | 'kaiheila';
  readonly channelId: string;
  readonly triggeringUserId?: string;
  messageIdToEdit: string | null;
}

export default MessageEventContext;
