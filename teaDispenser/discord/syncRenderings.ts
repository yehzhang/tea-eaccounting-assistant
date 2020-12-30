import { Message, UserResolvable } from 'discord.js';
import * as _ from 'lodash';
import DiscordEventContext from '../data/DiscordEventContext';
import DiscordMessageContext from '../data/DiscordMessageContext';
import RenderedMessage from '../data/RenderedMessage';
import RenderedMessageContent from '../data/RenderedMessageContent';
import Rendering from '../data/Rendering';

async function syncRenderings(
  renderings: readonly Rendering[],
  context: DiscordEventContext
): Promise<void> {
  const [renderedMessages, renderedReactions] = _.partition(
    renderings,
    (rendering): rendering is RenderedMessage => rendering.type === 'RenderedMessage'
  );
  await Promise.all([
    syncMessages(renderedMessages, context),
    syncReactions(
      renderedReactions.map(({ content }) => content),
      context.message
    ),
  ]);
}

async function syncMessages(
  renderedMessages: readonly RenderedMessage[],
  context: DiscordEventContext
): Promise<void> {
  const { message, triggeringUser, messageContexts } = context;
  for (let messageIndex = 0; messageIndex < renderedMessages.length; messageIndex++) {
    if (!messageContexts[messageIndex]) {
      messageContexts[messageIndex] = {};
    }
    const messageContext = messageContexts[messageIndex];
    const { content, replyTo, reactionContents = [] } = renderedMessages[messageIndex];
    const sentMessage = await syncMessageContent(
      content,
      message,
      replyTo ? triggeringUser : undefined,
      messageContext
    );
    await syncReactions(reactionContents, sentMessage);
  }
}

async function syncMessageContent(
  content: RenderedMessageContent,
  message: Message,
  replyTo: UserResolvable | undefined,
  messageContext: DiscordMessageContext
): Promise<Message> {
  const discordMessage =
    typeof content === 'object'
      ? content
      : {
          content,
          // Inline reply is not supported until discord.js v13.
          reply: replyTo,
        };
  if (messageContext.sentMessage) {
    await messageContext.sentMessage.edit(discordMessage);
  } else {
    messageContext.sentMessage = await message.channel.send(discordMessage);
  }
  return messageContext.sentMessage;
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

export default syncRenderings;
