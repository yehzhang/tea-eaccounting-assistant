import h from 'vhtml';
import FleetLoot from '../../data/FleetLoot';
import Container from './Container';
import Function from './Function';
import NumberInput from './NumberInput';
import SubmitButton from './SubmitButton';

function viewFleetLootEditor({ fleetMembers, loot }: FleetLoot, title: string): string {
  return (
    <Container title={title}>
      <form>
        <Section id="fleet">
          <h2>👥 参与者</h2>
          <p>请填写参与者的名字。别忘了自己 :)</p>
          {[...fleetMembers, ...new Array(Math.max(30 - fleetMembers.length, 5)).fill('')].map(
            (name, index) => (
              <input
                class={`member form-control mb-1 col-sm-4 ${index <= 14 ? '' : 'd-none'}`}
                type="text"
                name="fleet-member"
                placeholder={`参与者${index + 1}`}
                value={name}
              />
            )
          )}
          <Button onClick="addFleetMember()">
            <b>+ </b>添加参与者
          </Button>
        </Section>
        <Section id="loot">
          <h2>📦 赃物</h2>
          <p>请校对数量与价格，并填写空缺的格子。</p>
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
          <SubmitButton>💾 保存并覆盖</SubmitButton>
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

interface LootRowProps {
  readonly class: string;
  readonly children: [string, string, string];
}

function LootRow({
  class: className,
  children: [itemNameColumn, itemAmountColumn, itemPriceColumn],
}: LootRowProps): string {
  return (
    <div class={`item row mb-1 ${className}`}>
      <div class="col-12 mb-1 col-sm-7 pe-sm-1">{itemNameColumn}</div>
      <div class="col-4 mb-1 pe-1 col-sm-2 ps-sm-0">{itemAmountColumn}</div>
      <div class="col-8 mb-1 ps-0 col-sm-3">{itemPriceColumn}</div>
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
