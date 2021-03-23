import AsyncLock from 'async-lock';
import _ from 'lodash';
import DiscordEventContext from '../data/DiscordEventContext';
import DispatchView from '../data/DispatchView';
import FleetLootRecord from '../data/FleetLootRecord';
import webServerBaseUrl from '../data/webServerBaseUrl';
import WebServerEventContext from '../data/WebServerEventContext';
import Event from '../event/Event';
import ExternalDependency from '../ExternalDependency';
import DiscordView, { MarketQueryResult } from '../view/discord/DiscordView';
import WebServerView from '../view/webServer/WebServerView';
import areNeedsEditable from './areNeedsEditable';
import buildFleetLootRecordUpdatedView from './buildFleetLootRecordUpdatedView';
import dispatchFleetLootRecordUpdatedView from './dispatchFleetLootRecordUpdatedView';
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

async function update(
  event: Event,
  dispatchViews: {
    readonly discord: DispatchView<DiscordView, DiscordEventContext>;
    readonly webServer: DispatchView<WebServerView, WebServerEventContext>;
  },
  { schedulers, discordBot }: ExternalDependency
): Promise<void> {
  switch (event.type) {
    case '[Discord] Pinged': {
      const { context } = event;
      return dispatchViews.discord(
        {
          type: 'PongView',
        },
        context
      );
    }
    case '[Discord] ImagePosted': {
      const { urls, username, context } = event;
      let detectingItems = true;
      const ignored = (async () => {
        let magnifierDirection = true;
        while (detectingItems) {
          const ignored = dispatchViews.discord(
            {
              type: 'DetectingItemsView',
              magnifierDirection,
            },
            context
          );
          await new Promise((resolve) => {
            setTimeout(resolve, 1260);
          });
          magnifierDirection = !magnifierDirection;
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
        return dispatchViews.discord(
          {
            type: 'NoItemsDetectedView',
          },
          context
        );
      }

      const { sentMessage } = context;
      if (!sentMessage) {
        console.error('Expected a sent message from context:', context);
        return dispatchViews.discord(
          {
            type: 'InternalErrorView',
          },
          context
        );
      }

      return dispatchViews.discord(
        {
          type: 'ItemsRecognizedView',
          itemStacks,
          username,
          fleetLootEditorUrl: getFleetLootEditorUrl(sentMessage.channel.id, sentMessage.id),
          neederChooserUrl: getNeederChooserUrl(sentMessage.channel.id, sentMessage.id),
        },
        context
      );
    }
    case '[Discord] HandsUpButtonPressed': {
      const {
        fleetLoot: { fleetMembers, loot },
        fleetLootRecordTitle,
        needs,
        context,
      } = event;
      if (!fleetMembers.length) {
        return dispatchViews.discord(
          {
            type: 'NoFleetMemberToSettleUpView',
          },
          context
        );
      }

      const itemStacks = _.compact(
        loot.map(({ name, amount, price }) =>
          !name || amount === null || price === null ? null : { name, amount, price }
        )
      );
      if (itemStacks.length !== loot.length) {
        return dispatchViews.discord(
          {
            type: 'NoFleetMemberToSettleUpView',
          },
          context
        );
      }

      return dispatchViews.discord(
        {
          type: 'FleetMembersSettledUpView',
          fleetMembersLoot: settleUpFleetLoot(fleetMembers, itemStacks, needs),
          fleetLootRecordTitle,
        },
        context
      );
    }
    case '[Discord] KiwiButtonPressed': {
      const { fleetLootRecord, userId, context } = event;
      const otherRecord = await fleetLootRecordDuplex.connect(
        userId,
        fleetLootRecord,
        /* timeoutMs= */ 30000
      );
      if (!otherRecord || fleetLootRecord.id === otherRecord.id) {
        return;
      }

      if (fleetLootRecord.createdAt < otherRecord.createdAt) {
        return dispatchViews.discord({ type: 'DeletedView' }, context);
      }

      const { sentMessage } = context;
      if (!sentMessage) {
        console.error('Expected a sent message from context:', context);
        return dispatchViews.discord(
          {
            type: 'InternalErrorView',
          },
          context
        );
      }

      return dispatchViews.discord(
        buildFleetLootRecordUpdatedView(
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
          sentMessage
        ),
        context
      );
    }
    case '[Discord] CommandIssued': {
      const { command, context } = event;
      switch (command.type) {
        case 'QueryPrice': {
          const { itemNames } = command;
          // Does not deduplicate items in different languages.
          const dedupedItemNames = Array.from(new Set(itemNames));
          if (2 <= dedupedItemNames.length) {
            const ignored = dispatchViews.discord(
              {
                type: 'LookingUpHistoryPriceView',
              },
              context
            );
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
          return dispatchViews.discord(
            {
              type: 'MultipleMarketQueryResultView',
              results,
            },
            context
          );
        }
        case 'InvalidUsage':
        case 'UnknownCommand':
          return dispatchViews.discord(command, context);
      }
      return;
    }
    case '[Web] IndexRequested': {
      const { context } = event;
      return dispatchViews.webServer({ type: 'IndexView' }, context);
    }
    case '[Web] DiscordFleetLootEditorRequested': {
      const { channelId, messageId, context } = event;
      const fetchResult = await fetchFleetLootRecord(
        discordBot,
        channelId,
        messageId,
        dispatchViews.webServer,
        context
      );
      if (!fetchResult) {
        return;
      }
      return dispatchViews.webServer(
        {
          type: 'FleetLootEditorView',
          fleetLoot: fetchResult.fleetLootRecord.fleetLoot,
        },
        context
      );
    }
    case '[Web] DiscordFleetLootEditorPosted': {
      const { messageId, channelId, fleetLoot, context } = event;
      if (!fleetLoot) {
        return dispatchViews.webServer(
          {
            type: 'InvalidFleetLootEditorInputView',
          },
          context
        );
      }

      const updateResult = await lock.acquire(messageId, async () => {
        const fetchResult = await fetchFleetLootRecord(
          discordBot,
          channelId,
          messageId,
          dispatchViews.webServer,
          context
        );
        if (!fetchResult) {
          return false;
        }

        const { message, channel, fleetLootRecord } = fetchResult;
        await dispatchFleetLootRecordUpdatedView(
          {
            ...fleetLootRecord,
            fleetLoot,
          },
          message,
          channel,
          dispatchViews.discord
        );

        return true;
      });
      if (!updateResult) {
        return;
      }

      return dispatchViews.webServer(
        {
          type: 'UpdatedConfirmationView',
        },
        context
      );
    }
    case '[Web] DiscordNeederChooserRequested': {
      const { channelId, messageId, context } = event;
      const fetchResult = await fetchFleetLootRecord(
        discordBot,
        channelId,
        messageId,
        dispatchViews.webServer,
        context
      );
      if (!fetchResult) {
        return;
      }

      const {
        fleetLootRecord: { fleetLoot },
      } = fetchResult;
      if (!areNeedsEditable(fleetLoot)) {
        return dispatchViews.webServer(
          {
            type: 'PendingFleetLootRecordView',
          },
          context
        );
      }

      const needsEditorLinks = fleetLoot.fleetMembers.map((fleetMember) => ({
        needer: fleetMember,
        needsEditorUrl: `${webServerBaseUrl}/needs-editor/discord/${channelId}/${messageId}/${encodeURIComponent(
          fleetMember
        )}`,
      }));
      return dispatchViews.webServer(
        {
          type: 'NeederChooserView',
          needsEditorLinks,
        },
        context
      );
    }
    case '[Web] DiscordNeedsEditorRequested': {
      const { channelId, messageId, needer, context } = event;
      const fetchResult = await fetchFleetLootRecord(
        discordBot,
        channelId,
        messageId,
        dispatchViews.webServer,
        context
      );
      if (!fetchResult) {
        return;
      }

      const { fleetLoot, needs } = fetchResult.fleetLootRecord;
      if (!areNeedsEditable(fleetLoot)) {
        return dispatchViews.webServer(
          {
            type: 'PendingFleetLootRecordView',
          },
          context
        );
      }

      const neederNeeds = needs.filter(({ needer: _needer }) => _needer === needer);
      return dispatchViews.webServer(
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
    case '[Web] DiscordNeedsEditorPosted': {
      const { channelId, messageId, needer, itemStacks, context } = event;
      const updateResult = await lock.acquire(messageId, async () => {
        const fetchResult = await fetchFleetLootRecord(
          discordBot,
          channelId,
          messageId,
          dispatchViews.webServer,
          context
        );
        if (!fetchResult) {
          return false;
        }

        const { message, channel, fleetLootRecord } = fetchResult;
        await dispatchFleetLootRecordUpdatedView(
          {
            ...fleetLootRecord,
            needs: fleetLootRecord.needs
              .filter(({ needer: _needer }) => _needer !== needer)
              .concat(itemStacks.map((item) => ({ needer, item }))),
          },
          message,
          channel,
          dispatchViews.discord
        );

        return true;
      });
      if (!updateResult) {
        return;
      }

      return dispatchViews.webServer(
        {
          type: 'UpdatedConfirmationView',
        },
        context
      );
    }
    default: {
      const assertExhaustive: never = event;
    }
  }
}

const lock = new AsyncLock();

const fleetLootRecordDuplex = new Duplex<FleetLootRecord>();

export default update;
