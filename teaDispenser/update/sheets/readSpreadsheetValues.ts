import _ from 'lodash';
import ItemRow from '../../data/ItemRow';
import ItemSplit from '../../data/ItemSplit';
import ParticipantColumn from '../../data/ParticipantColumn';
import getAuthClient from './getAuthClient';

async function readSpreadsheetValues(spreadsheetId: string): Promise<ItemSplit | null> {
  try {
    const response = await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A:Z`,
      method: 'GET',
      params: {
        valueRenderOption: 'UNFORMATTED_VALUE',
      },
    });
    const values: SheetValues = (response.data as any).values;
    return {
      participants: parseParticipantColumns(values),
      spareItems: parseSpareItems(values),
    };
  } catch (e) {
    console.error('Unexpected error when read a Spreadsheet', e);
    return null;
  }
}

function parseSpareItems(values: SheetValues): readonly ItemRow[] {
  return mapItemRows(values, (row, rowIndex) => {
    const [, , price, , remainingAmount] = row;
    if (price === ' ' || !price) {
      return null;
    }
    if (typeof price !== 'number' || typeof remainingAmount !== 'number') {
      console.warn('Unexpected sheet row when parsing spare items', row);
      return null;
    }
    if (remainingAmount <= 0) {
      return null;
    }
    return {
      rowIndex,
      price,
      amount: remainingAmount,
    };
  });
}

function mapItemRows(
  values: SheetValues,
  callbackFn: (row: SheetRow, rowIndex: number) => ItemRow | null
): readonly ItemRow[] {
  const itemRowsStartIndex = 2;
  return _.compact(
    values
      .slice(itemRowsStartIndex)
      .map((row, index) => callbackFn(row, index + itemRowsStartIndex))
  );
}

function parseParticipantColumns(values: SheetValues): readonly ParticipantColumn[] {
  return _.compact(
    [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map((columnIndex) => {
      const participantName = parseParticipantName(values, columnIndex);
      if (
        participantName.startsWith('参与者') &&
        values.slice(2).every((row) => !hasCellValue(row[columnIndex]))
      ) {
        return null;
      }
      return {
        columnIndex,
        participantName,
        items: parseParticipantItemRows(values, columnIndex),
      };
    })
  );
}

function parseParticipantName(values: SheetValues, columnIndex: number): string {
  const rawParticipantName = values[0][columnIndex];
  if (rawParticipantName == null) {
    return '';
  }
  return rawParticipantName.toString();
}

function hasCellValue(value: string | number | null | undefined): value is string | number {
  return value != null && value !== '';
}

function parseParticipantItemRows(values: SheetValues, columnIndex: number): readonly ItemRow[] {
  return mapItemRows(values, (row, rowIndex) => {
    const [, , price] = row;
    const amount = row[columnIndex];
    if (price === ' ' || !price || !amount) {
      return null;
    }
    if (typeof price !== 'number' || typeof amount !== 'number') {
      console.warn('Unexpected sheet row when parsing participant item rows', row);
      return null;
    }
    return {
      rowIndex,
      price,
      amount,
    };
  });
}

type SheetValues = readonly SheetRow[];
type SheetRow = readonly (string | number | undefined)[];

export default readSpreadsheetValues;
