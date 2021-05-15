import _ from 'lodash';
import FleetLoot from '../../data/FleetLoot';
import FleetMember from '../../data/FleetMember';
import UserInputPricedItemStack from '../../data/UserInputPricedItemStack';

function parseFleetLootEditorForm(form: unknown): FleetLoot | null {
  if (!_.isObject(form)) {
    return null;
  }
  const fleetMembers = parseFleetMembers(form as Form);
  const loot = parseLoot(form as Form);
  if (!fleetMembers || !loot) {
    return null;
  }
  return {
    fleetMembers,
    loot,
  };
}

function parseFleetMembers(form: Form): readonly FleetMember[] | null {
  const rows = parseIndexedRows(['member', 'weight'], form);
  if (!rows) {
    return null;
  }
  const fleetMembers = _.compact(
    rows.map(({ member, weight }) => {
      if (!member) {
        return null;
      }
      const parsedWeight = weight ? parseNumber(weight) : 1;
      if (parsedWeight === null) {
        console.warn('Expected valid weight number, got', member, weight, form);
        return null;
      }
      return {
        name: member,
        weight: parsedWeight,
      };
    })
  );

  // Aggregate entries with the same name.
  return Object.entries(_.groupBy(fleetMembers, ({ name }) => name)).map(
    ([name, groupedMembers]) => ({
      name,
      weight: _.sumBy(groupedMembers, ({ weight }) => weight),
    })
  );
}

function parseLoot(form: Form): readonly UserInputPricedItemStack[] | null {
  const rows = parseIndexedRows(['name', 'amount', 'price'], form);
  if (!rows) {
    return null;
  }
  return _.compact(
    rows.map(({ name, amount, price }) => {
      const parsedAmount = parseNumber(amount);
      const parsedPrice = parseNumber(price);
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

function parseIndexedRows<T extends string>(
  columnKeys: readonly T[],
  form: Form
): readonly { readonly [K in T]?: string }[] | null {
  const indexedRows: { [K in T]?: string }[] = [];
  for (const [formKey, formValue] of Object.entries(form)) {
    const [columnKey, ...indexParts] = formKey.split('-');
    if (!arrayIncludes(columnKeys, columnKey)) {
      continue;
    }
    const index = Number(indexParts.join('-'));
    if (isNaN(index) || typeof formValue !== 'string') {
      console.error('Expected value form entry, got', formKey, formValue, form);
      return null;
    }

    indexedRows[index] = indexedRows[index] || {};
    indexedRows[index][columnKey] = formValue;
  }
  return _.compact(indexedRows);
}

interface Form {
  readonly [indexedColumnKey: string]: unknown;
}

function arrayIncludes<T extends U, U>(hey: readonly (T | U)[], needle: U): needle is T {
  return hey.includes(needle);
}

function parseNumber(text: string | undefined): number | null {
  const number = Number(text);
  if (isNaN(number)) {
    return null;
  }
  return number;
}

export default parseFleetLootEditorForm;
