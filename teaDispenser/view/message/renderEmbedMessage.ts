import RenderedMessage from '../../data/RenderedMessage';

function renderEmbedMessage(
  embed: { readonly title: string; readonly description?: string },
  reactionContents?: readonly string[],
  skippable?: boolean,
): RenderedMessage {
  return {
    content: {
      embed: {
        ...embed,
        color: dispenserSilver,
      },
    },
    reactionContents,
    skippable,
  };
}

const dispenserSilver = '#d3d3d3';

export default renderEmbedMessage;
