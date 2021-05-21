import _ from 'lodash';
import allReaders from '../../../core/Reader/allReaders';
import Reader from '../../../core/Reader/Reader';
import FleetLootRecord from '../../../data/FleetLootRecord';
import FleetMember from '../../../data/FleetMember';
import fleetMemberHeader from '../../../data/fleetMemberHeader';
import Message from '../../../data/Message';
import MessageEventContext from '../../../data/MessageEventContext';
import Needs from '../../../data/Needs';
import tableColumnSeparator from '../../../data/tableColumnSeparator';
import UserInputPricedItemStack from '../../../data/UserInputPricedItemStack';
import botUserIdReader from '../../../external/chatService/botUserIdReader';
import fetchMessage from '../../../external/chatService/fetchMessage';
import logError from '../../../external/logError';
import fromDoubleByteCharacterText from '../../../render/message/view/fromDoubleByteCharacterText';

const fleetLootRecordReader: Reader<
  MessageEventContext,
  FleetLootRecord | null
> = new Reader(({ channelId, messageId }) =>
  allReaders([fetchMessage(channelId, messageId), botUserIdReader]).bind(([message, botUserId]) =>
    message && message.externalUserId === botUserId ? parseFleetLootRecord(message) : null
  )
);

function parseFleetLootRecord(message: Message): FleetLootRecord | null {
  if (!message.embed) {
    logError('Expected a valid message embed', message);
    return null;
  }

  const { title, description } = message.embed;
  const { groups } =
    description.match(
      /^.*\n```(?<loot>[^`]*)```\s*(\*\*参与者\*\*\n(?<fleetMembers>[^*]*))?(\*\*需求\*\*\n```(?<needs>(.|\n)*)```\n)?/m
    ) || {};
  if (!groups) {
    logError('Expected valid description in the message embed', message);
    return null;
  }

  return {
    id: message.internalId,
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
    logError('Expected valid loot', text);
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

function parseFleetMember(text: string): FleetMember | null {
  if (!text) {
    return null;
  }

  const [bullet, ...parts] = text.split(' ');
  if (bullet !== fleetMemberHeader) {
    logError('Expected valid fleet member header', text);
    return null;
  }

  const weightMatch = parts[parts.length - 1].match(/([\d.]+)份/) || [];
  const maybeWeight = Number(weightMatch[1]);
  if (isNaN(maybeWeight)) {
    return {
      name: parts.join(' '),
      weight: 1,
    };
  }
  return {
    name: parts.slice(0, -1).join(' '),
    weight: maybeWeight,
  };
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
    logError('Unexpected need row', text);
    return [];
  }

  const [rawItemName, rawItemAmount, rawNeeder] = parts;
  const needer = rawNeeder.trim();
  const itemName = parseString(rawItemName);
  const itemAmount = parseNumber(rawItemAmount);
  if (!needer || !itemName || itemAmount === null) {
    logError('Unexpected need attributes', text);
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

export default fleetLootRecordReader;
