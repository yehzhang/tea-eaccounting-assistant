import _ from 'lodash';

function renderTable(header: readonly string[], table: readonly (readonly string[])[]): string {
  const fullTable = [header, ...table];
  const outputTable: string[][] = new Array(table.length + 1).fill(null).map(() => []);
  for (let columnIndex = 0; columnIndex < header.length; columnIndex++) {
    let maxLength = 0;
    for (let rowIndex = 0; rowIndex < fullTable.length; rowIndex++) {
      maxLength = Math.max(getCell(fullTable, rowIndex, columnIndex).length, maxLength);
    }

    const numericColumn = header[columnIndex].search(/[买卖]价|价格|数量/) !== -1;
    for (let rowIndex = 0; rowIndex < fullTable.length; rowIndex++) {
      // Hack to shrink the header padding.
      const columnPaddingLength = rowIndex === 0 ? Math.round(maxLength * 0.8) : maxLength;
      const cell = getCell(fullTable, rowIndex, columnIndex);
      const justifiedCell = numericColumn
        ? cell.padStart(columnPaddingLength, ' ')
        : toDoubleByteCharacterText(cell).padEnd(columnPaddingLength, '　');
      outputTable[rowIndex].push(justifiedCell);
    }
  }

  const headerSeparator = '一'.repeat(_.sumBy(outputTable[0], (cell) => cell.length));
  outputTable.splice(1, 0, [headerSeparator]);

  const renderedTable = outputTable.map((row) => row.join('　')).join('\n');
  return '```' + renderedTable + '```';
}

function getCell(
  table: readonly (readonly string[])[],
  rowIndex: number,
  columnIndex: number
): string {
  return table[rowIndex][columnIndex] || '';
}

function toDoubleByteCharacterText(text: string): string {
  return [...text]
    .map((character) => String.fromCharCode(toDoubleByteCharacterCode(character.charCodeAt(0))))
    .join('');
}

function toDoubleByteCharacterCode(charCode: number): number {
  if (charCode === 32) {
    return 12288;
  }
  if (charCode < 127) {
    return charCode + 65248;
  }
  return charCode;
}

export default renderTable;
