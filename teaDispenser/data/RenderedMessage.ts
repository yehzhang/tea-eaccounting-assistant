import RenderedMessageContent from './RenderedMessageContent';

interface RenderedMessage {
  readonly type: 'RenderedMessage';
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
  readonly replyTo?: 'user' | 'message';
}

export default RenderedMessage;
