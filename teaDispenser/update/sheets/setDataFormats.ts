import getAuthClient from './getAuthClient';

async function setDataFormats(spreadsheetId: string): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      method: 'POST',
      data: {
        requests: [
          {
            // Validate the price and amount numbers.
            setDataValidation: {
              range: {
                startRowIndex: 2,
                startColumnIndex: 1,
                endColumnIndex: 3,
              },
              rule: {
                condition: {
                  type: 'NUMBER_GREATER',
                  values: [
                    {
                      userEnteredValue: '0',
                    },
                  ],
                },
              },
            },
          },
          {
            // Make all numbers comma separator.
            repeatCell: {
              range: {
                // Applies to all cells.
              },
              cell: {
                userEnteredFormat: {
                  numberFormat: {
                    type: 'NUMBER',
                    // `#,#` adds separators, while `0` makes a single digit 0 visible.
                    // No idea what the middle `#` does. ¯\_(ツ)_/¯
                    pattern: '#,##0',
                  },
                },
              },
              fields: 'userEnteredFormat.numberFormat',
            },
          },
          {
            // Make the name column wider by default.
            updateDimensionProperties: {
              range: {
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
              },
              properties: {
                pixelSize: 185,
              },
              fields: 'pixelSize',
            },
          },
          {
            // Make the border thicker between item and participant columns.
            updateBorders: {
              range: {
                startColumnIndex: 4,
                endColumnIndex: 5,
              },
              right: {
                style: 'SOLID_THICK',
                color: {
                  red: 0.85,
                  green: 0.85,
                  blue: 0.85,
                },
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (e) {
    console.error('Unexpected error when setting data formats', e);
    return false;
  }
}

export default setDataFormats;
