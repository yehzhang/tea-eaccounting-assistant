import RenderedMessageContent from './RenderedMessageContent';

interface RenderedMessage {
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
  readonly replyTo?: 'user';
}

export default RenderedMessage;
