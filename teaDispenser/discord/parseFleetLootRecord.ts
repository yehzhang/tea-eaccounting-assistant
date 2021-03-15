import { Message } from 'discord.js';
import _ from 'lodash';
import FleetLootRecord from '../data/FleetLootRecord';
import fromDoubleByteCharacterText from '../data/fromDoubleByteCharacterText';
import Needs from '../data/Needs';
import tableColumnSeparator from '../data/tableColumnSeparator';
import UserInputPricedItemStack from '../data/UserInputPricedItemStack';

function parseFleetLootRecord(message: Message): FleetLootRecord | null {
  const { title, description } = message.embeds[0] || {};
  if (!title || !description) {
    console.error('Expected a valid message embed, got', message);
    return null;
  }

  const { groups } =
    description.match(
      /^.*\n```(?<loot>[^`]*)```\n(\*\*参与者\*\*\n(?<fleetMembers>(.|\n)*)\n\n)?(\*\*需求\*\*\n```(?<needs>(.|\n)*)```\n)?/m
    ) || {};
  if (!groups) {
    console.error('Expected valid description in the message embed, got', message);
    return null;
  }

  return {
    fleetLoot: {
      fleetMembers: parseRows(groups.fleetMembers, parseFleetMember),
      loot: parseRows(groups.loot, parseUserInputPricedItemStack),
    },
    needs: parseRows(groups.needs, parseNeed).flat(),
    title,
    createdAt: message.createdAt,
  };
}

function parseUserInputPricedItemStack(text: string): UserInputPricedItemStack | null {
  const parts = text.split(tableColumnSeparator);
  if (parts.length !== 3) {
    console.error('Expected valid loot, got', text);
    return null;
  }

  const [rawName, rawAmount, rawPrice] = parts.map((part) => part.trim());
  const name = parseString(rawName);
  const amount = parseNumber(rawAmount);
  const price = parseNumber(rawPrice);
  if (!name && amount === null && price === null) {
    return null;
  }
  return {
    name,
    amount,
    price,
  };
}

function parseFleetMember(text: string): string | null {
  const parts = text.split(' ');
  if (parts.length === 1) {
    console.warn('Unexpected fleet member row', text);
    return null;
  }
  return parts.slice(1).join(' ');
}

function parseRows<T>(
  text: string | undefined,
  parseRow: (text: string) => T | null
): readonly T[] {
  return _.compact((text || '').split('\n'))
    .map(parseRow)
    .filter((data): data is T => data !== null);
}

function parseNeed(text: string): Needs {
  const parts = text.split(tableColumnSeparator);
  if (parts.length !== 3) {
    console.warn('Unexpected need row', text);
    return [];
  }

  const [rawItemName, rawItemAmount, rawNeeder] = parts;
  const needer = rawNeeder.trim();
  const itemName = parseString(rawItemName);
  const itemAmount = parseNumber(rawItemAmount);
  if (!needer || !itemName || itemAmount === null) {
    console.warn('Unexpected need attributes', text);
    return [];
  }

  return [
    {
      needer,
      item: {
        name: itemName,
        amount: itemAmount,
      },
    },
  ];
}

function parseNumber(text: string): number | null {
  const cleanText = text.replace(/,/g, '').trim();
  if (!cleanText) {
    return null;
  }

  const number = Number(cleanText);
  if (isNaN(number)) {
    return null;
  }
  return number;
}

function parseString(text: string): string {
  return fromDoubleByteCharacterText(text).trim();
}

export default parseFleetLootRecord;
