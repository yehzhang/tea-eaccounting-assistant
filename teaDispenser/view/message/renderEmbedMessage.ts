import RenderedMessage from '../../data/RenderedMessage';

function renderEmbedMessage(
  embed: { readonly title: string; readonly description?: string },
  reactionContents?: readonly string[],
): RenderedMessage {
  return {
    content: {
      embed: {
        ...embed,
        color: dispenserSilver,
      },
    },
    reactionContents,
  };
}

const dispenserSilver = '#d3d3d3';

export default renderEmbedMessage;
