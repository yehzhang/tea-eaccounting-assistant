import _ from 'lodash';
import normalizeItemName from '../data/normalizeItemName';
import Event from '../Event';
import ExternalDependency from '../ExternalDependency';
import State, {
  MarketPriceNotAvailable,
  SingleMarketQueryResult,
  UnknownItemName,
} from '../State';
import fetchTempFile from './fetchTempFile';
import recognizeItems from './itemDetection/recognizeItems';
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

async function executeEvent(event: Event, setState: (state: State) => void, { schedulers }: ExternalDependency): Promise<void> {
  switch (event.type) {
    case 'Pinged':
      setState({
        type: 'Pong',
      });
      return;
    case 'ImagePosted': {
      let detectingItems = true;
      const ignored = (async () => {
        let magnifierDirection = true;
        while (detectingItems) {
          setState({
            type: 'DetectingItems',
            magnifierDirection,
          });
          await new Promise((resolve) => {
            setTimeout(resolve, 1260);
          });
          magnifierDirection = !magnifierDirection;
        }
      })();

      const { url, userName } = event;
      const createSpreadsheetPromise = createSpreadsheet(userName);
      const configureSpreadsheetPromise = createSpreadsheetPromise
          .then(spreadsheet => spreadsheet && Promise.all([
            grantPermission(spreadsheet.id),
            setDataFormats(spreadsheet.id),
          ]));
      const [spreadsheet, itemStacks] = await Promise.all([
        createSpreadsheetPromise,
        fetchTempFile(url)
            .then(path => recognizeItems(path, schedulers))
            .then((recognizedItems) => Promise.all(recognizedItems.map(populateItemStack))),
      ]);
      if (!itemStacks.length) {
        setState({
          type: 'NoItemsDetected',
        });
        return;
      }
      if (!spreadsheet) {
        setState({
          type: 'SpreadsheetOperationFailure',
        })
        return;
      }

      detectingItems = false;
      setState({
        type: 'PopulatingSpreadsheet',
      });

      const postCreationSuccess = await configureSpreadsheetPromise && await setSpreadsheetValues(spreadsheet.id, itemStacks);
      if (!postCreationSuccess) {
        setState({
          type: 'SpreadsheetOperationFailure',
        });
        return;
      }

      await setAutoResize(spreadsheet.id);

      setState({
        type: 'SpreadsheetCreated',
        url: spreadsheet.url,
        linkTitle: spreadsheet.linkTitle,
      });
      return;
    }
    case 'HandsUpButtonPressed': {
      setState({
        type: 'PopulatingSpreadsheet',
      });

      const { spreadsheetId } = event;
      const itemSplit = await readSpreadsheetValues(spreadsheetId);
      if (!itemSplit) {
        setState({
          type: 'SpreadsheetOperationFailure',
        });
        return;
      }
      if (!itemSplit.participants.length) {
        setState({
          type: 'NoParticipantsToSettleUp',
        });
        return;
      }

      const participants = settleUpParticipants(itemSplit);
      const gainedParticipants = participants
          .filter(({ items }, index) => !_.isEqual(items, itemSplit.participants[index].items));

      if (!gainedParticipants.length) {
        setState({
          type: 'NoOpParticipantsSettledUp',
        });
        return;
      }

      const success = await updateSpreadsheetValues(spreadsheetId, gainedParticipants);
      if (!success) {
        setState({
          type: 'SpreadsheetOperationFailure',
        });
        return;
      }

      const gainedParticipantNames = gainedParticipants.map(({ participantName }) => participantName);
      setState({
        type: 'ParticipantsSettledUp',
        gainedParticipants: gainedParticipantNames,
        noOpParticipants: _.difference(participants.map(({ participantName }) => participantName), gainedParticipantNames),
      });
      return;
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
            setState(results[0]);
            return;
          }

          setState({
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
          });
          return;
        }
        case 'InvalidUsage':
        case 'UnknownCommand':
          setState(command);
          return;
      }
    }
  }
}

export default executeEvent;
