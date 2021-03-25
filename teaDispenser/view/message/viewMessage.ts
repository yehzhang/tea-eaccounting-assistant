import * as _ from 'lodash';
import Command from '../../data/Command';
import { InvalidUsageReason } from '../../data/InvalidCommand';
import RenderedMessage from '../../data/RenderedMessage';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import fleetLootEditorLinkName from './fleetLootEditorLinkName';
import MessageView, { MarketQueryResult, SingleMarketQueryResult } from './MessageView';
import renderEmbedMessage from './renderEmbedMessage';
import renderFleetLootRecord from './renderFleetLootRecord';
import renderIsk from './renderIsk';
import renderNumber from './renderNumber';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';

function viewMessage(view: MessageView): RenderedMessage | null {
  switch (view.type) {
    case 'PongView':
      return renderEmbedMessage({
        title: 'Pong!',
      });
    case 'DetectingItemsView': {
      const { magnifierDirection } = view;
      return renderEmbedMessage(
        {
          title: `${magnifierDirection ? '🔍' : '🔎'}正在识别物品。只有游戏内选择的物品会被识别。`,
        },
      );
    }
    case 'NoItemsDetectedView':
      return renderEmbedMessage(
        {
          title: '未能识别任何物品',
          description: '请在游戏中选择需要分赃的物品',
        },
      );
    case 'InternalErrorView':
      return renderEmbedMessage({
        title: '小助手出了故障 🤷',
        description: `${mention(yzDiscordUserId)} 你来瞅瞅`,
      });
    case 'ItemsRecognizedView': {
      const { itemStacks, username, fleetLootEditorUrl, neederChooserUrl } = view;
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
    case 'FleetLootRecordUpdatedView': {
      const {
        title,
        fleetLoot: { loot, fleetMembers },
        needs,
        fleetLootEditorUrl,
        neederChooserUrl,
      } = view;
      return renderFleetLootRecord(
        title,
        loot,
        fleetLootEditorUrl,
        neederChooserUrl,
        fleetMembers,
        needs
      );
    }
    case 'NoFleetMemberToSettleUpView':
      return renderEmbedMessage({
        title: '无分赃对象',
        description: `请通过"${fleetLootEditorLinkName}"填写参与者。`,
      });
    case 'FleetMembersSettledUpView': {
      const {
        fleetMembersLoot,
        totalLootPrice,
        averageLootPricePerMember,
        balanceClear,
        fleetLootRecordTitle,
      } = view;
      return {
        content: [
          '**✨分赃完毕**',
          fleetLootRecordTitle,
          `总价：${renderIsk(totalLootPrice)}`,
          `${fleetMembersLoot.length}人均分价格：${renderIsk(averageLootPricePerMember)}`,
          !balanceClear &&
            '补差价公式：(分得价格 - 均分价格) * 0.75，再四舍五入。分赃者不用补差价，不管写的差价是什么。',
          ...fleetMembersLoot.flatMap(({ fleetMemberName, loot, payout }) => [
            '',
            `**${fleetMemberName}** ${renderIsk(
              _.sumBy(loot, ({ amount, price }) => amount * price)
            )}`,
            !balanceClear &&
              (payout === 0
                ? '不用补差价'
                : `${payout < 0 ? '收取' : '支付'}差价：${renderIsk(Math.abs(payout))}`),
            renderTable(
              ['名称', '数量'],
              loot.map(({ name, amount }) => [name, renderNumber(amount)]),
              /* visibleColumnSeparator= */ false,
              /* visibleHeader= */ false
            ),
          ]),
        ]
          .filter((line) => !!line || line === '')
          .join('\n'),
      };
    }
    case 'MultipleMarketQueryResultView': {
      const { results } = view;
      const minFetchedAt = _.minBy(
        results
          .filter(
            (result): result is SingleMarketQueryResult & { itemPrice: { date: Date } } =>
              result.type === 'SingleMarketQueryResult' && result.itemPrice.date !== null
          )
          .map(({ itemPrice: { date } }) => date),
        (date) => date.getTime()
      );
      return {
        content: [
          renderTable(
            ['物品', '最低卖价', '估计卖价', '最高买价', '估计买价'],
            results.map((result) => [
              result.itemName,
              ...renderMarketQueryResultTableColumns(result),
            ])
          ),
          minFetchedAt && renderPriceTimestamp(minFetchedAt),
        ].join('\n'),
        replyTo: 'user',
      };
    }
    case 'UnknownCommand':
      return { content: '未知指令', replyTo: 'user' };
    case 'InvalidUsage': {
      const { commandType, reason } = view;
      return {
        content: [
          renderInvalidCommandReason(reason),
          '例如:',
          ...renderCommandExamples(commandType),
        ].join('\n'),
        replyTo: 'user',
      };
    }
    case 'DeletedView':
      return null;
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

export default viewMessage;
