import h from 'vhtml';
import FleetLoot from '../../../data/FleetLoot';
import Container from './Container';
import Function from './Function';
import NumberInput from './NumberInput';
import SubmitButton from './SubmitButton';

function viewFleetLootEditor({ fleetMembers, loot }: FleetLoot, title: string): string {
  return (
    <Container title={title}>
      <form>
        <Section id="guide">
          <h2>📘 使用教程</h2>
          <a
            href="https://docs.qq.com/doc/DTlRabVZlT2xkVlpY?_t=1616964806901"
            target="_blank"
            rel="noopener noreferrer"
          >
            分赃小助手使用教程
          </a>
        </Section>
        <Section id="fleet">
          <h2>👥 参与者</h2>
          <p>请在每一行左边的格子填写参与者的名字，一人一行，别忘了自己 :)</p>
          <p>同时，在每一行右边的格子填写每人理应分得物品价格的权重，由分配方式决定：</p>
          <ul>
            <li>若按人头均分，则每人的权重为1。因为这是默认的分配方式，所以不用写明权重。</li>
            <li>若按角色数分，则单开者权重为1，双开者权重为2，以此类推。</li>
            <li>也可按船型或其他因素自由设置权重。</li>
          </ul>
          {[
            ...fleetMembers,
            ...new Array(Math.max(30 - fleetMembers.length, 5)).fill({ name: '', weight: 1 }),
          ].map(({ name, weight }, index) => (
            <FleetMemberRow class={index <= 14 ? '' : 'd-none'}>
              <input
                class="form-control"
                type="text"
                name={`member-${index}`}
                placeholder={`参与者${index + 1}`}
                value={name}
              />
              <NumberInput
                name={`weight-${index}`}
                placeholder="1"
                min={0}
                value={weight === 1 ? undefined : weight}
              />
            </FleetMemberRow>
          ))}
          <Button onClick="addFleetMember()">
            <b>+ </b>添加参与者
          </Button>
        </Section>
        <Section id="loot">
          <h2>📦 赃物</h2>
          <p>请填写空缺的格子。</p>
          {[
            ...loot,
            ...Array(Math.max(50 - loot.length, 10)).fill({
              name: '',
              amount: null,
              price: null,
            }),
          ].map(({ name, amount, price }, index) => {
            const hidden = loot.length <= index;
            return (
              <LootRow class={hidden ? 'd-none' : ''}>
                <input
                  class="form-control"
                  type="text"
                  name={`name-${index}`}
                  value={name}
                  placeholder="名称"
                  disabled={hidden}
                  required
                  pattern=".+"
                />
                <NumberInput
                  name={`amount-${index}`}
                  value={amount}
                  placeholder="数量"
                  disabled={hidden}
                  required
                  min={1}
                />
                <NumberInput
                  name={`price-${index}`}
                  value={price === null ? undefined : price.toString()}
                  placeholder="价格"
                  disabled={hidden}
                  required
                  min={1}
                />
              </LootRow>
            );
          })}
          <Button onClick="addLootItem()">
            <b>+ </b>添加物品
          </Button>
          <Button onClick="removeLootItem()">
            <b>- </b>删除物品
          </Button>
        </Section>
        <Section id="controls">
          <p>点击下方按钮以保存并覆盖分赃记录。之后可返回聊天软件核对赃物，填写的名称及数量是否和截图一致。</p>
          <SubmitButton>💾 保存</SubmitButton>
        </Section>
      </form>
      <Function>
        {addLootItem}
        {addFleetMember}
        {removeLootItem}
      </Function>
    </Container>
  );
}

function FleetMemberRow({
  class: className,
  children: [nameColumn, weightColumn],
}: {
  readonly class: string;
  readonly children: [nameColumn: string, weightColumn: number];
}): string {
  return (
    <div class={`member row mb-1 ${className}`}>
      <div class="col-8 col-sm-4 mb-1 pe-1">{nameColumn}</div>
      <div class="col-4 col-sm-2 mb-1 ps-0">{weightColumn}</div>
    </div>
  );
}

function LootRow({
  class: className,
  children: [itemNameColumn, itemAmountColumn, itemPriceColumn],
}: {
  readonly class: string;
  readonly children: [itemNameColumn: string, itemAmountColumn: string, itemPriceColumn: string];
}): string {
  return (
    <div class={`item row mb-1 ${className}`}>
      <div class="col-12 col-sm-7 mb-1 pe-sm-1">{itemNameColumn}</div>
      <div class="col-4 col-sm-2 mb-1 ps-sm-0 pe-1">{itemAmountColumn}</div>
      <div class="col-8 col-sm-3 mb-1 ps-0">{itemPriceColumn}</div>
    </div>
  );
}

function Section({ id, children }: { readonly id: string; readonly children: any[] }): string {
  return (
    <section id={id} class="mb-4">
      {children}
    </section>
  );
}

function Button({ onClick, children }: { onClick: string; children: string[] }): string {
  return (
    <button class="btn btn-secondary btn-sm me-2" type={'button' as const} onclick={onClick}>
      {children}
    </button>
  );
}

function addLootItem() {
  const element = document.querySelector('#loot .item.d-none');
  if (!element) {
    return;
  }

  element.classList.remove('d-none');
  element
    .querySelectorAll('input')
    .forEach((inputElement) => void inputElement.removeAttribute('disabled'));
}

function removeLootItem() {
  const elements = document.querySelectorAll('#loot .item:not(.d-none)');
  const element = elements[elements.length - 1];
  if (!element) {
    return;
  }

  element.classList.add('d-none');
  element
    .querySelectorAll('input')
    .forEach((inputElement) => void inputElement.setAttribute('disabled', 'true'));
}

function addFleetMember() {
  const element = document.querySelector('#fleet .member.d-none');
  if (element) {
    element.classList.remove('d-none');
  }
}

export default viewFleetLootEditor;
