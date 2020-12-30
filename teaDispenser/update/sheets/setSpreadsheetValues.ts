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
  return [
    [
      null,
      '价格',
      '数量',
      '总价',
      '平分价值',
      '错分检测',
      '参与者1',
      '分得价值',
      '参与者2',
      '分得价值',
      '参与者3',
      '分得价值',
      '参与者4',
      '分得价值',
      '参与者5',
      '分得价值',
      '参与者6',
      '分得价值',
      '参与者7',
      '分得价值',
      '参与者8',
      '分得价值',
      '参与者9',
      '分得价值',
      '参与者10',
      '分得价值',
      null,
      '参与人数',
    ],
    [
      '赃物↓    总价→',
      null,
      null,
      '=SUM(D3:D52)',
      '=IF(AB2=0, "", FLOOR(D2/AB2))',
      null,
      null,
      '=SUM(H3:H52)',
      null,
      '=SUM(J3:J52)',
      null,
      '=SUM(L3:L52)',
      null,
      '=SUM(N3:N52)',
      null,
      '=SUM(P3:P52)',
      null,
      '=SUM(R3:R52)',
      null,
      '=SUM(T3:T52)',
      null,
      '=SUM(V3:V52)',
      null,
      '=SUM(X3:X52)',
      null,
      '=SUM(Z3:Z52)',
      null,
      '=OR(G1<>"参与者1",H2<>0) + OR(I1<>"参与者2",J2<>0) + OR(K1<>"参与者3",L2<>0) + OR(M1<>"参与者4",N2<>0) + OR(O1<>"参与者5",P2<>0) + OR(Q1<>"参与者6",R2<>0) + OR(S1<>"参与者7",T2<>0) + OR(U1<>"参与者8",V2<>0) + OR(W1<>"参与者9",X2<>0) + OR(Y1<>"参与者10",Z2<>0)',
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
  const priceReference = `B${rowIndex}`;
  const safePriceReference = `IF(ISNUMBER(${priceReference}), ${priceReference}, 0)`;
  const amountReference = `C${rowIndex}`;
  return [
    name,
    price,
    amount,
    // 总价
    `=IF(ISNUMBER(${amountReference}), ${amountReference}, 0)*${safePriceReference}`,
    // 平分价值
    null,
    // 错分检测
    `=IF(AND(ISNUMBER(${priceReference}), ISNUMBER(${amountReference})), ${amountReference}-G${rowIndex}-I${rowIndex}-K${rowIndex}-M${rowIndex}-O${rowIndex}-Q${rowIndex}-S${rowIndex}-U${rowIndex}-W${rowIndex}-Y${rowIndex}, 0)`,
    null,
    `=G${rowIndex}*${safePriceReference}`,
    null,
    `=I${rowIndex}*${safePriceReference}`,
    null,
    `=K${rowIndex}*${safePriceReference}`,
    null,
    `=M${rowIndex}*${safePriceReference}`,
    null,
    `=O${rowIndex}*${safePriceReference}`,
    null,
    `=Q${rowIndex}*${safePriceReference}`,
    null,
    `=S${rowIndex}*${safePriceReference}`,
    null,
    `=U${rowIndex}*${safePriceReference}`,
    null,
    `=W${rowIndex}*${safePriceReference}`,
    null,
    `=Y${rowIndex}*${safePriceReference}`,
  ];
}

export default setSpreadsheetValues;
