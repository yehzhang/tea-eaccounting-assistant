import _ from 'lodash';
import ChatServiceApi from '../../data/ChatServiceApi';
import EmbedMessage from '../../data/EmbedMessage';
import fromKaiheilaMessage from '../../data/fromKaiheilaMessage';
import KaiheilaMessageType from '../../data/KaiheilaMessageType';
import RenderedMessageContent from '../../data/RenderedMessageContent';
import getEnvironmentVariable from '../getEnvironmentVariable';
import { fetchKaiheila } from './fetchKaiheila';

function buildKaiheilaApi(botToken: string): ChatServiceApi {
  return {
    // TODO read from API.
    botUserId: getEnvironmentVariable('KAIHEILA_BOT_USER_ID'),

    async fetchMessage(channelId, messageId) {
      const latestMessages = await fetchKaiheilaMessages(botToken, channelId);
      const messageInLatest = latestMessages.find(({ id }) => id === messageId);
      if (messageInLatest) {
        return fromKaiheilaMessage(messageInLatest);
      }

      // Hack to find the message by listing.
      // TODO Use single query API if any.
      const afterMessages = await fetchKaiheilaMessages(botToken, channelId, messageId, 'after');
      const nextMessageId = afterMessages[0]?.id;
      if (typeof nextMessageId !== 'string') {
        return null;
      }
      const beforeMessages = await fetchKaiheilaMessages(
        botToken,
        channelId,
        nextMessageId,
        'before'
      );
      const message = beforeMessages[beforeMessages.length - 1];
      if (!message) {
        return null;
      }
      return fromKaiheilaMessage(message);
    },

    async sendMessage(channelId, content, replyToUserId) {
      // TODO implement reply to.
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/create', {
        type: KaiheilaMessageType.MARKDOWN,
        target_id: channelId,
        content: buildMessageContent(content),
      });
      if (!response) {
        return null;
      }
      const { msg_id: messageId } = response;
      if (typeof messageId !== 'string') {
        console.error('Expected string msg_id from Kaiheila, got', response);
        return null;
      }
      return messageId;
    },

    async editMessage(channelId, messageId, content, replyToUserId) {
      // TODO implement reply to.
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/update', {
        msg_id: messageId,
        content: buildMessageContent(content),
      });
      return !!response;
    },

    async deleteMessage(channelId, messageId) {
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/delete', {
        msg_id: messageId,
      });
      return !!response;
    },

    async fetchReactions(channelId, messageId) {
      // TODO Why does this API have to take an emoji param???
      // TODO Implement.
      //
      // const response = await fetchKaiheila(botToken, 'GET', '/api/v3/message/reaction-list', {
      //   msg_id: messageId,
      //   emoji: '???',
      // });
      // console.log('fetchReactions response', response)
      return [];
    },

    async reactMessage(channelId, messageId, content) {
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/add-reaction', {
        msg_id: messageId,
        emoji: content,
      });
      return !!response;
    },
  };
}

async function fetchKaiheilaMessages(
  botToken: string,
  channelId: string,
  messageId?: string,
  flag?: 'before' | 'after'
): Promise<readonly { readonly [key: string]: any }[]> {
  const response = await fetchKaiheila(botToken, 'GET', '/api/v3/message/list', {
    target_id: channelId,
    msg_id: messageId,
    flag,
  });
  if (!response) {
    return [];
  }
  if (!_.isArray(response.items)) {
    console.error('Expected items in response, got', response);
    return [];
  }

  const items = _.compact(
    response.items.map((item) => (typeof item === 'object' && item ? item : null))
  );
  if (items.length !== response.items.length) {
    console.error('Expected message items in response, got', response);
    return [];
  }

  return items;
}

function buildMessageContent(content: RenderedMessageContent): string {
  return typeof content === 'string'
    ? formatText(content)
    : buildKaiheilaCardMessage(content.embed);
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

export default buildKaiheilaApi;
