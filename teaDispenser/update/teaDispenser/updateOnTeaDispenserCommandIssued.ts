import Reader from '../../core/Reader/Reader';
import { TeaDispenserCommandIssuedEvent } from '../../event/Event';
import logErrorWithoutContext from '../../external/logError';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';
import MessageView, { MarketQueryResult } from '../../render/message/view/MessageView';
import normalizeItemName from './fuzzySearch/normalizeItemName';
import getItemTypeIdByName from './getItemTypeIdByName';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';

function updateOnTeaDispenserCommandIssued(
  event: TeaDispenserCommandIssuedEvent
): Reader<MessageRenderingContext, boolean> {
  return new Reader(
    async (): Promise<MessageView> => {
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
                  logErrorWithoutContext('Expected item type id found by normalized item name');
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
          return {
            type: 'MultipleMarketQueryResultView',
            results,
          };
        }
        case 'InvalidUsage':
        case 'UnknownCommand':
          return command;
      }
    }
  )
    .bind(dispatchView)
    .mapContext((context) => ({
      ...context,
      replyToUserId: event.triggeringUserId,
    }));
}

export default updateOnTeaDispenserCommandIssued;
