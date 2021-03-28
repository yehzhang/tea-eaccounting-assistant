import _ from 'lodash';
import assertExhaustive from '../assertExhaustive';
import chooseMessageApi from '../chooseMessageApi';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import MessageEventContext from '../data/MessageEventContext';
import webServerBaseUrl from '../data/webServerBaseUrl';
import WebServerEventContext from '../data/WebServerEventContext';
import Event from '../event/Event';
import ExternalDependency from '../ExternalDependency';
import MessageView, { MarketQueryResult } from '../view/message/MessageView';
import WebPageView from '../view/webPage/WebPageView';
import areNeedsEditable from './areNeedsEditable';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';
import Duplex from './Duplex';
import fetchFleetLootRecord from './fetchFleetLootRecord';
import fetchTempFile from './fetchTempFile';
import getFleetLootEditorUrl from './getFleetLootEditorUrl';
import getItemTypeIdByName from './getItemTypeIdByName';
import getNeederChooserUrl from './getNeederChooserUrl';
import recognizeItems from './itemDetection/recognizeItems';
import fetchPriceByItemTypeId from './market/fetchPriceByItemTypeId';
import normalizeItemName from './normalizeItemName';
import populateItemStack from './populateItemStack';
import settleUpFleetLoot from './settleUpFleetLoot';
import updateFleetLootRecord from './updateFleetLootRecord';

