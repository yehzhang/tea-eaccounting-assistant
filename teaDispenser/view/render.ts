import * as _ from 'lodash';
import Command from '../data/Command';
import { InvalidUsageReason } from '../data/InvalidCommand';
import RenderedMessage from '../data/RenderedMessage';
import Rendering from '../data/Rendering';
import { AggregatedMarketPrice, MarketQueryResult, State } from '../state';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import renderPrice from './renderPrice';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';

function render(state: State): readonly Rendering[] {
  switch (state.type) {
    case 'Pong':
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: 'Pong!',
            },
          },
        },
      ];
    case 'DetectingItems': {
      const { magnifierDirection } = state;
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: `${magnifierDirection ? '🔍' : '🔎'}正在识别物品`,
            },
          },
        },
      ]
    }
    case 'NoItemsDetected':
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '未能识别物品',
              description: '请在游戏中选择需要分赃的物品',
            },
          },
        },
      ];
    case 'PopulatingSpreadsheet':
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '✍️正在填写表格',
            },
          },
        },
      ]
    case 'SpreadsheetOperationFailure':
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '使用 Google Sheets 时出现了问题',
              description: `${mention(yzDiscordUserId)} 你来瞅瞅`,
            },
          },
        },
      ];
    case 'SpreadsheetCreated': {
      const { url, linkTitle } = state;
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: linkTitle,
              url,
              description: [
                '',
                '️**分赃指南**',
                '1. 在"参与者"格填写参与者的名字',
                '2. 填写物品的价格与数量，如果有缺的话',
                '3. 邀请参与者填写需求',
                `4. 按下方${handsUpIcon}按钮以自动分配未分配的物品`,
              ].join('\n'),
            },
          },
          reactionContents: [handsUpIcon],
        },
      ];
    }
    case 'NoParticipantsToSettleUp': {
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '无分赃对象',
              description: '请先在"参与者"格填写参与者的名字',
            },
          },
        },
      ];
    }
    case 'ParticipantsSettledUp': {
      const { gainedParticipants, noOpParticipants } = state;
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '✨分赃完毕',
              description: [
                `• 有新分到赃物：${gainedParticipants.join('，')}`,
                noOpParticipants.length && `• 无变动：${noOpParticipants.join('，')}`,
              ].filter(Boolean).join('\n'),
            },
          },
        },
      ];
    }
    case 'NoOpParticipantsSettledUp':
      return [
        {
          type: 'RenderedMessage',
          content: {
            embed: {
              color: dispenserSilver,
              title: '分赃完毕，但没有变动',
              description: '若要重新分赃，可以恢复 Google Sheets 的历史',
            },
          },
        },
      ];
    case 'SingleMarketQueryResult': {
      const { query: { fetchedAt, orders } } = state;
      return renderSingleMessage(
          renderTable(
              ['星系', '数量', '价格'],
              orders.map(({ price, remainingVolume, solarSystemName }) => [
                solarSystemName,
                remainingVolume.toString(),
                renderPrice(price),
              ]),
          ),
          renderPriceTimestamp(fetchedAt),
      );
    }
    case 'UnknownItemName': {
      return renderSingleMessage('未知物品名。请使用全称。');
    }
    case 'MarketPriceNotAvailable': {
      return renderSingleMessage('尚未录入这件物品的价格。' +
          '由于网易限制市场查询频率，目前仅支持绝地常见的产出，包括改装件蓝图、装备、结构、矿、菜等。');
    }
    case 'MultipleMarketQueryResult': {
      const { results } = state;
      const minFetchedAt = _.minBy(results.filter((result): result is AggregatedMarketPrice =>
          result.type === 'AggregatedMarketPrice')
          .map(({ fetchedAt }) => fetchedAt), (fetchedAt) => fetchedAt.getTime());
      return renderSingleMessage(
          renderTable(
              ['物品', '价格（吉他）', '价格（加权平均）'],
              results.map((result) => {
                return [result.itemName, ...renderPriceFromMarketQueryResult(result)];
              }),
          ),
          minFetchedAt && renderPriceTimestamp(minFetchedAt),
      );
    }
    case 'UnknownCommand':
      return renderSingleMessage('未知指令');
    case 'InvalidUsage': {
      const { commandType, reason } = state;
      return renderSingleMessage(
          renderInvalidCommandReason(reason),
          '例如:',
          ...renderCommandExamples(commandType),
      );
    }
  }
}

function renderPriceTimestamp(date: Date): string {
  return `_这是${renderRelativeDate(date)}的价格_`
}

function renderPriceFromMarketQueryResult(result: MarketQueryResult): string[] {
  switch (result.type) {
    case 'UnknownItemName':
      return ['未知物品名', ''];
    case 'MarketPriceNotAvailable':
      return ['未录入价格', ''];
    case 'AggregatedMarketPrice':
      return [
        result.jitaPrice === null ? '无' : renderPrice(result.jitaPrice),
        renderPrice(result.weightedAveragePrice),
      ];
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

export const handsUpIcon = '🙌';

const yzDiscordUserId = '202649496381816832';

/** Convenience method that constructs a single message to return. */
function renderSingleMessage(...lines: (string | null | undefined)[]): readonly RenderedMessage[] {
  return [{
    type: 'RenderedMessage',
    content: lines.filter(line => line != null).join('\n'),
    replyTo: 'user',
  }];
}

const dispenserSilver = 0xD3D3D3;

export default render;
