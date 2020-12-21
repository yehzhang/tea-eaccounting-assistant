import * as _ from 'lodash';
import { getTotalPrice } from '../data/getTotalPrice';
import { ItemChecklist } from '../data/ItemChecklist';
import { normalizeItemName } from '../data/normalizeItemName';
import { User } from '../data/User';
import { Event } from '../event';
import {
  ItemsPrices,
  MarketPriceNotAvailable,
  SingleMarketQueryResult,
  State,
  UnknownItemName,
} from '../state';
import { fetchTempFile } from './fetchTempFile';
import { recognizeItems } from './itemDetection/recognizeItems';
import getJitaPrice from './market/getJitaPrice';
import getWeightedAverageMarketPrice from './market/getWeightedAverageMarketPrice';
import queryMarketPriceByName from './queryMarketPriceByName';
import { settleUpParticipants } from './settleUpParticipants';
import createSpreadsheet from './sheets/createSpreadsheet';
import grantPermission from './sheets/grantPermission';
import setDataValidations from './sheets/setDataValidations';
import updateSpreadsheetValues from './sheets/updateSpreadsheetValues';

export async function executeEvent(event: Event): Promise<State> {
  switch (event.type) {
    case 'Pinged':
      return {
        type: 'Pong',
      };
    case 'ImagePosted': {
      const { url, userName } = event;
      const [spreadsheet, itemRows] = await Promise.all([
        createSpreadsheet(userName),
        fetchTempFile(url)
            .then(recognizeItems)
            .then(recognizedItems => Promise.all(recognizedItems.map(async ({
                                                                              name,
                                                                              amount,
                                                                              findIcon,
                                                                            }) => {
              const normalizationResult = await normalizeItemName(name, findIcon);
              const exactName = normalizationResult.type === 'ExactMatch' ? normalizationResult.text : null;
              const query = exactName && await queryMarketPriceByName(exactName);
              return {
                name: exactName ? exactName :
                    normalizationResult.type === 'NormalizationOnly' ? normalizationResult.normalizedText : name,
                amount,
                price: query ? getJitaPrice(query.orders) : null,
              };
            }))),
      ]);
      if (!itemRows.length) {
        return {
          type: 'NoItemsDetected',
        };
      }
      if (!spreadsheet) {
        return {
          type: 'SpreadsheetCreationFailure',
        }
      }

      const results: readonly boolean[] = await Promise.all([
        grantPermission(spreadsheet.id),
        updateSpreadsheetValues(spreadsheet.id, itemRows),
        setDataValidations(spreadsheet.id),
      ]);
      if (!_.every(results)) {
        return {
          type: 'SpreadsheetCreationFailure',
        };
      }

      return {
        type: 'SpreadsheetCreated',
        url: spreadsheet.url,
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
      const checklistsByAuthor = new Map(selectedChecklists.map(({
                                                                   entries,
                                                                   author: { id },
                                                                 }) => [id, entries]));
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
          const results = await Promise.all(dedupedItemNames.map(async (itemName): Promise<MarketPriceNotAvailable | SingleMarketQueryResult | UnknownItemName> => {
            const normalizationResult = await normalizeItemName(itemName, () => Promise.resolve(null));
            if (normalizationResult.type !== 'ExactMatch') {
              return {
                type: 'UnknownItemName',
                itemName,
              };
            }
            const query = await queryMarketPriceByName(normalizationResult.text);
            if (!query || !query.orders.length) {
              return {
                type: 'MarketPriceNotAvailable',
                itemName,
              };
            }
            return {
              type: 'SingleMarketQueryResult',
              itemName,
              query,
            };
          }));

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
  return _.uniqBy(checklists.flatMap(({
                                        author,
                                        participants,
                                      }) => participants.concat(author)), ({ id }) => id);
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
