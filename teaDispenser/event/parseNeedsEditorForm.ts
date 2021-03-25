import _ from 'lodash';
import ItemStack from '../data/ItemStack';

function parseNeedsEditorForm(form: unknown): readonly ItemStack[] {
  if (!_.isObject(form)) {
    return [];
  }
  return _.compact(
    Object.entries(form).map(([key, value]) => {
      const amount = Number(value);
      if (!key || !value || isNaN(amount) || !amount) {
        return null;
      }
      return {
        name: key,
        amount,
      };
    })
  );
}

export default parseNeedsEditorForm;
