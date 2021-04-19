import { Client, MessageOptions } from 'discord.js';
import fromDiscordMessage from '../data/fromDiscordMessage';
import MessageApi from '../data/MessageApi';
import RenderedMessageContent from '../data/RenderedMessageContent';
import fetchDiscordChannel from './fetchDiscordChannel';
import fetchDiscordMessage from './fetchDiscordMessage';

function buildDiscordApi(discordBot: Client): MessageApi {
  const { user } = discordBot;
  if (!user) {
    throw new TypeError('Expected signed in Discord bot');
  }
  return {
    userId: user.id,

    async fetchMessage(channelId, messageId) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      const message = channel && (await fetchDiscordMessage(channel, messageId));
      return message && fromDiscordMessage(message);
    },

    async sendMessage(channelId, content, replyToUserId) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      if (!channel) {
        return null;
      }

      try {
        const message = await channel.send(buildMessageOptions(content, replyToUserId));
        return message.id;
      } catch (e) {
        console.error('Unexpected error when sending a Discord message', e);
        return null;
      }
    },

    async editMessage(channelId, messageId, content, replyToUserId) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      const message = channel && (await fetchDiscordMessage(channel, messageId));
      if (!message) {
        return false;
      }

      try {
        await message.edit({
          // Remove the existing embed message, if any.
          embed: null,
          ...buildMessageOptions(content, replyToUserId),
        });
        return true;
      } catch (e) {
        console.error('Unexpected error when editing a Discord message', e);
        return false;
      }
    },

    async deleteMessage(channelId, messageId) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      const message = channel && (await fetchDiscordMessage(channel, messageId));
      if (!message) {
        return false;
      }

      try {
        await message.delete();
        return true;
      } catch (e) {
        console.error('Unexpected error when deleting a Discord message', e);
        return false;
      }
    },

    async fetchReactions(channelId, messageId) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      const message = channel && (await fetchDiscordMessage(channel, messageId));
      if (!message) {
        return [];
      }
      try {
        return message.reactions.cache
          .map((reaction) =>
            reaction.users.cache.map((user) => ({
              userId: user.id,
              content: reaction.emoji.name,
            }))
          )
          .flat();
      } catch (e) {
        console.error('Unexpected error when fetching Discord reactions', e);
        return [];
      }
    },

    async reactMessage(channelId, messageId, content) {
      const channel = await fetchDiscordChannel(discordBot, channelId);
      const message = channel && (await fetchDiscordMessage(channel, messageId));
      if (!message) {
        return false;
      }

      try {
        await message.react(content);
        return true;
      } catch (e) {
        console.error('Unexpected error when reacting to a Discord message', e);
        return false;
      }
    },
  };
}

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

export default buildDiscordApi;
