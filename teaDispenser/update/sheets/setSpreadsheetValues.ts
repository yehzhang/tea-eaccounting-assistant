import ItemStack from '../../data/ItemStack';
import getAuthClient from './getAuthClient';

async function setSpreadsheetValues(
  spreadsheetId: string,
  items: readonly ItemStack[]
): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:AB52`,
      method: 'PUT',
      params: {
        valueInputOption: 'USER_ENTERED',
      },
      data: {
        values: getSheetValues(items),
      },
    });
    return true;
  } catch (e) {
    console.error('Unexpected error when updating the Spreadsheet', e);
    return false;
  }
}

function getSheetValues(items: readonly ItemStack[]): readonly (readonly (string | null)[])[] {
  const priceArrayReference = 'C3:C52';
  const participantCountReference = 'Q2';
  return [
    [
      null,
      '数量',
      '价格',
      '平分价值',
      '错分检测',
      '参与者1',
      '参与者2',
      '参与者3',
      '参与者4',
      '参与者5',
      '参与者6',
      '参与者7',
      '参与者8',
      '参与者9',
      '参与者10',
      null,
      '参与人数',
    ],
    [
      '赃物↓    总价→',
      null,
      // Total price
      `=SUMPRODUCT(B3:B52, ${priceArrayReference})`,
      // Average price
      `=IF(${participantCountReference}=0, "", FLOOR(C2/${participantCountReference}))`,
      // Average price
      null,
      // Total price per participant
      `=SUMPRODUCT(F3:F52, ${priceArrayReference})`,
      `=SUMPRODUCT(G3:G52, ${priceArrayReference})`,
      `=SUMPRODUCT(H3:H52, ${priceArrayReference})`,
      `=SUMPRODUCT(I3:I52, ${priceArrayReference})`,
      `=SUMPRODUCT(J3:J52, ${priceArrayReference})`,
      `=SUMPRODUCT(K3:K52, ${priceArrayReference})`,
      `=SUMPRODUCT(L3:L52, ${priceArrayReference})`,
      `=SUMPRODUCT(M3:M52, ${priceArrayReference})`,
      `=SUMPRODUCT(N3:N52, ${priceArrayReference})`,
      `=SUMPRODUCT(O3:O52, ${priceArrayReference})`,
      null,
      // Participant count
      '=OR(F1<>"参与者1",F2<>0) + OR(G1<>"参与者2",G2<>0) + OR(H1<>"参与者3",H2<>0) + OR(I1<>"参与者4",I2<>0) + OR(J1<>"参与者5",J2<>0) + OR(K1<>"参与者6",K2<>0) + OR(L1<>"参与者7",L2<>0) + OR(M1<>"参与者8",M2<>0) + OR(N1<>"参与者9",N2<>0) + OR(O1<>"参与者10",O2<>0)',
    ],
    ...items.map(({ name, amount, price }, index) =>
      getItemRow(name, price ? price.toString() : ' ', amount || ' ', index + 3)
    ),
    // Leave some redundancy below item rows.
    ...new Array(Math.max(50 - items.length, 0))
      .fill(null)
      .map((ignored, index) => getItemRow(null, null, null, index + 3 + items.length)),
  ];
}

function getItemRow(
  name: string | null,
  price: string | null,
  amount: string | null,
  rowIndex: number
): readonly (string | null)[] {
  const amountReference = `B${rowIndex}`;
  return [
    name && escapeText(name),
    amount,
    price,
    // 平分价值
    null,
    // 错分检测
    `=IF(ISNUMBER(${amountReference}), ${amountReference}-F${rowIndex}-G${rowIndex}-H${rowIndex}-I${rowIndex}-J${rowIndex}-K${rowIndex}-L${rowIndex}-M${rowIndex}-N${rowIndex}-O${rowIndex}, 0)`,
  ];
}

function escapeText(text: string): string {
  if (text.startsWith(`'`)) {
    return `'` + text;
  }
  return text;
}

export default setSpreadsheetValues;
