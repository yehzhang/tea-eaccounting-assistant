import locateItemStacks from './locateItemStacks';
import getTestDataPath from './testData/getTestDataPath';

describe('locateItemStacks', () => {
  it('locates items from mobile_eng_filtered_blueprints_1', async () => {
    const actual = await locateItemStacks(
      getTestDataPath('inventory/mobile_eng_filtered_blueprints_1.png')
    );
    expect(actual.length).toBe(8);
  });

  it('locates items from mobile_eng_filtered_blueprints_2', async () => {
    const actual = await locateItemStacks(
      getTestDataPath('inventory/mobile_eng_filtered_blueprints_2.png')
    );
    expect(actual.length).toBe(7);
  });

  it('locates items from simulator_chn_1', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/simulator_chn_1.png'));
    expect(actual.length).toBe(8);
  });

  it('locates items from ipad_eng_1', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/ipad_eng_1.png'));
    expect(actual.length).toBe(12);
  });

  it('locates items from tablet_chn_blueprints_1', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/tablet_chn_blueprints_1.jpg'));
    expect(actual.length).toBe(8);
  });

  it('locates items from iphone_chn_blueprints_2.PNG', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/iphone_chn_blueprints_2.PNG'));
    expect(actual.length).toBe(12);
  });

  it('locates items from unknown_chn_smoothened_1', async () => {
    const actual = await locateItemStacks(
      getTestDataPath('inventory/unknown_chn_smoothened_1.png'),
    );
    expect(actual.length).toBe(12);
  });

  it('locates nothing from unselected_1.png', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/unselected_1.png'));
    expect(actual.length).toBe(0);
  });

  it('locates nothing from unselected_2.png', async () => {
    const actual = await locateItemStacks(getTestDataPath('inventory/unselected_2.png'));
    expect(actual.length).toBe(0);
  });
});
