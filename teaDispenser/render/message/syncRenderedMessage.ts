import AsyncLock from 'async-lock';
import Reader from '../../core/Reader/Reader';
import sequenceReaders from '../../core/Reader/sequenceReaders';
import RenderedMessage from '../../data/RenderedMessage';
import RenderedMessageContent from '../../data/RenderedMessageContent';
import botUserIdReader from '../../external/chatService/botUserIdReader';
import deleteMessage from '../../external/chatService/deleteMessage';
import editMessage from '../../external/chatService/editMessage';
import fetchReactions from '../../external/chatService/fetchReactions';
import reactMessage from '../../external/chatService/reactMessage';
import sendMessage from '../../external/chatService/sendMessage';
import logErrorWithContext from '../../external/logErrorWithContext';
import MessageRenderingContext from './MessageRenderingContext';

function syncRenderedMessage(
  renderedMessage: RenderedMessage | null
): Reader<MessageRenderingContext, boolean> {
  return new Reader(async (context) => {
    if (lock.isBusy(context.eventId) && renderedMessage?.skippable) {
      return false;
    }

    // Avoid race conditions that create a second message which could have been an edit.
    await lock.acquire(context.eventId, () =>
      forceSyncRenderedMessage(renderedMessage).run(context)
    );
    return true;
  });
}

function forceSyncRenderedMessage(
  renderedMessage: RenderedMessage | null
): Reader<MessageRenderingContext, void> {
  return new Reader((context) => {
    const { channelId, replyToUserId, messageIdToEditRef } = context;
    if (!renderedMessage) {
      if (!messageIdToEditRef.current) {
        return;
      }
      return deleteMessage(channelId, messageIdToEditRef.current).bind(() => {
        messageIdToEditRef.current = null;
      });
    }

    const { content, replyTo, reactionContents = [] } = renderedMessage;
    return syncMessageContent(
      content,
      channelId,
      replyTo && replyToUserId,
      messageIdToEditRef.current
    ).bind((newlySentMessageId) => {
      messageIdToEditRef.current = newlySentMessageId;
      if (newlySentMessageId) {
        return syncReactions(reactionContents, channelId, newlySentMessageId);
      }
    });
  });
}

function syncMessageContent(
  content: RenderedMessageContent,
  channelId: string,
  replyToUserId: string | undefined,
  sentMessageId: string | null
): Reader<MessageRenderingContext, string | null> {
  return sentMessageId
    ? editMessage(channelId, sentMessageId, content, replyToUserId).replaceBy(sentMessageId)
    : sequenceReaders(
        splitMessageContentIfLong(content).map((_content, index) =>
          sendMessage(channelId, _content, index === 0 ? replyToUserId : undefined)
        )
      ).bind((messageIds) =>
        messageIds.length === 0
          ? logErrorWithContext('Expected at least one message sent').replaceBy(null)
          : messageIds[0]
      );
}

/**
 * Splits content by double newlines, if any and if too long. The split content may still be too long.
 */
function splitMessageContentIfLong(
  content: RenderedMessageContent
): readonly RenderedMessageContent[] {
  if (typeof content === 'object') {
    // Does not support splitting message embeds.
    return [content];
  }

  const splitContents: string[] = [];
  const delimiter = '\n\n';
  for (const chunk of content.split(delimiter)) {
    const lastSplitContent = splitContents.pop();
    if (lastSplitContent === undefined) {
      splitContents.push(chunk);
      continue;
    }

    const nextSplitContent = `${lastSplitContent}${delimiter}${chunk}`;
    // Discord has a character limit of 2000. Kaiheila does not have a limit that matters.
    if (nextSplitContent.length <= 1998) {
      splitContents.push(nextSplitContent);
      continue;
    }
    splitContents.push(lastSplitContent);
    splitContents.push(chunk);
  }
  return splitContents;
}

function syncReactions(
  reactionContents: readonly string[],
  channelId: string,
  messageId: string
): Reader<MessageRenderingContext, void> {
  // TODO Remove reactions no longer rendered.
  // ...message.reactions.cache
  //     .filter(reaction =>
  //         reaction.users.cache.has(clientUserId) && !reactionContents.find(
  //         reactionContent => reactionContent === reaction.emoji.name))
  //     .map(reaction => reaction.users.remove(clientUserId)),
  return botUserIdReader.bind((botUserId) =>
    // Add reactions newly rendered.
    fetchReactions(channelId, messageId).bind((reactions) =>
      sequenceReaders(
        reactionContents
          .filter((reactionContent) =>
            reactions.every(
              (reaction) => reaction.userId !== botUserId && reaction.content !== reactionContent
            )
          )
          .map((reactionContent) => reactMessage(channelId, messageId, reactionContent))
      ).discard()
    )
  );
}

const lock = new AsyncLock();

export default syncRenderedMessage;
