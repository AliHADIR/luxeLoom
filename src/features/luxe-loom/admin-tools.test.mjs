import test from 'node:test';
import assert from 'node:assert/strict';
import { csvCell, inventoryCsv } from './admin-tools.ts';

test('CSV preserves commas, quotes and line breaks', () => {
  assert.equal(csvCell('Rose, "Noir"\n50 ml'), '"Rose, ""Noir""\n50 ml"');
  assert.equal(csvCell(undefined), '""');
});
test('CSV prevents user-supplied spreadsheet formulas', () => {
  for (const value of ['=1+1', '+SUM(A1)', '-1+2', '@SUM(A1)', '  =1+1']) {
    assert.equal(csvCell(value), `"'${value}"`);
  }
  assert.equal(csvCell('Oud Noir'), '"Oud Noir"');
});
test('Export uses only supplied products and calculates stock value', () => {
  const csv = inventoryCsv([{ id: '1', name: 'Oud Noir', price: 185, stock: 3, category: 'Perfume', image: '', description: '', details: { volume: '50 ml' } }]);
  assert.equal(csv.split('\r\n').length, 2);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"185","3","555"'));
  assert.ok(csv.includes('"50 ml"'));
  assert.equal(inventoryCsv([]).split('\r\n').length, 1);
});
