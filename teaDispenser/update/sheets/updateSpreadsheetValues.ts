import ParticipantColumn from '../../data/ParticipantColumn';
import getAuthClient from './getAuthClient';

async function updateSpreadsheetValues(spreadsheetId: string, participants: readonly ParticipantColumn[]): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
      method: 'POST',
      data: {
        valueInputOption: 'USER_ENTERED',
        data: participants.map(buildValueRange),
      },
    });
    return true;
  } catch (e) {
    console.error('Unexpected error when updating the Spreadsheet values', e);
    return false;
  }
}

function buildValueRange({ columnIndex, items }: ParticipantColumn) {
  const columnValues = [];
  for (const { amount, rowIndex } of items) {
    columnValues[rowIndex] = amount;
  }

  const columnReference = String.fromCharCode('A'.charCodeAt(0) + columnIndex);
  return {
    range: `${columnReference}:${columnReference}`,
    majorDimension: 'COLUMNS',
    values: [columnValues],
  };
}

export default updateSpreadsheetValues;
