import EmbedMessage from './EmbedMessage';

type RenderedMessageContent =
  | string
  | {
      embed: EmbedMessage;
    };

export default RenderedMessageContent;
