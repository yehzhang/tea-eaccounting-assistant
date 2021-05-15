import { MessageOptions } from 'discord.js';
import RenderedMessageContent from '../../../data/RenderedMessageContent';

function buildMessageOptions(
  content: RenderedMessageContent,
  replyToUserId?: string
): MessageOptions & { split?: false } {
  return typeof content === 'object'
    ? {
        ...content,
        embed: {
          ...content.embed,
          description: content.embed.description && formatText(content.embed.description),
        },
      }
    : {
        content: formatText(content),
        // Inline reply is not supported until message.js v13.
        reply: replyToUserId,
      };
}

function formatText(text: string): string {
  // Strip double line breaks at the end of code blocks. A code block automatically adds a line
  // break at the end.
  return text.replace(/```(((?!```)(.|\n))+?)```\n\n/g, '```$1```\n');
}

export default buildMessageOptions;
