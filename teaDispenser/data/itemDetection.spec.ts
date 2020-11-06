import { join } from 'path';
import { recognizeItems, setupTesseract } from './itemDetection';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe('itemDetection', () => {
  beforeAll(() => {
    setupTesseract();
  });

  it(`recognizes items from ships_iphone_chn_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('ships_iphone_chn_1.png'));
    expect(output).toEqual([
      { name: '秃鹫级', amount: '1' },
      { name: '茶隼级', amount: '1' },
      { name: '伊毕斯号', amount: '1' },
      { name: '探索级隐匿型', amount: '1' },
      { name: '富豪级隐匿型', amount: '1' },
      { name: '伊米卡斯级', amount: '1' },
      { name: '弦月级原型', amount: '1' },
      { name: '残月级原型', amount: '1' },
      { name: '狐鼬级', amount: '1' },
      { name: '茅斯卡特 小型来复磁', amount: '2' },
      { name: '火石 中型来复磁轨炮', amount: '4' },
      { name: '恶徒 中型短管磁轨炮', amount: '2' },
    ]);
  });

  it(`recognizes items from deadspace_tablet_chn_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('deadspace_tablet_chn_1.png'));
    expect(output).toEqual([
      { name: '科必伊C 小型远程装…', amount: '1' },
      { name: '科波姆C 反应式装甲…', amount: '1' },
      { name: '科必伊C 小型装甲维…', amount: '1' },
      { name: '科波斯C 大型装甲维…', amount: '1' },
      { name: '科波斯C 大型远程装…', amount: '1' },
      { name: '科波斯C 大型集束激…', amount: '1' },
      { name: '科波姆C 中型装甲维…', amount: '2' },
      { name: '科波姆C 中型远程装…', amount: '2' },
      { name: '科必伊C 小型集束激…', amount: '2' },
      { name: '血袭者受损结构', amount: '3' },
      { name: '科必伊C 小型脉冲激…', amount: '3' },
      { name: '科波姆C 中型脉冲激…', amount: '8' },
    ]);
  });

  it(`recognizes items from deadspace_mobile_chn_2.jpeg`, async () => {
    const output = await recognizeItems(getTestDataPath('deadspace_mobile_chn_2.jpeg'));
    expect(output).toEqual([
      { name: 'MK7大型集束激光炮', amount: '3' },
      { name: '科波斯C 大型集束激…', amount: '3' },
      { name: 'MK7 中型脉冲激光炮', amount: '2' },
      { name: '科波姆C 中型脉冲激…', amount: '3' },
      { name: 'MK7 中型掠能器', amount: '1' },
      { name: '科波姆C 中型远程装…', amount: '1' },
      { name: 'MK7 无人机导航电脑', amount: '1' },
      { name: 'MK7 全方位索敌连接', amount: '1' },
      { name: 'MK7 损伤控制', amount: '1' },
      { name: '科波姆C 中型装甲维…', amount: '1' },
      { name: '艾玛B级受损结构', amount: '8' },
    ]);
  });

  it(`recognizes items from cutoff_iphone_chn_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('cutoff_iphone_chn_1.png'));
    expect(output).toEqual([
      { name: '商人 小型跃迁推进器', amount: '1' },
      { name: 'MK5 中型跃迁推进器', amount: '1' },
      { name: '圣光 跃迁核心稳定器', amount: '2' },
      { name: '基础型 惯性稳定器', amount: '1' },
      { name: 'MK7 胡蜂', amount: '6' },
      { name: '数据核心 一 激光物理', amount: '26' },
      { name: '舰载扫描与跃迁指南', amount: '1' },
      { name: '空间航行技术理论', amount: '1' },
    ]);
  });

  it(`recognizes items from stuff_iphone_eng_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('stuff_iphone_eng_1.png'));
    expect(output).toEqual([
      { name: 'MK7 Medium Torpedo...', amount: '2' },
      { name: 'MK7 Small Energy...', amount: '1' },
      { name: 'MK7 Medium Energy...', amount: '1' },
      { name: 'MK5 Covert Ops Cloakin...', amount: '1' },
      { name: `'DeaIer' Small...`, amount: '1' },
      { name: 'MK5 Medium...', amount: '1' },
      { name: `'Aura' Warp Core...`, amount: '2' },
      { name: 'Basic Inertial Stabilizer', amount: '1' },
      { name: 'MK7 Wasp', amount: '6' },
      { name: 'Datacore - Laser...', amount: '26' },
      { name: 'Shipboard Scanning and', amount: '1' },
      { name: 'Interstellar Navigation...', amount: '1' },
    ]);
  });

  it(`recognizes items from ships_iphone_eng_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('ships_iphone_eng_1.png'));
    expect(output).toEqual([
      { name: 'Condor', amount: '1' },
      { name: 'Kestrel', amount: '1' },
      { name: 'Ibis', amount: '1' },
      { name: 'Probe Covert Ops', amount: '1' },
      { name: 'Magnate Covert Ops', amount: '1' },
      { name: 'Imicus', amount: '1' },
      { name: 'Xian-Yue Prototype', amount: '1' },
      { name: 'Can-Yue Prototype', amount: '1' },
      { name: 'Tayra', amount: '1' },
      { name: `'Musket' Small Rifled...`, amount: '2' },
      { name: `'FIintIock' Medium Rifle`, amount: '4' },
      { name: `'HustIer' Medium...`, amount: '2' },
    ]);
  });

  it(`recognizes items from artifacts_ipad_eng_1.png`, async () => {
    const output = await recognizeItems(getTestDataPath('artifacts_ipad_eng_1.png'));
    expect(output).toEqual([
      { name: 'Slasher II', amount: '1' },
      { name: 'Imicus', amount: '1' },
      { name: 'Warhead Calefaction...', amount: '1' },
      { name: 'MK7 Warden', amount: '2' },
      { name: 'Lv. 3 Pilot Medal', amount: '1' },
      { name: 'Ancient Remains', amount: '21' },
      { name: 'New Eden Source', amount: '1' },
      { name: 'Ancient Treasure Map', amount: '1' },
      { name: 'Vial of Mikramurka', amount: '1' },
      { name: 'Magic Crystal Ball', amount: '1' },
      { name: 'Dice of Jade', amount: '1' },
      { name: 'Ancient Painblade', amount: '1' },
      { name: `Kri'tak Knife`, amount: '1' },
      { name: 'Raata Wind Chimes', amount: '1' },
      { name: 'Nursery Rhyme', amount: '1' },
      { name: 'Onyx Heart of Valor', amount: '1' },
    ]);
  });

  xit(`recognizes items from blueprints_mobile_chn.png`, async () => {
    const output = await recognizeItems(getTestDataPath('blueprints_mobile_chn.png'));
    console.log(output);
    expect(output).toEqual([
      // TODO Fix this.
      { name: '虹袭者受损结构', amount: '0' },
      { name: '激光炮范围扩大设备…', amount: '1' },
      { name: '激光炮发散调节装薹…', amount: '2' },
      { name: '冷凝能量管理单元蓝…', amount: '1' },
      { name: '纳米机器人加逮器蓝…', amount: '3' },
      { name: '维修增效器蓝图 IV', amount: '1' },
      { name: '三角装甲聚合器蓝图I', amount: '3' },
      { name: '三角装甲聚合器蓝图 II', amount: '5' },
    ]);
  });

  xit(`recognizes items from rigs_mobile_chn.png`, async () => {
    const output = await recognizeItems(getTestDataPath('rigs_mobile_chn.png'));
    // TODO fix this.
    expect(output).toEqual([
      { name: '反动能聚合器I', amount: '4' },
      { name: '半导体记忆电池II', amount: '2' },
      { name: '半导体记忆电池 II', amount: '1' },
      { name: '电容器控制电路 II', amount: '1' },
      { name: '辅助能蠹路由器 II', amount: '2' },
    ]);
  });
});

function getTestDataPath(filename: string): string {
  return join(__dirname, 'testData', filename);
}
