import _ from 'lodash';
import getAuthClient from './getAuthClient';

async function updateSpreadsheetValues(spreadsheetId: string, items: readonly ItemRowData[]): Promise<boolean> {
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

function getSheetValues(items: readonly ItemRowData[]): readonly (readonly (string | null)[])[] {
  return [
    [null, '价格（万）', '数量', '总价', '平分价值', '错分检测', '店员1', '分得价值', '店员2', '分得价值', '店员3', '分得价值', '店员4', '分得价值', '店员5', '分得价值', '店员6', '分得价值', '店员7', '分得价值', '店员8', '分得价值', '店员9', '分得价值', '店员10', '分得价值', null, '参与人数'],
    ['赃物↓    总价→', null, null, '=SUM(D3:D52)', '=IF(AB2=0, "", FLOOR(D2/AB2))', null, null, '=SUM(H3:H52)', null, '=SUM(J3:J52)', null, '=SUM(L3:L52)', null, '=SUM(N3:N52)', null, '=SUM(P3:P52)', null, '=SUM(R3:R52)', null, '=SUM(T3:T52)', null, '=SUM(V3:V52)', null, '=SUM(X3:X52)', null, '=SUM(Z3:Z52)', null, '=OR(G1<>"店员1",H2<>0) + OR(I1<>"店员2",J2<>0) + OR(K1<>"店员3",L2<>0) + OR(M1<>"店员4",N2<>0) + OR(O1<>"店员5",P2<>0) + OR(Q1<>"店员6",R2<>0) + OR(S1<>"店员7",T2<>0) + OR(U1<>"店员8",V2<>0) + OR(W1<>"店员9",X2<>0) + OR(Y1<>"店员10",Z2<>0)'],
    ...items.map(({ name, amount, price }, index) => getItemRow(name,
        price ? formatPriceNumber(price) : ' ', amount || ' ', index + 3)),
    // Leave some redundancy below item rows.
    ...new Array(Math.max(50 - items.length, 0)).fill(null)
        .map((ignored, index) => getItemRow(null, null, null, index + 3 + items.length)),
  ];
}

function formatPriceNumber(price: number): string {
  const priceInTenThousands = price / 10000;
  return _.round(priceInTenThousands, priceInTenThousands < 10 ? 4 : 0).toString();
}

function getItemRow(name: string | null, price: string | null, amount: string | null, rowIndex: number): readonly (string | null)[] {
  const priceReference = `B${rowIndex}`;
  const safePriceReference = `IF(ISNUMBER(${priceReference}), ${priceReference}, 0)`;
  const amountReference = `C${rowIndex}`;
  return [
    name, price, amount,
    // 总价
    `=IF(ISNUMBER(${amountReference}), ${amountReference}, 0)*${safePriceReference}`,
    // 平分价值
    null,
    // 错分检测
    `=IF(ISNUMBER(${amountReference}), ${amountReference}-G${rowIndex}-I${rowIndex}-K${rowIndex}-M${rowIndex}-O${rowIndex}-Q${rowIndex}-S${rowIndex}-U${rowIndex}-W${rowIndex}-Y${rowIndex}, 0)`,
    null, `=G${rowIndex}*${safePriceReference}`,
    null, `=I${rowIndex}*${safePriceReference}`,
    null, `=K${rowIndex}*${safePriceReference}`,
    null, `=M${rowIndex}*${safePriceReference}`,
    null, `=O${rowIndex}*${safePriceReference}`,
    null, `=Q${rowIndex}*${safePriceReference}`,
    null, `=S${rowIndex}*${safePriceReference}`,
    null, `=U${rowIndex}*${safePriceReference}`,
    null, `=W${rowIndex}*${safePriceReference}`,
    null, `=Y${rowIndex}*${safePriceReference}`,
  ]
}

interface ItemRowData {
  readonly name: string;
  readonly amount: string;
  readonly price: number | null;
}

export default updateSpreadsheetValues;
