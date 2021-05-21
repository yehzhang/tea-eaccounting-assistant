import _ from 'lodash';
import Command from '../../../data/Command';
import { InvalidUsageReason } from '../../../data/InvalidCommand';
import RenderedMessage from '../../../data/RenderedMessage';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import fleetLootEditorLinkName from './fleetLootEditorLinkName';
import MessageView, { MarketQueryResult, SingleMarketQueryResult } from './MessageView';
import renderEmbedMessage from './renderEmbedMessage';
import renderFleetLootRecord from './renderFleetLootRecord';
import renderIsk from './renderIsk';
import renderNumber from './renderNumber';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';
import renderWeight from './renderWeight';

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
        undefined,
        /* skippable= */ true
      );
    }
    case 'NoItemsDetectedView':
      return renderEmbedMessage({
        title: '未能识别任何物品',
        description: '请在游戏中选择需要分赃的物品',
      });
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
        settledLoot: {
          fleetMembersLoot,
          totalLootPrice,
          averageLootPricePerMember,
          lootPricePerUnitWeight,
          totalWeight,
          balanceClear,
          unequalSplit,
        },
        fleetLootRecordTitle,
      } = view;
      return {
        content: [
          '**✨分赃完毕**',
          fleetLootRecordTitle,
          `总价 ${renderIsk(totalLootPrice)}`,
          unequalSplit
            ? `${fleetMembersLoot.length}人分${renderWeight(
                totalWeight
              )}份物品，每份价格 ${renderIsk(lootPricePerUnitWeight)}`
            : `${fleetMembersLoot.length}人均分价格 ${renderIsk(averageLootPricePerMember)}`,
          !balanceClear &&
            '补差价公式：(理应获得价格 - 实际获得价格) * 0.75，再四舍五入。' +
              '分赃者不用补差价，不管写的是什么。',
          ...fleetMembersLoot.flatMap(
            ({ fleetMemberName, loot, lootPrice, targetValue, weight, payout }) => [
              '',
              unequalSplit
                ? `**${fleetMemberName}** 理应获得${renderWeight(weight)}份物品，总价 ${renderIsk(
                    targetValue
                  )}`
                : `**${fleetMemberName}** ${renderIsk(lootPrice)}`,
              unequalSplit && `实际获得物品价格 ${renderIsk(lootPrice)}`,
              !balanceClear &&
                (payout === 0
                  ? '不用补差价'
                  : `应${payout < 0 ? '收取' : '支付'}差价 ${renderIsk(Math.abs(payout))}`),
              !!loot.length &&
                renderTable(
                  ['名称', '数量'],
                  loot.map(({ name, amount }) => [name, renderNumber(amount)]),
                  /* visibleColumnSeparator= */ false,
                  /* visibleHeader= */ false
                ),
            ]
          ),
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
    case 'BlueFuckeryQueueIntroductionView': {
      const { mentionedRoles } = view;
      const ccedRoles = renderMentionedRoles(mentionedRoles);
      const ccedRolesView = ccedRoles ? `，会自动抄送给 ${ccedRoles}` : '';
      return {
        content:
          '如果你无法通过简单沟通自行解决问题，请使用本申诉系统。' +
          '很多蓝加冲突事件都是在无意和误会中产生的。请准备好尽可能多的蓝加恶意行为证据，请注意：' +
          '证据越多，调查速度越快，对应惩罚措施也会更严厉。\n\n' +
          `点击下方${cryButton}表情以开始申诉${ccedRolesView}`,
        reactionContents: [cryButton],
      };
    }
    case 'BlueFuckeryTicketIntroductionView': {
      const { mentionedRoles } = view;
      const ccedRoles = renderMentionedRoles(mentionedRoles);
      return {
        content:
          `${ccedRoles}${ccedRoles ? ' ' : ''}如遇蓝加恶意行为，请提供尽可能多的截图证据。` +
          '提供的信息越多越能加快我们的处理时间。同时请提供有关玩家游戏内名片以便我们联系相关军团/联盟。',
        replyTo: 'user',
      };
    }
    case 'DeletedView':
      return null;
  }
}

function renderMentionedRoles(mentionedRoles: readonly number[]): string {
  // Caveat: this is Kaiheila markdown which is not compatible with Discord.
  return mentionedRoles.map((mentionedRole) => `(rol)${mentionedRole}(rol)`).join(' ');
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

const cryButton = '😢';

export default viewMessage;
