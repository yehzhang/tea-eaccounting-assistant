import _ from 'lodash';
import { normalizeItemName } from '../data/normalizeItemName';
import { Event } from '../event';
import {
  MarketPriceNotAvailable,
  SingleMarketQueryResult,
  State,
  UnknownItemName,
} from '../state';
import { fetchTempFile } from './fetchTempFile';
import { recognizeItems } from './itemDetection/recognizeItems';
import getJitaPrice from './market/getJitaPrice';
import getWeightedAverageMarketPrice from './market/getWeightedAverageMarketPrice';
import populateItemStack from './populateItemStack';
import queryMarketPriceByName from './queryMarketPriceByName';
import settleUpParticipants from './settleUpParticipants';
import createSpreadsheet from './sheets/createSpreadsheet';
import grantPermission from './sheets/grantPermission';
import readSpreadsheetValues from './sheets/readSpreadsheetValues';
import setAutoResize from './sheets/setAutoResize';
import setDataFormats from './sheets/setDataFormats';
import setSpreadsheetValues from './sheets/setSpreadsheetValues';
import updateSpreadsheetValues from './sheets/updateSpreadsheetValues';

export async function executeEvent(event: Event): Promise<State> {
  switch (event.type) {
    case 'Pinged':
      return {
        type: 'Pong',
      };
    case 'ImagePosted': {
      const { url, userName } = event;
      const createSpreadsheetPromise = createSpreadsheet(userName);
      const configureSpreadsheetPromise = createSpreadsheetPromise
          .then(spreadsheet => spreadsheet && Promise.all([
            grantPermission(spreadsheet.id),
            setDataFormats(spreadsheet.id),
          ]));
      const [spreadsheet, itemStacks] = await Promise.all([
        createSpreadsheetPromise,
        fetchTempFile(url).then(recognizeItems)
            .then((recognizedItems) => Promise.all(recognizedItems.map(populateItemStack))),
      ]);
      if (!itemStacks.length) {
        return {
          type: 'NoItemsDetected',
        };
      }
      if (!spreadsheet) {
        return {
          type: 'SpreadsheetOperationFailure',
        }
      }

      const postCreationSuccess = await configureSpreadsheetPromise && await setSpreadsheetValues(spreadsheet.id, itemStacks);
      if (!postCreationSuccess) {
        return {
          type: 'SpreadsheetOperationFailure',
        };
      }

      await setAutoResize(spreadsheet.id);

      return {
        type: 'SpreadsheetCreated',
        url: spreadsheet.url,
        linkTitle: spreadsheet.linkTitle,
      };
    }
    case 'HandsUpButtonPressed': {
      const { spreadsheetId } = event;
      const itemSplit = await readSpreadsheetValues(spreadsheetId);
      if (!itemSplit) {
        return {
          type: 'SpreadsheetOperationFailure',
        };
      }
      if (!itemSplit.participants.length) {
        return {
          type: 'NoParticipantsToSettleUp',
        };
      }

      const participants = settleUpParticipants(itemSplit);
      const gainedParticipants = participants
          .filter(({ items }, index) => !_.isEqual(items, itemSplit.participants[index].items));
      if (!gainedParticipants.length) {
        return {
          type: 'NoOpParticipantsSettledUp',
        };
      }

      const success = await updateSpreadsheetValues(spreadsheetId, gainedParticipants);
      if (!success) {
        return {
          type: 'SpreadsheetOperationFailure',
        };
      }

      const gainedParticipantNames = gainedParticipants.map(({ participantName }) => participantName);
      return {
        type: 'ParticipantsSettledUp',
        gainedParticipants: gainedParticipantNames,
        noOpParticipants: _.difference(participants.map(({ participantName }) => participantName), gainedParticipantNames),
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
