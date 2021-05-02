import _ from 'lodash';
import ChatService from '../../data/ChatService';
import FleetLootRecord from '../../data/FleetLootRecord';
import FleetMember from '../../data/FleetMember';
import Message from '../../data/Message';
import Needs from '../../data/Needs';
import tableColumnSeparator from '../../data/tableColumnSeparator';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';
import useChatServiceContext from '../../external/useChatServiceContext';
import fromDoubleByteCharacterText from '../../view/message/fromDoubleByteCharacterText';

async function fetchFleetLootRecord(
  chatService: ChatService,
  channelId: string,
  messageId: string
): Promise<FleetLootRecord | null> {
  const { api } = useChatServiceContext(chatService);
  const message = await api.fetchMessage(channelId, messageId);
  if (!message || message.externalUserId !== api.botUserId) {
    return null;
  }
  return parseFleetLootRecord(message);
}

function parseFleetLootRecord(message: Message): FleetLootRecord | null {
  if (!message.embed) {
    console.error('Expected a valid message embed, got', message);
    return null;
  }

  const { title, description } = message.embed;
  const { groups } =
    description.match(
      /^.*\n```(?<loot>[^`]*)```\s*(\*\*参与者\*\*\n(?<fleetMembers>[^*]*))?(\*\*需求\*\*\n```(?<needs>(.|\n)*)```\n)?/m
    ) || {};
  if (!groups) {
    console.error('Expected valid description in the message embed, got', message);
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

function parseFleetMember(text: string): FleetMember | null {
  if (!text) {
    return null;
  }

  const parts = text.split(' ');
  if (parts.length === 2) {
    return {
      name: parts[1],
      weight: 1,
    };
  }

  if (parts.length === 3) {
    const weightMatch = parts[2].match(/([\d.]+)份/) || [];
    const weight = Number(weightMatch[1]);
    if (isNaN(weight)) {
      console.warn('Expected valid weight in fleet member text, got', text);
      return null;
    }
    return {
      name: parts[1],
      weight,
    };
  }

  console.warn('Unexpected fleet member row', text);
  return null;
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

export default fetchFleetLootRecord;
