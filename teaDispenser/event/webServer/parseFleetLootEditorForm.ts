import _ from 'lodash';
import FleetLoot from '../../data/FleetLoot';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';

function parseFleetLootEditorForm(form: unknown): FleetLoot | null {
  if (!_.isObject(form)) {
    return null;
  }

  const fleetMembers = parseFleetMembers(form as any);
  if (!fleetMembers) {
    return null;
  }

  return {
    fleetMembers,
    loot: parseLoot(form),
  };
}

function parseFleetMembers(form: { readonly [key: string]: unknown }): readonly string[] | null {
  const fleetMembers = form['fleet-member'];
  if (typeof fleetMembers === 'string') {
    return [fleetMembers];
  }
  if (_.isArray(fleetMembers)) {
    if (!fleetMembers.every((fleetMember) => typeof fleetMember === 'string')) {
      return null;
    }
    return _.uniq(_.compact(fleetMembers));
  }
  if (!fleetMembers) {
    return [];
  }
  return null;
}

function parseLoot(form: object): readonly UserInputPricedItemStack[] {
  const loot: {
    [key: string]: { name?: string; amount?: string; price?: string };
  } = {};
  for (const [formKey, formValue] of Object.entries(form)) {
    const parts = formKey.split('-');
    const [attributeName, itemKey] = parts;
    if (
      parts.length !== 2 ||
      (attributeName !== 'name' && attributeName !== 'price' && attributeName !== 'amount')
    ) {
      continue;
    }

    loot[itemKey] = loot[itemKey] || {};
    loot[itemKey][attributeName] = formValue;
  }
  return _.compact(
    Object.values(loot).map(({ name, amount, price }) => {
      const parsedAmount = parsePrice(amount);
      const parsedPrice = parsePrice(price);
      if (!name && parsedAmount === null && parsedPrice === null) {
        return null;
      }
      return {
        name: name || '',
        amount: parsedAmount,
        price: parsedPrice,
      };
    })
  );
}

function parsePrice(rawPrice: string | undefined): number | null {
  const price = Number(rawPrice);
  if (isNaN(price)) {
    return null;
  }
  return price;
}

export default parseFleetLootEditorForm;
