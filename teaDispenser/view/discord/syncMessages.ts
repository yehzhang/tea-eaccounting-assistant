import { DMChannel, Message, MessageOptions, TextChannel, UserResolvable } from 'discord.js';
import DiscordEventContext from '../../data/DiscordEventContext';
import RenderedMessage from '../../data/RenderedMessage';
import RenderedMessageContent from '../../data/RenderedMessageContent';

async function syncMessages(
  renderedMessage: RenderedMessage | null,
  context: DiscordEventContext
): Promise<void> {
  const { channel, triggeringUser, sentMessage } = context;
  if (!renderedMessage) {
    context.sentMessage = undefined;
    await sentMessage?.delete();
    return;
  }

  const { content, replyTo, reactionContents = [], overwrite } = renderedMessage;

  const newlySentMessage = await syncMessageContent(
    content,
    channel,
    replyTo ? triggeringUser : undefined,
    overwrite ? sentMessage : undefined
  );
  context.sentMessage = newlySentMessage;

  await syncReactions(reactionContents, newlySentMessage);
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
