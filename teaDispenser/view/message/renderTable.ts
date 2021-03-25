import _ from 'lodash';
import tableColumnSeparator from '../../data/tableColumnSeparator';
import toDoubleByteCharacterText from './toDoubleByteCharacterText';

function renderTable(
  header: readonly string[],
  table: readonly (readonly string[])[],
  visibleColumnSeparator = false,
  visibleHeader = true
): string {
  const fullTable = [...(visibleHeader ? [header] : []), ...table];
  const outputTable: string[][] = new Array(table.length + 1).fill(null).map(() => []);
  for (let columnIndex = 0; columnIndex < header.length; columnIndex++) {
    let maxLength = 0;
    for (let rowIndex = 0; rowIndex < fullTable.length; rowIndex++) {
      maxLength = Math.max(getCell(fullTable, rowIndex, columnIndex).length, maxLength);
    }

    const numericColumn = header[columnIndex].search(/[买卖]价|价格|数量/) !== -1;
    for (let rowIndex = 0; rowIndex < fullTable.length; rowIndex++) {
      // Hack to shrink the header padding.
      const columnPaddingLength =
        visibleHeader && rowIndex === 0 ? Math.round(maxLength * 0.8) : maxLength;
      const cell = getCell(fullTable, rowIndex, columnIndex);
      const monospacedCell =
        numericColumn || columnIndex === header.length - 1 ? cell : toDoubleByteCharacterText(cell);
      const justifiedCell = numericColumn
        ? monospacedCell.padStart(columnPaddingLength, ' ')
        : monospacedCell.padEnd(columnPaddingLength, '　');
      outputTable[rowIndex].push(justifiedCell);
    }
  }

  if (visibleHeader) {
    const headerSeparator = '一'.repeat(_.sumBy(outputTable[0], (cell) => cell.length));
    outputTable.splice(1, 0, [headerSeparator]);
  }

  const columnSeparator = visibleColumnSeparator ? tableColumnSeparator : '　';
  const renderedTable = outputTable.map((row) => row.join(columnSeparator)).join('\n');
  return '```\n' + renderedTable + '```';
}

function getCell(
  table: readonly (readonly string[])[],
  rowIndex: number,
  columnIndex: number
): string {
  return table[rowIndex][columnIndex] || '';
}

export default renderTable;
