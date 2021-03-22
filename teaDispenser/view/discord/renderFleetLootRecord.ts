import _ from 'lodash';
import handsUpIcon from '../../data/handsUpIcon';
import kiwiIcon from '../../data/kiwiIcon';
import Needs from '../../data/Needs';
import RenderedMessage from '../../data/RenderedMessage';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';
import fleetLootEditorLinkName from './fleetLootEditorLinkName';
import renderEmbedMessage from './renderEmbedMessage';
import renderNumber from './renderNumber';
import renderTable from './renderTable';

function renderFleetLootRecord(
  title: string,
  itemStacks: readonly UserInputPricedItemStack[],
  fleetLootEditorUrl: string,
  neederChooserUrl: string | null,
  fleetMembers: readonly string[],
  needs: Needs
): RenderedMessage {
  return renderEmbedMessage(
    {
      title,
      description: [
        `[${fleetLootEditorLinkName}](${fleetLootEditorUrl})${
          neederChooserUrl ? ` • [${neederChooserLinkName}](${neederChooserUrl})` : ''
        }`,
        renderTable(
          ['物品', '数量', '价格'],
          itemStacks.map(({ name, amount, price }) => [
            name,
            renderNumber(amount),
            renderNumber(price),
          ]),
          /* visibleColumnSeparator= */ true,
          /* visibleHeader= */ false
        ),
        ...renderFleetMembers(fleetMembers),
        ...renderNeeds(
          needs,
          itemStacks.map(({ name }) => name)
        ),
        '️**分赃指南**',
        `1. 若需合并两份分赃记录，可先后按它们的 ${kiwiIcon} 按钮`,
        `2. 点击"${fleetLootEditorLinkName}"，填写人员与物品`,
        `3. 邀请参与者点击"${neederChooserLinkName}"，填写需求`,
        `4. 按下方 ${handsUpIcon} 按钮以自动均分无需求的物品`,
        '5. 参与者发送合同至分赃者，请求物品',
        '6. 若分赃不均，参与者可额外请求差额',
      ].join('\n'),
    },
    [handsUpIcon, kiwiIcon],
    /* overwrite= */ true
  );
}

const neederChooserLinkName = '编辑需求';

function renderFleetMembers(fleetMembers: readonly string[]): readonly string[] {
  if (!fleetMembers.length) {
    return [];
  }
  return ['**参与者**', ...fleetMembers.map((member) => `◦ ${member}`), ''];
}

function renderNeeds(needs: Needs, itemNames: readonly string[]): readonly string[] {
  const renderedNeeds = _.sortBy(needs, ({ item: { name } }) =>
    itemNames.indexOf(name)
  ).map(({ needer, item: { name, amount } }) => [name, renderNumber(amount), needer]);
  if (!renderedNeeds.length) {
    return [];
  }
  return [
    '**需求**',
    renderTable(
      ['物品', '数量', '需求者'],
      renderedNeeds,
      /* visibleColumnSeparator= */ true,
      /* visibleHeader= */ false
    ),
  ];
}

export default renderFleetLootRecord;
