import { MessageEmbedOptions } from 'discord.js';
import * as _ from 'lodash';
import Command from '../data/Command';
import { InvalidUsageReason } from '../data/InvalidCommand';
import MarketOrder from '../data/MarketOrder';
import RenderedMessage from '../data/RenderedMessage';
import Rendering from '../data/Rendering';
import State, { AggregatedMarketPrice, MarketPriceStats, MarketQueryResult } from '../State';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import renderPrice from './renderPrice';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';

function render(state: State): readonly Rendering[] {
  switch (state.type) {
    case 'Pong':
      return renderEmbedMessage({
        title: 'Pong!',
      });
    case 'DetectingItems': {
      const { magnifierDirection } = state;
      return renderEmbedMessage({
        title: `${magnifierDirection ? '🔍' : '🔎'}正在识别物品。只有游戏内选择的物品会被识别。`,
      });
    }
    case 'NoItemsDetected':
      return renderEmbedMessage({
        title: '未能识别任何物品',
        description: '请在游戏中选择需要分赃的物品',
      });
    case 'PopulatingSpreadsheet':
      return renderEmbedMessage({
        title: '✍️正在填写表格',
      });
    case 'SpreadsheetOperationFailure':
      return renderEmbedMessage({
        title: '使用 Google Sheets 时出现了问题',
        description: `${mention(yzDiscordUserId)} 你来瞅瞅`,
      });
    case 'SpreadsheetCreated': {
      const { url, linkTitle } = state;
      return renderEmbedMessage(
        {
          title: linkTitle,
          url,
          description: [
            '_^ 该表可随意编辑：增减物品，修改数量与价格，添加参与者，等等_',
            '',
            '️**分赃指南**',
            '1. 在第一行"参与者"格填写参与者的名字',
            '2. 填写物品的数量与价格，如果有缺的话',
            '3. 邀请参与者填写需求',
            `4. 按下方${handsUpIcon}按钮以自动分配未分配的物品`,
            '5. 若分赃不均，可将赃物抵押奶茶当铺，然后分钱',
          ].join('\n'),
        },
        [handsUpIcon]
      );
    }
    case 'NoParticipantsToSettleUp': {
      return renderEmbedMessage({
        title: '无分赃对象',
        description: '请先在"参与者"格（位于第一行）填写参与者的名字',
      });
    }
    case 'ParticipantsSettledUp': {
      const { gainedParticipants, noOpParticipants } = state;
      return renderEmbedMessage({
        title: '✨分赃完毕',
        description: [
          `• 有新分到赃物：${gainedParticipants.join('，')}`,
          noOpParticipants.length && `• 无变动：${noOpParticipants.join('，')}`,
        ]
          .filter(Boolean)
          .join('\n'),
      });
    }
    case 'NoOpParticipantsSettledUp':
      return renderEmbedMessage({
        title: '分赃完毕，但没有变动',
        description:
          '已分的赃物不会参与自动分赃。若要重新分赃，' +
          `请使用 Google Sheets 的历史功能恢复至自动分赃前，再按${handsUpIcon}按钮。或者手动调整每个人物品的数量。` +
          '\n此外，请填写所有空缺的数量与价格。',
      });
    case 'SingleMarketQueryResult': {
      const { buyOrders, sellOrders, fetchedAt } = state;
      // Do not use message embed as its width does not consider code block.
      return renderSingleMessage(
        !!sellOrders.length && `**卖单**\n${renderMarketOrdersTable(sellOrders)}`,
        !!buyOrders.length && `**买单**\n${renderMarketOrdersTable(buyOrders)}`,
        renderPriceTimestamp(fetchedAt)
      );
    }
    case 'UnknownItemName': {
      return renderSingleMessage('未知物品名。请使用全称。');
    }
    case 'MarketPriceNotAvailable': {
      const { itemTypeId } = state;
      return renderSingleMessage(
        '这件物品的价格尚未录入。' +
          '由于网易限制市场查询频率，目前仅录入绝地与源泉常见的产出，包括改装件蓝图、装备、结构、矿、菜等。' +
          `请移步 https://eve-echoes-market.com/${itemTypeId}/_`
      );
    }
    case 'MultipleMarketQueryResult': {
      const { results } = state;
      const sellPriceStats = results.some(
        (result) => result.type === 'AggregatedMarketPrice' && result.sellPriceStats
      );
      const buyPriceStats = results.some(
        (result) => result.type === 'AggregatedMarketPrice' && result.buyPriceStats
      );
      const minFetchedAt = _.minBy(
        results
          .filter(
            (result): result is AggregatedMarketPrice => result.type === 'AggregatedMarketPrice'
          )
          .map(({ fetchedAt }) => fetchedAt),
        (fetchedAt) => fetchedAt.getTime()
      );
      return renderSingleMessage(
        renderTable(
          [
            '物品',
            ...(sellPriceStats ? ['吉他最低卖价', '加权平均卖价'] : []),
            ...(buyPriceStats ? ['吉他最高买价', '加权平均买价'] : []),
          ],
          results.map((result) => {
            return [result.itemName, ...renderMarketQueryResultTableColumns(result, buyPriceStats)];
          })
        ),
        minFetchedAt && renderPriceTimestamp(minFetchedAt)
      );
    }
    case 'UnknownCommand':
      return renderSingleMessage('未知指令');
    case 'InvalidUsage': {
      const { commandType, reason } = state;
      return renderSingleMessage(
        renderInvalidCommandReason(reason),
        '例如:',
        ...renderCommandExamples(commandType)
      );
    }
  }
}

