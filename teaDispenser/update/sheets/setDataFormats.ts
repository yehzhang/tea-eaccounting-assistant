import getAuthClient from './getAuthClient';

async function setDataFormats(spreadsheetId: string): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      method: 'POST',
      data: {
        requests: [
          {
            // Validate price and amount numbers.
            setDataValidation: {
              range: {
                startRowIndex: 2,
                startColumnIndex: 1,
                endColumnIndex: 3,
              },
              rule: {
                condition: {
                  type: "NUMBER_GREATER",
                  values: [
                    {
                      'userEnteredValue': '0',
                    },
                  ],
                },
              },
            },
          },
          // Market price.
          buildPriceNumberFormat(1),
          // Total price.
          buildPriceNumberFormat(3),
          // Expected gain per participant.
          buildPriceNumberFormat(4),
          // Actual gain per participant.
          buildPriceNumberFormat(7),
          buildPriceNumberFormat(9),
          buildPriceNumberFormat(11),
          buildPriceNumberFormat(13),
          buildPriceNumberFormat(15),
          buildPriceNumberFormat(17),
          buildPriceNumberFormat(19),
          buildPriceNumberFormat(21),
          buildPriceNumberFormat(23),
          buildPriceNumberFormat(25),
          {
            // Resize the item name column.
            autoResizeDimensions: {
              dimensions: {
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1,
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

function buildPriceNumberFormat(columnIndex: number) {
  return {
    repeatCell: {
      range: {
        startRowIndex: 1,
        startColumnIndex: columnIndex,
        endColumnIndex: columnIndex + 1,
      },
      cell: {
        userEnteredFormat: {
          numberFormat: {
            type: 'NUMBER',
            pattern: '[<1000]0;[<999500]0,"K";0,,"M"',
          },
        },
      },
      fields: "userEnteredFormat.numberFormat",
    },
  };
}

export default setDataFormats;
