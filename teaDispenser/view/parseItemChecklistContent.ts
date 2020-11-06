import { MessageMentions } from "discord.js";
import emojiRegex from "emoji-regex";
import * as _ from 'lodash';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';
import { itemNames } from '../data/itemNames';
import { ParsedItemChecklistContent } from '../data/ParsedItemChecklistContent';
import { ParsedValue } from '../data/parsedValue';
import { User } from '../data/User';
import {
  itemChecklistAmountPrefix,
  itemChecklistEntryPriceSeparator,
  itemChecklistHeading,
  itemChecklistMarketPriceLabel,
  itemChecklistParticipantsLabel,
} from './render';

export function parseItemChecklistContent(text: string, mentions: MessageMentions): ParsedItemChecklistContent | null {
  if (!text.startsWith(itemChecklistHeading + '\n')) {
    return null;
  }

  const [itemChecklistBody, participantText] = text.trim().split('\n' + itemChecklistParticipantsLabel);
  return {
    entries: cleanLines(itemChecklistBody.split('\n').slice(1)).map(validateItemChecklistEntry),
    participants: participantText === undefined ? null : parseParticipants(participantText, mentions),
  };
}

function parseParticipants(text: string, mentions: MessageMentions): ParsedValue<readonly User[]> {
  const matches = [...text.matchAll(/<@!?(\d+)>/g)];
  const mentionedUsers = matches.map(match => mentions.users.get(match[1]));
  const validUsers = _.compact(mentionedUsers).map(({ id, username }) => ({
    id,
    name: username,
  }));
  const valid = mentionedUsers.length === validUsers.length &&
      matches.map(match => match[0]).join('').length === text.replace(/[\s,|，｜、]/g, '').length;
  return {
    text,
    parsedValue: valid ? validUsers : null,
  };
}

function cleanLines(lines: readonly string[]): readonly string[] {
  return _.compact(lines.map(line => line.trim()));
}

function validateItemChecklistEntry(text: string): ParsedValue<ItemChecklistEntry> {
  const cleanText = text.replace(emojiRegex(), '');
  return {
    text: cleanText,
    parsedValue: parseItemChecklistEntry(cleanText),
  };
}

function parseItemChecklistEntry(entry: string): ItemChecklistEntry | null {
  const [itemStackText, priceText] = entry.split(itemChecklistEntryPriceSeparator);
  if (!priceText) {
    return null;
  }

  const itemStackWords = itemStackText.split(' ');
  const amountText = itemStackWords.pop();
  if (!amountText) {
    return null;
  }

  const itemName = itemStackWords.join(' ');
  if (!itemNames.includes(itemName)) {
    return null;
  }
  const amount = parseItemAmount(amountText);
  const price = parseItemPrice(priceText);
  if (price === null || amount === null) {
    return null;
  }

  return {
    name: itemName,
    amount,
    price,
  };
}

function parseItemAmount(text: string): number | null {
  if (!text.startsWith(itemChecklistAmountPrefix)) {
    return null;
  }

  const amount = Number(text.slice(itemChecklistAmountPrefix.length));
  if (isNaN(amount)) {
    return null;
  }

  return amount;
}

function parseItemPrice(text: string): number | null {
  const [, priceText] = text.split(itemChecklistMarketPriceLabel);
  if (!priceText) {
    return null;
  }

  const price = Number(priceText);
  if (isNaN(price)) {
    return null;
  }

  return price;
}
