import RenderedMessageContent from './RenderedMessageContent';

interface RenderedMessage {
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
  readonly replyTo?: 'user';
  /** Whether the message can skip rendering, e.g., when throttled. */
  readonly skippable?: boolean;
}

export default RenderedMessage;
