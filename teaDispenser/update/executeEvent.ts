import * as _ from 'lodash';
import { fetchTempFile } from '../data/fetchTempFile';
import { ItemChecklist } from '../data/ItemChecklist';
import { recognizeItems } from '../data/itemDetection';
import getJitaPrice from '../data/market/getJitaPrice';
import getWeightedAverageMarketPrice from '../data/market/getWeightedAverageMarketPrice';
import { normalizeItemName } from '../data/normalizeItemName';
import { User } from '../data/User';
import { Event } from '../event';
import { getTotalPrice } from '../state/getTotalPrice';
import { ItemsPrices, State } from '../state/state';
import queryMarketPriceByName from './queryMarketPriceByName';
import { settleUpParticipants } from './settleUpParticipants';

export async function executeEvent(event: Event): Promise<State> {
  switch (event.type) {
    case 'Pinged':
      return {
        type: 'Pong',
      };
    case 'ImagePosted': {
      const { url } = event;
      const imagePath = await fetchTempFile(url);
      const recognizedItems = await recognizeItems(imagePath);
      return {
        type: 'DetectedItems',
        items: recognizedItems.map(({ name, amount }) => {
          const normalizationResult = normalizeItemName(name);
          const normalizedAmount = Number(amount);
          return {
            name: {
              text: normalizationResult.type === 'NormalizationOnly' ? normalizationResult.normalizedText : name,
              parsedValue: normalizationResult.type === 'ExactMatch' ? normalizationResult.text : null,
            },
            amount: {
              text: amount,
              parsedValue: isNaN(normalizedAmount) ? null : normalizedAmount,
            },
          };
        }),
      };
    }
    case 'ItemChecklistPosted': {
      const { parsedItemChecklistContent } = event;
      return {
        type: 'ItemChecklistSubmittedConfirmation',
        parsedItemChecklistContent,
      };
    }
    case 'SummaryButtonPressed': {
      const { fetchSubmittedItemChecklistsOfToday } = event;
      const checklists = await fetchSubmittedItemChecklistsOfToday();
      return {
        type: 'FetchedItemChecklistsOfToday',
        ...updateItemChecklistsWithLatestPrices(checklists),
      }
    }
    case 'HandsUpButtonPressed': {
      const { selectedChecklistIndices, fetchSubmittedItemChecklistsOfToday } = event;
      if (!selectedChecklistIndices.length) {
        return {
          type: 'ChecklistNotSelected',
        };
      }

      const { checklists } = updateItemChecklistsWithLatestPrices(await fetchSubmittedItemChecklistsOfToday());
      const validChecklistIndices = selectedChecklistIndices.filter(index => checklists[index]);
      const selectedChecklists = validChecklistIndices.map(index => checklists[index]);
      const participants = getParticipants(selectedChecklists);
      const checklistsByAuthor = new Map(selectedChecklists.map(({ entries, author: { id } }) => [id, entries]));
      return {
        type: 'SettledUpParticipants',
        checklistIndices: validChecklistIndices,
        itemTransitions: settleUpParticipants(participants.map(({ id }) => checklistsByAuthor.get(id) || [])),
        participants,
      }
    }
    case 'LedgerButtonPressed': {
      const { selectedChecklistIndices, fetchSubmittedItemChecklistsOfToday } = event;
      if (!selectedChecklistIndices.length) {
        return {
          type: 'ChecklistNotSelected',
        };
      }

      const { checklists } = updateItemChecklistsWithLatestPrices(await fetchSubmittedItemChecklistsOfToday());
      const validChecklistIndices = selectedChecklistIndices.filter(index => checklists[index]);
      const selectedChecklists = validChecklistIndices.map(index => checklists[index]);
      return {
        type: 'LedgerEntry',
        checklistIndices: validChecklistIndices,
        itemsGrandTotal: getTotalPrice(selectedChecklists.flatMap(({ entries }) => entries)),
        participants: getParticipants(selectedChecklists),
      };
    }
    case 'CommandIssued': {
      const { command } = event;
      switch (command.type) {
        case 'QueryPrice': {
          const { itemNames } = command;
          const dedupedItemNames = Array.from(new Set(itemNames));
          const results = await Promise.all(dedupedItemNames.map(queryMarketPriceByName));

          if (results.length === 1) {
            return results[0];
          }

          return {
            type: 'MultipleMarketQueryResult',
            results: results.map((result) => {
              switch (result.type) {
                case 'MarketPriceNotAvailable':
                case 'UnknownItemName':
                  return result;
                case 'SingleMarketQueryResult': {
                  const { query: { orders, fetchedAt }, itemName } = result;
                  return {
                    type: 'AggregatedMarketPrice',
                    itemName,
                    jitaPrice: getJitaPrice(orders),
                    weightedAveragePrice: getWeightedAverageMarketPrice(orders),
                    fetchedAt,
                  }
                }
              }
            }),
          };
        }
        case 'InvalidUsage':
        case 'UnknownCommand':
          return command;
      }
    }
  }
}

function getParticipants(checklists: readonly ItemChecklist[]): readonly User[] {
  return _.uniqBy(checklists.flatMap(({ author, participants }) => participants.concat(author)), ({ id }) => id);
}

function updateItemChecklistsWithLatestPrices(checklists: readonly ItemChecklist[]): { checklists: readonly ItemChecklist[]; itemsPrices: ItemsPrices } {
  const itemsPrices = getItemsPrices(checklists);
  return {
    checklists: checklists.map(checklist => ({
      ...checklist,
      entries: checklist.entries.map((entry) => ({
        ...entry,
        price: itemsPrices[entry.name][0],
      })),
    })),
    itemsPrices,
  };
}

function getItemsPrices(checklists: readonly ItemChecklist[]): ItemsPrices {
  return _.mapValues(
      _.groupBy(checklists
          .flatMap(({ entries }) => entries), ({ name }) => name),
      (entries) => entries.map(({ price }) => price),
  );
}
