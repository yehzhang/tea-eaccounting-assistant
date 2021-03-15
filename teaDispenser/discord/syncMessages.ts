import { DMChannel, Message, MessageOptions, TextChannel, UserResolvable } from 'discord.js';
import DiscordEventContext from '../data/DiscordEventContext';
import RenderedMessage from '../data/RenderedMessage';
import RenderedMessageContent from '../data/RenderedMessageContent';

async function syncMessages(
  renderedMessages: readonly RenderedMessage[],
  context: DiscordEventContext
): Promise<void> {
  const { channel, triggeringUser, messageContexts } = context;
  const messageCount = Math.max(renderedMessages.length, messageContexts.length);
  for (let messageIndex = 0; messageIndex < messageCount; messageIndex++) {
    if (!messageContexts[messageIndex]) {
      messageContexts[messageIndex] = {};
    } else if (!renderedMessages[messageIndex]) {
      const messageContext = messageContexts[messageIndex];
      delete messageContexts[messageIndex];

      await messageContext.sentMessage?.delete();

      continue;
    }

    const { content, replyTo, reactionContents = [], overwrite } = renderedMessages[messageIndex];
    if (!overwrite) {
      messageContexts.splice(messageIndex, 0, {});
    }

    const messageContext = messageContexts[messageIndex];
    const sentMessage = await syncMessageContent(
      content,
      channel,
      replyTo ? triggeringUser : undefined,
      messageContext.sentMessage
    );
    messageContext.sentMessage = sentMessage;

    await syncReactions(reactionContents, sentMessage);
  }
}

async function syncMessageContent(
  content: RenderedMessageContent,
  channel: TextChannel | DMChannel,
  replyTo: UserResolvable | undefined,
  sentMessage: Message | undefined
): Promise<Message> {
  const discordMessage: MessageOptions & { split?: false } =
    typeof content === 'object'
      ? content
      : {
          content,
          // Inline reply is not supported until discord.js v13.
          reply: replyTo,
        };
  if (sentMessage) {
    await sentMessage.edit({
      // Remove the existing embed message, if any.
      embed: null,
      ...discordMessage,
    });
    return sentMessage;
  }
  return channel.send(discordMessage);
}

async function syncReactions(reactionContents: readonly string[], message: Message) {
  await Promise.all([
    // TODO recover
    // Remove reactions no longer rendered.
    // ...message.reactions.cache
    //     .filter(reaction =>
    //         reaction.users.cache.has(clientUserId) && !reactionContents.find(
    //         reactionContent => reactionContent === reaction.emoji.name))
    //     .map(reaction => reaction.users.remove(clientUserId)),
    // Add reactions newly rendered.
    ...reactionContents
      .filter(
        (reactionContent) =>
          !message.reactions.cache.find((reaction) => reactionContent === reaction.emoji.name)
      )
      .map((reactionContent) => message.react(reactionContent)),
  ]);
}

export default syncMessages;
