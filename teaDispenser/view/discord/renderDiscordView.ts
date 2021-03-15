import * as _ from 'lodash';
import Command from '../../data/Command';
import fleetLootEditorLinkName from '../../data/fleetLootEditorLinkName';
import { InvalidUsageReason } from '../../data/InvalidCommand';
import RenderedMessage from '../../data/RenderedMessage';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import DiscordView, { MarketQueryResult, SingleMarketQueryResult } from './DiscordView';
import renderEmbedMessage from './renderEmbedMessage';
import renderFleetLootRecord from './renderFleetLootRecord';
import renderIsk from './renderIsk';
import renderNumber from './renderNumber';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';

function renderDiscordView(state: DiscordView): readonly RenderedMessage[] {
  switch (state.type) {
    case 'Pong':
      return renderEmbedMessage({
        title: 'Pong!',
      });
    case 'DetectingItems': {
      const { magnifierDirection } = state;
      return renderEmbedMessage({
        title: `${magnifierDirection ? '🔍' : '🔎'}正在识别物品。只有游戏内选择的物品会被识别。`,
      }, undefined, /* overwrite= */ true);
    }
    case 'NoItemsDetected':
      return renderEmbedMessage({
        title: '未能识别任何物品',
        description: '请在游戏中选择需要分赃的物品',
      });
    case 'InternalError':
      return renderEmbedMessage({
        title: '小助手出了故障 🤷',
        description: `${mention(yzDiscordUserId)} 你来瞅瞅`,
      });
    case 'ItemsRecognized': {
      const { itemStacks, username, fleetLootEditorUrl, neederChooserUrl } = state;
      const todayLocaleString = new Date().toLocaleString('zh', { month: 'short', day: 'numeric' });
      const title = `${todayLocaleString} @${username} 分赃记录`;
      return renderFleetLootRecord(
        title,
        itemStacks,
        fleetLootEditorUrl,
        neederChooserUrl,
        /* fleetMembers= */ [],
        /* needs= */ []
      );
    }
    case 'FleetLootRecordUpdated': {
      const {
        title,
        fleetLoot: { loot, fleetMembers },
        needs,
        fleetLootEditorUrl,
        neederChooserUrl,
      } = state;
      return renderFleetLootRecord(
        title,
        loot,
        fleetLootEditorUrl,
        neederChooserUrl,
        fleetMembers,
        needs
      );
    }
    case 'NoParticipantsToSettleUp':
      return renderEmbedMessage({
        title: '无分赃对象',
        description: `请通过"${fleetLootEditorLinkName}"填写参与者。`,
      });
    case 'AllItemsFilledInNeeded':
      return renderEmbedMessage({
        title: '需要所有物品的名称、数量和价格',
        description: `请通过"${fleetLootEditorLinkName}"填写赃物栏目下所有空缺的格子。`,
      });
    case 'ParticipantsSettledUp': {
      const { fleetMembersLoot, fleetLootRecordTitle } = state;
      const grandTotal = _.sumBy(
        fleetMembersLoot.flatMap(({ loot }) => loot),
        ({ amount, price }) => amount * price
      );
      return renderSingleMessage(
        [
          '**✨分赃完毕**',
          fleetLootRecordTitle,
          `总价：${renderIsk(grandTotal)}`,
          `${fleetMembersLoot.length}人均分价格：${renderIsk(
            grandTotal / fleetMembersLoot.length
          )}`,
          '',
          ...fleetMembersLoot.flatMap(({ fleetMemberName, loot }) => [
            `**${fleetMemberName}** ${renderIsk(
              _.sumBy(loot, ({ amount, price }) => amount * price)
            )}`,
            renderTable(
              ['名称', '数量'],
              loot.map(({ name, amount }) => [name, renderNumber(amount)]),
              /* visibleColumnSeparator= */ false,
              /* visibleHeader= */ false
            ),
          ]),
        ],
        /* replyTo= */ null
      );
    }
    case 'LookingUpHistoryPrice':
      return renderEmbedMessage({
        title: '📈️正在查询历史价格',
      });
    case 'MultipleMarketQueryResult': {
      const { results } = state;
      const minFetchedAt = _.minBy(
        results
          .filter(
            (result): result is SingleMarketQueryResult & { itemPrice: { date: Date } } =>
              result.type === 'SingleMarketQueryResult' && result.itemPrice.date !== null
          )
          .map(({ itemPrice: { date } }) => date),
        (date) => date.getTime()
      );
      return renderSingleMessage([
        renderTable(
          ['物品', '最低卖价', '估计卖价', '最高买价', '估计买价'],
          results.map((result) => [result.itemName, ...renderMarketQueryResultTableColumns(result)])
        ),
        minFetchedAt && renderPriceTimestamp(minFetchedAt),
      ]);
    }
    case 'UnknownCommand':
      return renderSingleMessage(['未知指令']);
    case 'InvalidUsage': {
      const { commandType, reason } = state;
      return renderSingleMessage([
        renderInvalidCommandReason(reason),
        '例如:',
        ...renderCommandExamples(commandType),
      ]);
    }
    case 'Deleted':
      return [];
  }
}

function renderPriceTimestamp(date: Date): string {
  return `_这是${renderRelativeDate(date)}的价格_`;
}

function renderMarketQueryResultTableColumns(result: MarketQueryResult): string[] {
  switch (result.type) {
    case 'UnknownItemName':
      return ['未知物品名。请使用全称。'];
    case 'MarketPriceNotAvailable':
      return [`无法从 https://eve-echoes-market.com/${result.itemTypeId}/_ 获取价格`];
    case 'SingleMarketQueryResult': {
      const {
        itemPrice: { estimatedBuy, highestBuy, estimatedSell, lowestSell },
      } = result;
      return [
        renderNumber(lowestSell),
        renderNumber(estimatedSell),
        renderNumber(highestBuy),
        renderNumber(estimatedBuy),
      ];
    }
  }
}

function renderInvalidCommandReason(reason: InvalidUsageReason): string {
  switch (reason) {
    case 'ArgsRequired':
      return '请输入至少一个参数';
  }
}

function renderCommandExamples(commandType: Command['type']): string[] {
  switch (commandType) {
    case 'QueryPrice':
      return [
        `${commandPrefix}${queryPriceCommandView} 半导体记忆电池蓝图 III`,
        `${commandPrefix}${queryPriceCommandView} 光泽合金，杂色复合物，重金属`,
      ];
  }
}

function mention(userId: string): string {
  return `<@!${userId}>`;
}

const yzDiscordUserId = '202649496381816832';

/** Convenience method that constructs a single message to return. */
function renderSingleMessage(
  lines: (string | null | undefined | false)[],
  replyTo: 'user' | 'message' | null = 'user'
): readonly RenderedMessage[] {
  return [
    {
      type: 'RenderedMessage',
      content: lines.filter((line) => !!line || line === '').join('\n'),
      replyTo: replyTo || null,
    },
  ];
}

export default renderDiscordView;
