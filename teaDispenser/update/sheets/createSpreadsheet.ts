import getAuthClient from './getAuthClient';

async function createSpreadsheet(username: string): Promise<Spreadsheet | null> {
  const todayLocaleString = new Date().toLocaleString('zh', { month: 'short', day: 'numeric' });
  const title = `${todayLocaleString} @${username} 分赃记录 - 由分赃小助手提供`;
  try {
    const response = await getAuthClient().request({
      url: 'https://sheets.googleapis.com/v4/spreadsheets',
      method: 'POST',
      data: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              gridProperties: {
                frozenRowCount: 2,
                frozenColumnCount: 1,
              },
            },
            conditionalFormats: [
              {
                // Make 0 values less visible over the page.
                ranges: [
                  {
                    // Applies to all cells.
                  },
                ],
                booleanRule: {
                  condition: {
                    type: 'NUMBER_EQ',
                    values: [
                      {
                        userEnteredValue: '0',
                      },
                    ],
                  },
                  format: {
                    textFormat: {
                      foregroundColor: silver,
                    },
                  },
                },
              },
              {
                // Mark not yet split amount as yellow.
                ranges: [splitAmountGridRange],
                booleanRule: {
                  condition: {
                    type: 'NUMBER_GREATER',
                    values: [
                      {
                        userEnteredValue: '0',
                      },
                    ],
                  },
                  format: {
                    backgroundColor: yellow,
                  },
                },
              },
              {
                // Mark over split amount as red.
                ranges: [splitAmountGridRange],
                booleanRule: {
                  condition: {
                    type: 'NUMBER_LESS',
                    values: [
                      {
                        userEnteredValue: '0',
                      },
                    ],
                  },
                  format: {
                    backgroundColor: red,
                  },
                },
              },
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 5), 'F2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 6), 'G2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 7), 'H2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 8), 'I2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 9), 'J2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 10), 'K2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 11), 'L2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 12), 'M2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 13), 'N2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 14), 'O2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 15), 'P2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 16), 'Q2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 17), 'R2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 18), 'S2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 19), 'T2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 20), 'U2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 21), 'V2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 22), 'W2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 23), 'X2'),
              ...buildSplitValueConditionalFormatRules(buildSingleCellGridRange(1, 24), 'Y2'),
            ],
            data: [
              {
                // Make the participant names bold.
                startColumn: 5,
                rowData: [
                  {
                    values: [
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                      buildBoldTextFormatCell(),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    const { spreadsheetId, spreadsheetUrl } = response.data as any;
    if (!spreadsheetId || !spreadsheetUrl) {
      console.error('Expected Spreadsheet ID from response', response);
      return null;
    }
    return {
      id: spreadsheetId,
      url: spreadsheetUrl,
      linkTitle: `${title} - Google Sheets`,
    };
  } catch (e) {
    console.error('Unexpected error when creating a Spreadsheet', e);
    return null;
  }
}

function buildBoldTextFormatCell() {
  return {
    userEnteredFormat: {
      textFormat: {
        bold: true,
      },
    },
  };
}

function buildSplitValueConditionalFormatRules(gridRange: GridRange, cellReference: string) {
  const expression = `(${cellReference}-${averageSplitValueCellReference})/${averageSplitValueCellReference}`;
  return [
    buildConditionalFormatRule(gridRange, `=${expression}>10%`, green),
    buildConditionalFormatRule(gridRange, `=AND(${cellReference}<>0, ${expression}<-10%)`, red),
  ];
}

const averageSplitValueCellReference = 'D2';

function buildConditionalFormatRule(
  gridRange: GridRange,
  userEnteredValue: string,
  backgroundColor: Color
) {
  return {
    ranges: [gridRange],
    booleanRule: {
      condition: {
        type: 'CUSTOM_FORMULA',
        values: [
          {
            userEnteredValue,
          },
        ],
      },
      format: {
        backgroundColor,
      },
    },
  };
}

function buildSingleCellGridRange(rowIndex: number, columnIndex: number): GridRange {
  return {
    startRowIndex: rowIndex,
    endRowIndex: rowIndex + 1,
    startColumnIndex: columnIndex,
    endColumnIndex: columnIndex + 1,
  };
}

const splitAmountGridRange = {
  startRowIndex: 2,
  startColumnIndex: 4,
  endColumnIndex: 5,
};
const yellow: Color = {
  red: 252 / 255,
  green: 232 / 255,
  blue: 178 / 255,
};
const red: Color = {
  red: 244 / 255,
  green: 199 / 255,
  blue: 195 / 255,
};
const silver: Color = {
  red: 217 / 255,
  green: 217 / 255,
  blue: 217 / 255,
};
const green: Color = {
  red: 183 / 255,
  green: 225 / 255,
  blue: 205 / 255,
};

interface GridRange {
  readonly startRowIndex: number;
  readonly endRowIndex: number;
  readonly startColumnIndex: number;
  readonly endColumnIndex: number;
}

/** Range: [0, 1] */
interface Color {
  readonly red: number;
  readonly green: number;
  readonly blue: number;
}

interface Spreadsheet {
  readonly id: string;
  readonly url: string;
  readonly linkTitle: string;
}

export default createSpreadsheet;
