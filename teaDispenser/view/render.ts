import { MessageOptions } from 'discord.js';
import * as _ from 'lodash';
import Command from '../data/Command';
import { InvalidUsageReason } from '../data/InvalidCommand';
import { ItemChecklist } from '../data/ItemChecklist';
import { ItemChecklistEntry } from '../data/itemChecklistEntry';
import { translateToChinese } from '../data/translateToChinese';
import { User } from '../data/User';
import { getTotalPrice } from '../state/getTotalPrice';
import { AggregatedMarketPrice, ItemTransition, MarketQueryResult, State } from '../state/state';
import { commandPrefix, queryPriceCommandView } from './commandViews';
import renderPrice from './renderPrice';
import renderRelativeDate from './renderRelativeDate';
import renderTable from './renderTable';

export function render(state: State): readonly Rendering[] {
  switch (state.type) {
    case 'Pong':
      return renderSingleMessage('Pong!');
    case 'DetectedItems': {
      const { items } = state;
      const allValid = items.every(
          ({ name, amount }) => name.parsedValue !== null && amount.parsedValue !== null);
      return [
        {
          type: 'RenderedMessage',
          content: `找到了${items.length}堆物品！`,
        },
        {
          type: 'RenderedMessage',
          content: [
            `我会在下方发送${itemChecklist}。` +
            `您只需复制它（包括“${itemChecklistHeading}”标题），填写当前市场价格，然后发在频道里就行了✨`,
            '我还会记录您所有有效的清单，以供结算。',
            '还请您复核清单，修复不对的地方。' +
            (allValid ? '' : `（带有${warningSign}的物品可能有问题，但我无能为力啦🤷‍♀️）`),
          ].join('\n'),
        },
        {
          type: 'RenderedMessage',
          content: renderItemChecklist(
              items.map(({ name, amount }) => {
                const valid = name.parsedValue !== null && amount.parsedValue !== null;
                return `${valid ? '' : warningSign}` +
                    `${renderItemStack(
                        name.parsedValue || name.text,
                        amount.parsedValue === null ? amount.text : amount.parsedValue.toString())}` +
                    `${itemChecklistEntryPriceSeparator}${itemChecklistMarketPriceLabel}？`;
              }),
              [],
          ),
        },
      ];
    }
    case 'NoItemsDetected':
      return renderSingleMessage(
          '抱歉，没能从图中看出物品😔',
          '请确认这是一张完整的物品栏截图',
          `如果还是不行可以复制以前的${itemChecklist}，手动填写并回复`,
      );
    case 'SpreadsheetCreationFailure':
      return renderSingleMessage(
          '抱歉，创建 Google Sheets 时出了问题😔',
          mention(yzDiscordUserId),
      );
    case 'SpreadsheetCreated': {
      const { url } = state;
      return [
        {
          type: 'RenderedMessage',
          content: url,
        },
      ];
    }
    case 'ItemChecklistSubmittedConfirmation': {
      const {
        parsedItemChecklistContent: { entries, participants },
      } = state;
      if (!entries.length) {
        return renderSingleMessage('这份清单……看上去是空的？');
      }
      if (!participants) {
        return renderSingleMessage('这份清单没有参与者，请复制完整的清单。');
      }
      if (!participants.parsedValue) {
        return renderSingleMessage('请@所有参与者，以供参考。并且只@参与者，不写别的。');
      }

      const allValid = entries.every((entry) => entry.parsedValue !== null);
      if (allValid) {
        return [
          {
            type: 'RenderedMessage',
            content: `✅${itemChecklist}已记录。感谢您的使用`,
          },
          {
            type: 'RenderedMessage',
            content: renderNextSteps([
              '• 发别的截图',
              `• 编辑您发的${itemChecklist}，系统会自动更新记录`,
              `• 删除您发的${itemChecklist}，系统会将其移出${checklistSummary}`,
              `• 按${summaryIcon}：查看${checklistSummary}`,
            ]),
            reactionContents: [summaryIcon],
          },
          {
            type: 'RenderedReaction',
            content: '❤️',
          },
        ];
      }

      const invalidChecklist =
          `这份清单中部分名称、数量、价格或格式有误，已用${warningSign}标出，请复核`;
      const checklist = renderItemChecklist(
          entries.map(
              entry => `${entry.parsedValue === null ? warningSign : ''}${entry.text}`),
          participants.parsedValue,
      );
      return [
        {
          type: 'RenderedMessage',
          content: invalidChecklist,
        },
        {
          type: 'RenderedMessage',
          content: checklist,
        },
      ];
    }
    case 'FetchedItemChecklistsOfToday': {
      const { checklists, itemsPrices } = state;
      return [
        {
          type: 'RenderedMessage',
          content: [
            `${summaryIcon}**${itemChecklist}统计**`,
            `以下为今天提交的${itemChecklist}。计算价格用的数据请看这份报告的下一节。`,
          ].join('\n'),
        },
        ...checklists
            .map((checklist, index) => ({
              type: 'RenderedMessage',
              content: renderChecklistSummary(checklist, indexIcons[index]),
            } as const)),
        {
          type: 'RenderedMessage',
          content: [
            `${ledgerIcon}**物品单价统计**`,
            '以下列出了清单中的物品以及市场价。如果一件物品在不同的清单中有不同的价格，最新的价格在最前面：',
          ].join('\n'),
        },
        // Chunk price texts to avoid discord's limit on 2000 characters.
        ..._.chunk(Object.entries(itemsPrices).map(([itemName, prices]) => {
          const pricesText = groupAdjacentDuplicates(prices)
              .map(({ value, count }) => {
                const priceSamples = count === 1 ? '' : `（${count}例）`;
                return `${value}${priceSamples}`;
              })
              .join('，');
          return `${itemName}：${pricesText}`;
        }), 50).map((itemPricesTexts) => ({
          type: 'RenderedMessage',
          content: itemPricesTexts.join('\n'),
        } as const)),
        {
          type: 'RenderedMessage',
          content: renderNextSteps([
            `• 选择一个或多个${itemChecklist}（如1️⃣），然后：`,
            `    ◦ 按${ledgerIcon}：根据所选清单，生成00参战记录 Excel 行以供工会会计记录。`,
            `    ◦ 按${handsUpIcon}：与参与者均分所选清单。`,
            `• 如果统计中任何物品、价格、或参与者不对，请编辑相应的清单，然后重新查看${checklistSummary}。` +
            '若清单不是由您发的，您可以重新发送一份，然后不要选旧的清单。',
          ]),
          reactionContents: [
            ...checklists.map((checklist, index) => indexIcons[index]),
            ledgerIcon,
            handsUpIcon,
          ],
        },
      ];
    }
    case 'SettledUpParticipants': {
      const { checklistIndices, itemTransitions, participants } = state;
      const itemsGrandTotal = getTotalPrice(itemTransitions.map(({ entry }) => entry)
          .filter(({ name }) => name !== 'ISK'));
      return [
        renderActivitySummary(participants, checklistIndices, itemsGrandTotal),
        {
          type: 'RenderedMessage',
          content: '推荐合同方案为：',
        },
        {
          type: 'RenderedMessage',
          content: renderContractsToSettleUp(itemTransitions, participants),
        },
      ];
    }
    case 'ChecklistNotSelected': {
      return [
        {
          type: 'RenderedMessage',
          content: '请选择物品清单。',
        },
      ];
    }
    case 'LedgerEntry': {
      const { checklistIndices, itemsGrandTotal, participants } = state;
      const [titleRow, activityRow] = _.unzip(Object.entries({
        日期: new Date().toLocaleDateString('en'),
        活动内容: '日常活动',
        存入办公室: 'FWST',
        仓库编号: '合同号',
        登记员: '合同号',
        '估算收益/e': _.floor(itemsGrandTotal / 100000000, 2),
        'credit/e': _.floor(itemsGrandTotal / participants.length / 100000000, 2),
        备注: ' ',
        参与人员: participants.map(({ name }) => name).join(excelCellSeparator),
      })).map(row => row.join(excelCellSeparator));
      return [
        renderActivitySummary(participants, checklistIndices, itemsGrandTotal),
        {
          type: 'RenderedMessage',
          content: '根据清单生成的00参战记录 Excel 行是：',
        },
        {
          type: 'RenderedMessage',
          content: titleRow,
        },
        {
          type: 'RenderedMessage',
          content: `=SPLIT("${activityRow.replace(/"/g, '""')}", "${excelCellSeparator}")`,
        },
      ];
    }
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
          `_价格爬取自${renderRelativeDate(fetchedAt)}_`,
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
          minFetchedAt && `_价格最早爬取自${renderRelativeDate(minFetchedAt)}_`,
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

function renderActivitySummary(participants: readonly User[], checklistIndices: readonly number[], itemsGrandTotal: number): RenderedMessage {
  return {
    type: 'RenderedMessage',
    content: [
      '此次活动：',
      `• 参与者：${participants.map(({ id }) => mention(id)).join('，')}`,
      `• 物品清单：${checklistIndices.map(index => indexIcons[index]).join('，')}`,
      `• 物品总价：${itemsGrandTotal}`,
      `• 每人应得：${Math.floor(itemsGrandTotal / participants.length)}`,
    ].join('\n'),
  }
}

function renderContractsToSettleUp(transitions: readonly ItemTransition[], participants: readonly User[]): string {
  return _.sortBy(
      Object.values(_.groupBy(transitions, ({ sourceParticipantIndex }) => sourceParticipantIndex)),
  )
      .map((targetTransitions) =>
          renderContractsFromSource(targetTransitions, participants))
      .join('\n')
}

function renderContractsFromSource(targetTransitions: readonly ItemTransition[], participants: readonly User[]): string {
  return [
    `• ${participants[targetTransitions[0].sourceParticipantIndex].name} 需要：`,
    ..._.sortBy(
        Object.values(_.groupBy(targetTransitions, ({ targetParticipantIndex }) => targetParticipantIndex)),
    ).map((transitions) =>
        renderContractsToTarget(transitions, participants)),
  ].join('\n');
}

function renderContractsToTarget(transitions: readonly ItemTransition[], participants: readonly User[]): string {
  const { sourceParticipantIndex, targetParticipantIndex } = transitions[0];
  const individualIdentifier =
      sourceParticipantIndex === targetParticipantIndex ? '自留' : `给 ${participants[targetParticipantIndex].name}`;
  const entries = transitions.map(({ entry }) => entry);
  return `    ◦ ${individualIdentifier}：${renderCompactItemChecklistEntries(entries)}` +
      `｜合同总价：${Math.round(getTotalPrice(entries))}`;
}

function renderNextSteps(entries: readonly string[]): string {
  return [
    '➡️_接下来，您还可以……_',
    ...entries,
  ].join('\n');
}

function groupAdjacentDuplicates<T>(items: readonly T[]): readonly DuplicateGroup<T>[] {
  const groups: DuplicateGroup<T>[] = [];
  if (!items.length) {
    return groups;
  }

  let currentGroup: DuplicateGroup<T> = {
    value: items[0],
    count: 1,
  };
  for (const item of items.slice(1)) {
    if (item === currentGroup.value) {
      currentGroup.count++;
      continue;
    }
    groups.push(currentGroup);
    currentGroup = {
      value: item,
      count: 1,
    };
  }
  groups.push(currentGroup);

  return groups;
}

function mention(userId: string): string {
  return `<@!${userId}>`;
}

interface DuplicateGroup<T> {
  readonly value: T;
  count: number;
}

export const indexIcons: readonly string[] = [
  '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '0️⃣', '*️⃣', '#️⃣', '🟧', '🟨', '🟦', '🟪', '🟫',
  '⬜', '🟠', '🟡', '🔵', '🟣', '🟤', '⚪',
];

function renderItemStack(name: string, amount: string): string {
  return `${name} ${itemChecklistAmountPrefix}${amount}`;
}

function renderChecklistSummary({ entries, author, createdAt }: ItemChecklist, icon: string): string {
  return [
    `${icon} ${author.name}｜${createdAt.toLocaleString('zh')} 上传`,
    `物品：${renderCompactItemChecklistEntries(entries)}`,
    `总价：${getTotalPrice(entries)}`,
    `总价计算公式：${entries.map(({ amount, price }) => `${price}\\*${amount}`).join('+')}`,
  ].join('\n');
}

function renderCompactItemChecklistEntries(entries: readonly ItemChecklistEntry[]): string {
  return entries.map(({ name, amount }) => {
    return renderItemStack(translateToChinese(name), Math.round(amount).toString());
  }).join('、');
}

function renderItemChecklist(entries: readonly string[], participants: readonly User[]): string {
  return [
    itemChecklistHeading,
    ...entries,
    `${itemChecklistParticipantsLabel} ${participants.map(({ name }) => `@${name}`).join('，')}`,
  ].join('\n');
}

const itemChecklist = '物品清单';
export const itemChecklistHeading = `📝${itemChecklist}`;
export const itemChecklistEntryPriceSeparator = '｜';
export const itemChecklistMarketPriceLabel = '市场价：';
export const itemChecklistAmountPrefix = 'x';
export const itemChecklistParticipantsLabel = '参与者：';
const checklistSummary = '清单报告';

const warningSign = '⚠';
export const summaryIcon = '📖';
export const handsUpIcon = '🙌';
export const ledgerIcon = '📒';

const excelCellSeparator = '｜';

export type Rendering = RenderedMessage | RenderedReaction;

const yzDiscordUserId = '202649496381816832';

export interface RenderedMessage {
  readonly type: 'RenderedMessage';
  readonly content: RenderedMessageContent;
  readonly reactionContents?: readonly string[];
}

export type RenderedMessageContent = string | MessageOptions & { split?: false };

export interface RenderedReaction {
  readonly type: 'RenderedReaction';
  readonly content: string;
}

/** Convenience method that constructs a single message to return. */
function renderSingleMessage(...lines: (string | null | undefined)[]): readonly RenderedMessage[] {
  return [{
    type: 'RenderedMessage',
    content: lines.filter(line => line != null).join('\n'),
  }];
}
