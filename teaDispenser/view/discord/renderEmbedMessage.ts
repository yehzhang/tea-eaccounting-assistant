import { MessageEmbedOptions } from 'discord.js';
import RenderedMessage from '../../data/RenderedMessage';

function renderEmbedMessage(
  embed: MessageEmbedOptions,
  reactionContents?: readonly string[],
  overwrite?: boolean
): RenderedMessage {
  return {
    content: {
      embed: {
        color: dispenserSilver,
        ...embed,
      },
    },
    reactionContents,
    overwrite,
  };
}

const dispenserSilver = 0xd3d3d3;

export default renderEmbedMessage;
