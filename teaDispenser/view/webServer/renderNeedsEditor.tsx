import h from 'vhtml';
import ItemStack from '../../data/ItemStack';
import Container from './Container';
import NumberInput from './NumberInput';
import SubmitButton from './SubmitButton';

function renderNeedsEditor(title: string, itemStacks: readonly ItemStack[]): string {
  return (
    <Container title={title}>
      <h2>需求</h2>
      <p>请在需求的物品后面输入数量。</p>
      <p>
        分赃时，会优先满足有需求者。若总需求大于供给，会优先考虑需求者之间的均等，而无视超额的需求量。
      </p>
      <form>
        {itemStacks.map(({ name, amount }) => (
          <div class="row mb-1">
            <b class="pe-1 col-9 col-sm-6">{name}</b>
            <div class="mb-1 ps-0 col-3 col-sm-2">
              <NumberInput
                class="form-control form-control-sm"
                name={name}
                value={amount || undefined}
                placeholder="数量"
                min={0}
              />
            </div>
          </div>
        ))}
        <SubmitButton>💾 保存</SubmitButton>
      </form>
    </Container>
  );
}

export default renderNeedsEditor;
