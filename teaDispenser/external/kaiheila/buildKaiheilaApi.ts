import _ from 'lodash';
import Channel from '../../data/Channel';
import ChatServiceApi from '../../data/ChatServiceApi';
import EmbedMessage from '../../data/EmbedMessage';
import fromKaiheilaMessage from '../../data/fromKaiheilaMessage';
import RenderedMessageContent from '../../data/RenderedMessageContent';
import KaiheilaMessageType from '../../event/kaiheila/KaiheilaMessageType';
import fetchBotUserId from './fetchBotUserId';
import fetchKaiheila from './fetchKaiheila';

async function buildKaiheilaApi(botToken: string): Promise<ChatServiceApi> {
  return {
    botUserId: await fetchBotUserId(botToken),

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
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/create', {
        type: KaiheilaMessageType.MARKDOWN,
        target_id: channelId,
        content: buildMessageContent(content, replyToUserId),
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
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/update', {
        msg_id: messageId,
        content: buildMessageContent(content, replyToUserId),
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
      // TODO Remove. Force reactions to be passed from the message event.
      return [];
    },

    async fetchReactionUsers(messageId, emojiId) {
      const response = await fetchKaiheila(botToken, 'GET', '/api/v3/message/reaction-list', {
        msg_id: messageId,
        emoji: emojiId,
      });
      if (!response) {
        return [];
      }

      if (!_.isArray(response)) {
        console.error('Expected user array, got', response);
        return [];
      }
      return _.compact(
        response.map((userData) => {
          if (typeof userData !== 'object' || !userData) {
            console.error('Expected user object, got', response);
            return null;
          }
          // `nickname` is actually the same as `username` - no server nicknames available.
          const { id, nickname } = userData;
          if (typeof id !== 'string' || typeof nickname !== 'string') {
            console.error('Expected valid user object, got', response);
            return null;
          }
          return {
            id,
            name: nickname,
          };
        })
      );
    },

    async reactMessage(channelId, messageId, content) {
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/message/add-reaction', {
        msg_id: messageId,
        emoji: content,
      });
      return !!response;
    },

    async createChannel(guildId, name, categoryId): Promise<string | null> {
      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/channel/create', {
        guild_id: guildId,
        parent_id: categoryId,
        name,
      });
      if (!response) {
        return null;
      }
      const { id } = response || {};
      if (typeof id !== 'string') {
        console.error('Expected channel id in response, got', response);
        return null;
      }
      return id;
    },

    async createChannelPermission(channelId, userId, allow, deny): Promise<boolean> {
      // The everyone role is always created already.
      if (userId !== 0) {
        const creationResponse = await fetchKaiheila(
          botToken,
          'POST',
          '/api/v3/channel-role/create',
          {
            channel_id: channelId,
            type: typeof userId === 'number' ? 'role_id' : 'user_id',
            value: userId,
          }
        );
        if (!creationResponse) {
          return false;
        }
      }

      const response = await fetchKaiheila(botToken, 'POST', '/api/v3/channel-role/update', {
        channel_id: channelId,
        type: typeof userId === 'number' ? 'role_id' : 'user_id',
        value: userId,
        allow,
        deny,
      });
      return !!response;
    },

    async fetchChannel(channelId: string): Promise<Channel | null> {
      const response = await fetchKaiheila(botToken, 'GET', '/api/v3/channel/view', {
        target_id: channelId,
      });
      if (!response) {
        return null;
      }

      const { id, guild_id: guildId, parent_id: categoryId } = response;
      if (typeof id !== 'string' || typeof guildId !== 'string' || typeof categoryId !== 'string') {
        console.error('Expected valid channel, got', response);
        return null;
      }

      return {
        id,
        guildId,
        categoryId,
      };
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

export default buildKaiheilaApi;
