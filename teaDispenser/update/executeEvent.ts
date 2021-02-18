import _ from 'lodash';
import getItemTypeIdByName from '../data/getItemTypeIdByName';
import normalizeItemName from '../data/normalizeItemName';
import Event from '../Event';
import ExternalDependency from '../ExternalDependency';
import State, { MarketQueryResult } from '../State';
import fetchTempFile from './fetchTempFile';
import recognizeItems from './itemDetection/recognizeItems';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';
import populateItemStack from './populateItemStack';
import settleUpParticipants from './settleUpParticipants';
import createSpreadsheet from './sheets/createSpreadsheet';
import grantPermission from './sheets/grantPermission';
import readSpreadsheetValues from './sheets/readSpreadsheetValues';
import setDataFormats from './sheets/setDataFormats';
import setSpreadsheetValues from './sheets/setSpreadsheetValues';
import updateSpreadsheetValues from './sheets/updateSpreadsheetValues';

async function executeEvent(
  event: Event,
  setState: (state: State) => void,
  { schedulers }: ExternalDependency
): Promise<void> {
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

      const { urls, userName } = event;
      const createSpreadsheetPromise = createSpreadsheet(userName);
      const configureSpreadsheetPromise = createSpreadsheetPromise.then(
        (spreadsheet) =>
          spreadsheet &&
          Promise.all([grantPermission(spreadsheet.id), setDataFormats(spreadsheet.id)])
      );
      const [spreadsheet, itemStacks] = await Promise.all([
        createSpreadsheetPromise,
        Promise.all(
          urls.map(async (url) => {
            const path = await fetchTempFile(url);
            const recognizedItemPromises = await recognizeItems(path, schedulers);
            return Promise.all(
              recognizedItemPromises.map((recognizedItemPromise) =>
                recognizedItemPromise.then(
                  (recognizedItem) => recognizedItem && populateItemStack(recognizedItem)
                )
              )
            );
          })
        ).then((itemStacksList) => _.compact(itemStacksList.flat())),
      ]);

      detectingItems = false;
      if (!itemStacks.length) {
        setState({
          type: 'NoItemsDetected',
        });
        return;
      }
      if (!spreadsheet) {
        setState({
          type: 'SpreadsheetOperationFailure',
        });
        return;
      }

      setState({
        type: 'PopulatingSpreadsheet',
      });

      const postCreationSuccess =
        (await configureSpreadsheetPromise) &&
        (await setSpreadsheetValues(spreadsheet.id, itemStacks));
      if (!postCreationSuccess) {
        setState({
          type: 'SpreadsheetOperationFailure',
        });
        return;
      }

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
      const gainedParticipants = participants.filter(
        ({ items }, index) => !_.isEqual(items, itemSplit.participants[index].items)
      );

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

      const gainedParticipantNames = gainedParticipants.map(
        ({ participantName }) => participantName
      );
      setState({
        type: 'ParticipantsSettledUp',
        gainedParticipants: gainedParticipantNames,
        noOpParticipants: _.difference(
          participants.map(({ participantName }) => participantName),
          gainedParticipantNames
        ),
      });
      return;
    }
    case 'CommandIssued': {
      const { command } = event;
      switch (command.type) {
        case 'QueryPrice': {
          const { itemNames } = command;
          // Does not deduplicate items in different languages.
          const dedupedItemNames = Array.from(new Set(itemNames));
          if (2 <= dedupedItemNames.length) {
            setState({
              type: 'LookingUpHistoryPrice',
            });
          }

          const results = await Promise.all(
            dedupedItemNames.map(
              async (itemName): Promise<MarketQueryResult> => {
                const normalizationResult = await normalizeItemName(itemName, () =>
                  Promise.resolve(null)
                );
                if (normalizationResult.type !== 'ExactMatch') {
                  return {
                    type: 'UnknownItemName',
                    itemName,
                  };
                }
                const itemTypeId = getItemTypeIdByName(normalizationResult.text);
                if (itemTypeId === null) {
                  console.error('Expected item type id found by normalized item name');
                  return {
                    type: 'UnknownItemName',
                    itemName,
                  };
                }

                const itemPrice = await fetchPriceByItemTypeId(itemTypeId);
                if (!itemPrice) {
                  return {
                    type: 'MarketPriceNotAvailable',
                    itemName: normalizationResult.text,
                    itemTypeId,
                  };
                }

                return {
                  type: 'SingleMarketQueryResult',
                  itemName: normalizationResult.text,
                  itemPrice,
                };
              }
            )
          );
          setState({
            type: 'MultipleMarketQueryResult',
            results,
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