function renderPriceTimestamp(date: Date): string {
  return `_这是${renderRelativeDate(date)}的价格_`;
}

function renderMarketOrdersTable(orders: readonly MarketOrder[]): string {
  return renderTable(
    ['星系', '数量', '价格'],
    orders.map(({ price, remainingVolume, solarSystemName }) => [
      solarSystemName,
      remainingVolume.toLocaleString('en'),
      renderPrice(price),
    ])
  );
}

function renderMarketQueryResultTableColumns(
  result: MarketQueryResult,
  sellColumnPlaceHolder: boolean
): string[] {
  switch (result.type) {
    case 'UnknownItemName':
      return ['未知物品名'];
    case 'MarketPriceNotAvailable':
      return [priceNotAvailable];
    case 'AggregatedMarketPrice': {
      const { sellPriceStats, buyPriceStats } = result;
      return [
        ...renderMarketPriceStatsTableColumns(sellPriceStats, sellColumnPlaceHolder),
        ...renderMarketPriceStatsTableColumns(buyPriceStats, /* placeHolder= */ true),
      ];
    }
  }
}

const priceNotAvailable = '未录入价格';

function renderMarketPriceStatsTableColumns(
  marketPriceStats: MarketPriceStats | null,
  placeHolder: boolean
): string[] {
  if (!marketPriceStats) {
    if (placeHolder) {
      return [priceNotAvailable, ''];
    }
    return [];
  }
  const { jitaItcPrice, weightedAverageItcPrice } = marketPriceStats;
  return [
    jitaItcPrice === null ? 'N/A' : renderPrice(jitaItcPrice),
    renderPrice(weightedAverageItcPrice),
  ];
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

export const handsUpIcon = '🙌';

const yzDiscordUserId = '202649496381816832';

/** Convenience method that constructs a single message to return. */
function renderSingleMessage(
  ...lines: (string | null | undefined | false)[]
): readonly RenderedMessage[] {
  return [
    {
      type: 'RenderedMessage',
      content: _.compact(lines).join('\n'),
      replyTo: 'user',
    },
  ];
}

function renderEmbedMessage(
  embed: MessageEmbedOptions,
  reactionContents?: readonly string[]
): readonly RenderedMessage[] {
  return [
    {
      type: 'RenderedMessage',
      content: {
        embed: {
          color: dispenserSilver,
          ...embed,
        },
      },
      reactionContents,
    },
  ];
}

const dispenserSilver = 0xd3d3d3;

export default render;
