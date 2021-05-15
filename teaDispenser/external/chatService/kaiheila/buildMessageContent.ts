import _ from 'lodash';
import EmbedMessage from '../../../data/EmbedMessage';
import RenderedMessageContent from '../../../data/RenderedMessageContent';

function buildMessageContent(content: RenderedMessageContent, replyToUserId?: string): string {
  const mentionText = replyToUserId ? `(met)${replyToUserId}(met) ` : '';
  const bodyText =
    typeof content === 'string' ? formatText(content) : buildKaiheilaCardMessage(content.embed);
  return `${mentionText}${bodyText}`;
}

function buildKaiheilaCardMessage({ title, description }: EmbedMessage): string {
  return _.compact([`**${title}**`, description && formatText(description)]).join('\n');
  // Kaiheila does not support editing embeds yet, so returning text message instead.
  // return JSON.stringify([
  //   {
  //     type: 'card',
  //     color,
  //     modules: _.compact([
  //       {
  //         type: 'header',
  //         text: {
  //           type: 'plain-text',
  //           content: title,
  //         },
  //       },
  //       description && {
  //         type: 'section',
  //         text: {
  //           type: 'kmarkdown',
  //           content: description,
  //         },
  //       },
  //     ]),
  //   },
  // ]);
}

function formatText(text: string): string {
  // Kaiheila uses a dialect of Markdown called KMarkdown.
  return text.replace(/__/g, '(ins)');
}

export default buildMessageContent;
