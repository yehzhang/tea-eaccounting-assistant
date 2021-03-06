interface Message {
  readonly internalId: string;
  readonly externalUserId: string;
  readonly content: string;
  readonly embed: {
    readonly title: string;
    readonly description: string;
  } | null;
  readonly createdAt: Date;
  readonly mentionedRoles: readonly number[];
}

export default Message;
