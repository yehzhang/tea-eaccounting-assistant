import RenderedMessageContent from './RenderedMessageContent';

interface RenderedMessage {
  readonly type: 'RenderedMessage';
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
  readonly replyTo: 'user' | 'message' | null;
  readonly overwrite?: boolean;
}

export default RenderedMessage;
