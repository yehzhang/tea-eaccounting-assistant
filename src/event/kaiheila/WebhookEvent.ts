type WebhookEvent =
  | {
      readonly type: 'TextMessage';
      readonly channelId: string;
      readonly triggeringUserId: string;
      readonly triggeringUsername: string;
      readonly content: string;
      readonly mentionedRoles: readonly number[];
    }
  | {
      readonly type: 'ImageMessage';
      readonly channelId: string;
      readonly triggeringUserId: string;
      readonly triggeringUsername: string;
      readonly content: string;
    }
  | {
      readonly type: 'ReactionAdded';
      readonly channelId: string;
      readonly messageId: string;
      readonly emojiId: string;
      readonly triggeringUserId: string;
    };

export default WebhookEvent;
