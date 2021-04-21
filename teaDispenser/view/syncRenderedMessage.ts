import AsyncLock from 'async-lock';
import ChatServiceApi from '../data/ChatServiceApi';
import MessageEventContext from '../data/MessageEventContext';
import RenderedMessage from '../data/RenderedMessage';
import RenderedMessageContent from '../data/RenderedMessageContent';
import useChatServiceContext from '../external/useChatServiceContext';

async function syncRenderedMessage(
  renderedMessage: RenderedMessage | null,
  context: MessageEventContext
): Promise<boolean> {
  if (lock.isBusy(context.eventId) && renderedMessage?.skippable) {
    return false;
  }

  // Avoid race conditions that create a second message which could have been an edit.
  await lock.acquire(context.eventId, async () => {
    const { channelId, replyToUserId, messageIdToEdit, chatService } = context;
    const { api } = useChatServiceContext(chatService);
    if (!renderedMessage) {
      if (messageIdToEdit) {
        await api.deleteMessage(channelId, messageIdToEdit);
      }
      context.messageIdToEdit = null;
      return;
    }

    const { content, replyTo, reactionContents = [] } = renderedMessage;
    const newlySentMessageId = await syncMessageContent(
      content,
      channelId,
      (replyTo && replyToUserId) ?? undefined,
      messageIdToEdit,
      api
    );
    context.messageIdToEdit = newlySentMessageId;

    if (newlySentMessageId) {
      await syncReactions(reactionContents, channelId, newlySentMessageId, api);
    }
  });
  return true;
}

async function syncMessageContent(
  content: RenderedMessageContent,
  channelId: string,
  replyToUserId: string | undefined,
  sentMessageId: string | null,
  chatServiceApi: ChatServiceApi
): Promise<string | null> {
  if (sentMessageId) {
    await chatServiceApi.editMessage(channelId, sentMessageId, content, replyToUserId);
    return sentMessageId;
  }
  return chatServiceApi.sendMessage(channelId, content, replyToUserId);
}

async function syncReactions(
  reactionContents: readonly string[],
  channelId: string,
  messageId: string,
  chatServiceApi: ChatServiceApi
): Promise<void> {
  const reactions = await chatServiceApi.fetchReactions(channelId, messageId);
  await Promise.all([
    // TODO Remove reactions no longer rendered.
    // ...message.reactions.cache
    //     .filter(reaction =>
    //         reaction.users.cache.has(clientUserId) && !reactionContents.find(
    //         reactionContent => reactionContent === reaction.emoji.name))
    //     .map(reaction => reaction.users.remove(clientUserId)),

    // Add reactions newly rendered.
    reactionContents
      .filter((reactionContent) =>
        reactions.every(
          (reaction) =>
            reaction.userId !== chatServiceApi.botUserId && reaction.content !== reactionContent
        )
      )
      .reduce<Promise<unknown>>(
        (promise, reactionContent) =>
          promise.then(() => chatServiceApi.reactMessage(channelId, messageId, reactionContent)),
        Promise.resolve()
      ),
  ]);
}

const lock = new AsyncLock();

export default syncRenderedMessage;