async function update(
  event: Event,
  dispatchViews: {
    readonly message: DispatchView<MessageView, MessageEventContext, [ExternalDependency]>;
    readonly webPage: DispatchView<WebPageView, WebServerEventContext>;
  },
  externalDependency: ExternalDependency
): Promise<boolean> {
  const { schedulers } = externalDependency;
  switch (event.type) {
    case '[Discord] Pinged':
    case '[Kaiheila] Pinged': {
      const { context } = event;
      return dispatchViews.message(
        {
          type: 'PongView',
        },
        context,
        externalDependency
      );
    }
    case '[Discord] ImagePosted':
    case '[Kaiheila] ImagePosted': {
      const { urls, username, context } = event;
      let detectingItems = true;
      const ignored = (async () => {
        let magnifierDirection = true;
        while (detectingItems) {
          const timeoutPromise = new Promise((resolve) => void setTimeout(resolve, 1260));

          const success = await dispatchViews.message(
            {
              type: 'DetectingItemsView',
              magnifierDirection,
            },
            context,
            externalDependency
          );
          if (success) {
            magnifierDirection = !magnifierDirection;
          }

          await timeoutPromise;
        }
      })();

      const itemStacksList = await Promise.all(
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
      );
      const itemStacks = _.compact(itemStacksList.flat());

      detectingItems = false;
      if (!itemStacks.length) {
        return dispatchViews.message(
          {
            type: 'NoItemsDetectedView',
          },
          context,
          externalDependency
        );
      }

      const { channelId, messageIdToEdit } = context;
      if (!messageIdToEdit) {
        console.error('Expected a sent message from context:', context);
        return dispatchViews.message(
          {
            type: 'InternalErrorView',
          },
          context,
          externalDependency
        );
      }

      let serviceProvider: 'discord' | 'kaiheila';
      switch (event.type) {
        case '[Discord] ImagePosted':
          serviceProvider = 'discord';
          break;
        case '[Kaiheila] ImagePosted':
          serviceProvider = 'kaiheila';
          break;
      }
      return dispatchViews.message(
        {
          type: 'ItemsRecognizedView',
          itemStacks,
          username,
          fleetLootEditorUrl: getFleetLootEditorUrl(serviceProvider, channelId, messageIdToEdit),
          neederChooserUrl: getNeederChooserUrl(serviceProvider, channelId, messageIdToEdit),
        },
        context,
        externalDependency
      );
    }
    case '[Discord] HandsUpButtonPressed':
    case '[Kaiheila] HandsUpButtonPressed': {
      const {
        fleetLoot: { fleetMembers, loot },
        fleetLootRecordTitle,
        needs,
        context,
      } = event;

      context.messageIdToEdit = null;

      if (!fleetMembers.length) {
        return dispatchViews.message(
          {
            type: 'NoFleetMemberToSettleUpView',
          },
          context,
          externalDependency
        );
      }

      const itemStacks = _.compact(
        loot.map(({ name, amount, price }) =>
          !name || amount === null || price === null ? null : { name, amount, price }
        )
      );
      if (itemStacks.length !== loot.length) {
        return dispatchViews.message(
          {
            type: 'NoFleetMemberToSettleUpView',
          },
          context,
          externalDependency
        );
      }

      return dispatchViews.message(
        {
          type: 'FleetMembersSettledUpView',
          ...settleUpFleetLoot(fleetMembers, itemStacks, needs),
          fleetLootRecordTitle,
        },
        context,
        externalDependency
      );
    }
    case '[Discord] KiwiButtonPressed':
    case '[Kaiheila] KiwiButtonPressed': {
      const { fleetLootRecord, userId, context } = event;
      const otherRecord = await fleetLootRecordDuplex.connect(
        userId,
        fleetLootRecord,
        /* timeoutMs= */ 30000
      );
      if (!otherRecord || fleetLootRecord.id === otherRecord.id) {
        return true;
      }

      if (fleetLootRecord.createdAt < otherRecord.createdAt) {
        return dispatchViews.message({ type: 'DeletedView' }, context, externalDependency);
      }

      const { channelId, messageIdToEdit } = context;
      if (!messageIdToEdit) {
        console.error('Expected a sent message from context:', context);
        return dispatchViews.message(
          {
            type: 'InternalErrorView',
          },
          context,
          externalDependency
        );
      }

      return dispatchViews.message(
        buildFleetLootRecordUpdatedView(
          context.serviceProvider,
          {
            ...fleetLootRecord,
            fleetLoot: {
              fleetMembers: _.uniq(
                otherRecord.fleetLoot.fleetMembers.concat(fleetLootRecord.fleetLoot.fleetMembers)
              ),
              loot: otherRecord.fleetLoot.loot.concat(fleetLootRecord.fleetLoot.loot),
            },
            needs: otherRecord.needs.concat(fleetLootRecord.needs),
          },
          channelId,
          messageIdToEdit
        ),
        context,
        externalDependency
      );
    }
    case '[Discord] CommandIssued':
    case '[Kaiheila] CommandIssued': {
      const { command, context } = event;
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
          return dispatchViews.message(
            {
              type: 'MultipleMarketQueryResultView',
              results,
            },
            context,
            externalDependency
          );
        }
        case 'InvalidUsage':
        case 'UnknownCommand':
          return dispatchViews.message(command, context, externalDependency);
        default:
          return assertExhaustive(command);
      }
    }
    case '[Web] IndexRequested': {
      const { context } = event;
      return dispatchViews.webPage({ type: 'IndexView' }, context);
    }
    case '[Web] FleetLootEditorRequested': {
      const { channelId, messageId, messageServiceProvider, context } = event;
      const fleetLootRecord = await fetchFleetLootRecord(
        chooseMessageApi(messageServiceProvider, externalDependency),
        channelId,
        messageId
      );
      return dispatchViews.webPage(
        fleetLootRecord
          ? {
              type: 'FleetLootEditorView',
              ...fleetLootRecord,
            }
          : {
              type: 'InvalidFleetLootRecordView',
            },
        context
      );
    }
    case '[Web] FleetLootEditorPosted': {
      const { messageId, channelId, fleetLoot, messageServiceProvider, context } = event;
      if (!fleetLoot) {
        return dispatchViews.webPage(
          {
            type: 'InvalidFleetLootEditorInputView',
          },
          context
        );
      }

      const success = await updateFleetLootRecord(
        channelId,
        messageId,
        messageServiceProvider,
        externalDependency,
        dispatchViews.message,
        (fleetLootRecord) => ({ ...fleetLootRecord, fleetLoot })
      );
      return dispatchViews.webPage(
        success
          ? {
              type: 'UpdatedConfirmationView',
            }
          : {
              type: 'InvalidFleetLootRecordView',
            },
        context
      );
    }
    case '[Web] NeederChooserRequested': {
      const { channelId, messageId, messageServiceProvider, context } = event;
      const fleetLootRecord = await fetchFleetLootRecord(
        chooseMessageApi(messageServiceProvider, externalDependency),
        channelId,
        messageId
      );
      if (!fleetLootRecord) {
        return dispatchViews.webPage(
          {
            type: 'InvalidFleetLootRecordView',
          },
          context
        );
      }

      const { fleetLoot } = fleetLootRecord;
      if (!areNeedsEditable(fleetLoot)) {
        return dispatchViews.webPage(
          {
            type: 'PendingFleetLootRecordView',
          },
          context
        );
      }

      const needsEditorLinks = fleetLoot.fleetMembers.map((fleetMember) => ({
        needer: fleetMember,
        needsEditorUrl: `${webServerBaseUrl}/needs-editor/${messageServiceProvider}/${channelId}/${messageId}/${encodeURIComponent(
          fleetMember
        )}`,
      }));
      return dispatchViews.webPage(
        {
          type: 'NeederChooserView',
          needsEditorLinks,
        },
        context
      );
    }
    case '[Web] NeedsEditorRequested': {
      const { channelId, messageId, needer, messageServiceProvider, context } = event;
      const fleetLootRecord = await fetchFleetLootRecord(
        chooseMessageApi(messageServiceProvider, externalDependency),
        channelId,
        messageId
      );
      if (!fleetLootRecord) {
        return dispatchViews.webPage(
          {
            type: 'InvalidFleetLootRecordView',
          },
          context
        );
      }

      const { fleetLoot, needs } = fleetLootRecord;
      if (!areNeedsEditable(fleetLoot)) {
        return dispatchViews.webPage(
          {
            type: 'PendingFleetLootRecordView',
          },
          context
        );
      }

      const neederNeeds = needs.filter(({ needer: _needer }) => _needer === needer);
      return dispatchViews.webPage(
        {
          type: 'NeedsEditorView',
          itemStacks: _.uniq(fleetLoot.loot.map(({ name }) => name)).map((name) => ({
            name,
            amount: _.sumBy(
              neederNeeds.filter(({ item: { name: itemName } }) => itemName === name),
              ({ item: { amount } }) => amount
            ),
          })),
        },
        context
      );
    }
    case '[Web] NeedsEditorPosted': {
      const { channelId, messageId, needer, itemStacks, messageServiceProvider, context } = event;
      const success = await updateFleetLootRecord(
        channelId,
        messageId,
        messageServiceProvider,
        externalDependency,
        dispatchViews.message,
        (fleetLootRecord) => ({
          ...fleetLootRecord,
          needs: fleetLootRecord.needs
            .filter(({ needer: _needer }) => _needer !== needer)
            .concat(itemStacks.map((item) => ({ needer, item }))),
        })
      );
      return dispatchViews.webPage(
        success
          ? {
              type: 'UpdatedConfirmationView',
            }
          : {
              type: 'InvalidFleetLootRecordView',
            },
        context
      );
    }
    default: {
      return assertExhaustive(event);
    }
  }
}

const fleetLootRecordDuplex = new Duplex<FleetLootRecord>();

export default update;
