import DispatchView from '../data/DispatchView';
import { CommandIssuedEvent } from '../event/Event';
import MessageView, { MarketQueryResult } from '../view/message/MessageView';
import normalizeItemName from './fuzzySearch/normalizeItemName';
import getItemTypeIdByName from './getItemTypeIdByName';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';

async function updateOnCommandIssued(
  event: CommandIssuedEvent,
  dispatchView: DispatchView<MessageView>
): Promise<boolean> {
  const { command } = event;
  switch (command.type) {
    case 'QueryPrice': {
      const { itemNames } = command;
      // Does not deduplicate items in different languages.
      const dedupedItemNames = Array.from(new Set(itemNames));
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
      return dispatchView({
        type: 'MultipleMarketQueryResultView',
        results,
      });
    }
    case 'InvalidUsage':
    case 'UnknownCommand':
      return dispatchView(command);
  }
}

export default updateOnCommandIssued;
