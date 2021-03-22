import RenderedMessageContent from './RenderedMessageContent';

interface RenderedMessage {
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
  readonly replyTo?: 'user' | 'message';
  readonly overwrite?: boolean;
}

export default RenderedMessage;
