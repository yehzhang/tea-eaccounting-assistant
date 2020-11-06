import { Collection, Message, MessageManager, MessageReaction, Snowflake } from 'discord.js';
import * as _ from 'lodash';
import { ItemChecklist } from '../data/ItemChecklist';
import { Event } from '../event';
import { parseItemChecklistContent } from './parseItemChecklistContent';
import { handsUpIcon, indexIcons, ledgerIcon, summaryIcon } from './render';

export function parseEventFromMessageReaction(messageReaction: MessageReaction, userId: string, clientUserId: string): readonly Event[] {
  console.debug('parseEventFromMessageReaction', messageReaction);

  const events: Event[] = [];

  if (messageReaction.message.author.id !== clientUserId) {
    return events;
  }

  if (messageReaction.emoji.name === summaryIcon) {
    events.push({
      type: 'SummaryButtonPressed',
      fetchSubmittedItemChecklistsOfToday: () => fetchSubmittedItemChecklistsOfToday(
          messageReaction.message.channel.messages, clientUserId),
    });
  }

  if (messageReaction.emoji.name === ledgerIcon) {
    events.push({
      type: 'LedgerButtonPressed',
      selectedChecklistIndices: getChecklistIndicesSelectedByUser(messageReaction, userId),
      fetchSubmittedItemChecklistsOfToday: () => fetchSubmittedItemChecklistsOfToday(
          messageReaction.message.channel.messages, clientUserId),
    });
  }

  if (messageReaction.emoji.name === handsUpIcon) {
    events.push({
      type: 'HandsUpButtonPressed',
      selectedChecklistIndices: getChecklistIndicesSelectedByUser(messageReaction, userId),
      fetchSubmittedItemChecklistsOfToday: () => fetchSubmittedItemChecklistsOfToday(
          messageReaction.message.channel.messages, clientUserId),
    });
  }

  return events;
}

function getChecklistIndicesSelectedByUser(messageReaction: MessageReaction, userId: string): readonly number[] {
  return messageReaction.message.reactions.cache
      .filter(reaction => reaction.users.cache.has(userId))
      .map(reaction => indexIcons.indexOf(reaction.emoji.name))
      .filter(index => index !== -1);
}

async function fetchSubmittedItemChecklistsOfToday(messageManager: MessageManager, clientUserId: string): Promise<readonly ItemChecklist[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const fetchedMessages = [];
  for await (const message of fetchMessages(messageManager, yesterday)) {
    if (message.author.id === clientUserId) {
      continue;
    }

    const { content, author, createdAt, mentions } = message;
    const parsedItemChecklist = parseItemChecklistContent(content, mentions);
    if (!parsedItemChecklist) {
      continue;
    }
    const { entries, participants } = parsedItemChecklist;
    if (!participants || !participants.parsedValue) {
      continue;
    }

    const validEntries = _.compact(entries.map(entry => entry.parsedValue));
    if (validEntries.length !== entries.length) {
      // The checklist contains invalid entries, so it is invalid.
      continue;
    }

    fetchedMessages.push({
      entries: validEntries,
      author: {
        id: author.id,
        name: author.username,
      },
      createdAt,
      participants: participants.parsedValue,
    });

    // Discord allows a maximum of 20 reactions, minus two action buttons is 18.
    if (18 <= fetchedMessages.length) {
      break;
    }
  }

  return fetchedMessages;
}

async function* fetchMessages(messageManager: MessageManager, after: Date): AsyncGenerator<Message> {
  let fetchBeforeId: Snowflake | undefined = undefined;
  while (true) {
    const messages: Collection<Snowflake, Message> = await messageManager.fetch({
      limit: 30,
      before: fetchBeforeId,
    });

    const messagesInRange = messages
        .filter(message => after < message.createdAt)
        .sorted((value, otherValue) => otherValue.createdTimestamp - value.createdTimestamp);

    for (const message of messagesInRange.values()) {
      yield message;
    }

    if (!messagesInRange.size || messagesInRange.size !== messages.size) {
      break;
    }

    fetchBeforeId = messagesInRange.last()!.id;
  }
}
