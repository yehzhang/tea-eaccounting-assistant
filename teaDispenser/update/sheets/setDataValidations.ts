import getAuthClient from './getAuthClient';

async function setDataValidations(spreadsheetId: string): Promise<boolean> {
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
        ],
      },
    });
    return true;
  } catch (e) {
    console.error('Unexpected error when setting data validation', e);
    return false;
  }
}

export default setDataValidations;
