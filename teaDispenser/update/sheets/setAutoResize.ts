import getAuthClient from './getAuthClient';

async function setAutoResize(spreadsheetId: string): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      method: 'POST',
      data: {
        requests: [
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
    console.error('Unexpected error when setting auto resize', e);
    return false;
  }
}

export default setAutoResize;
