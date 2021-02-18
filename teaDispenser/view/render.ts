import { MessageEmbedOptions } from 'discord.js';
import * as _ from 'lodash';
import Command from '../data/Command';
import { InvalidUsageReason } from '../data/InvalidCommand';
import RenderedMessage from '../data/RenderedMessage';
import Rendering from '../data/Rendering';
import State, { MarketQueryResult, SingleMarketQueryResult } from '../State';
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
            '^ _该表可随意编辑：增减物品，修改数量、价格、参与者，等等_',
            '',
            '️**分赃指南**',
            '1. 填写参与者的名字，覆盖第一行"参与者"格',
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
        description: '请填写参与者的名字，覆盖"参与者"格（位于最左侧写着数字"1"的行）',
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
      return renderSingleMessage(
        renderTable(
          ['物品', '最低卖价', '估计卖价', '最高买价', '估计买价'],
          results.map((result) => [result.itemName, ...renderMarketQueryResultTableColumns(result)])
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
        renderPrice(lowestSell),
        renderPrice(estimatedSell),
        renderPrice(highestBuy),
        renderPrice(estimatedBuy),
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
