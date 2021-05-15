import _ from 'lodash';
import RecognizedItem from '../../../data/RecognizedItem';
import { TesseractContext } from '../../../external/ExternalContext';
import startTesseract from '../../../external/startTesseract';
import getSemanticIdentifier from '../fuzzySearch/getSemanticIdentifier';
import recognizeItems from './recognizeItems';
import getTestDataPath from './testData/getTestDataPath';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe('recognizeItems', () => {
  let schedulers: TesseractContext;

  beforeAll(async () => {
    schedulers = await startTesseract();
  });

  beforeEach(() => {
    jasmine.addCustomEqualityTester(semanticTester);
  });

  async function run(filename: string): Promise<readonly RecognizedItem[]> {
    const promises = await recognizeItems(getTestDataPath(filename), schedulers);
    const recognizedItems = await Promise.all(promises);
    return _.compact(recognizedItems);
  }

  it('recognizes items from eng_missiles_1', async () => {
    const actual = await run('inventory/eng_missiles_1.png');
    expectEqual(actual, [
      { name: 'MK7 Small Pulse Laser', amount: 3 },
      { name: 'Imperial Navy Small...', amount: 1 },
      { name: 'Imperial Navy Medium', amount: 3 },
      { name: 'Gistii C-Type Small Strik', amount: 3 },
      { name: 'MK5 Miner', amount: 1 },
      { name: 'MK7 Strip Miner', amount: 1 },
      { name: 'MKS Small Missile...', amount: 1 },
      { name: "'ChaIIenger' Medium...", amount: 23 },
      { name: "'ChaIIenger' Medium", amount: 1 },
      { name: "'ChaIIenger' Medium...", amount: 1 },
      { name: "'ChaIIenger' Medium...", amount: 1 },
      { name: 'Caldari Navy Medium...', amount: 5 },
    ]);
  });

  it('recognizes items from chn_storyline_1', async () => {
    const actual = await run('inventory/chn_storyline_1.png');
    expectEqual(actual, [
      { name: '残月级原型', amount: 1 },
      { name: '火石 中型来薹磁轨炮', amount: 4 },
      { name: '商人 小型短簪磁轨炮', amount: 1 },
      { name: '恶徒 中型短管磁轨炮', amount: 1 },
      { name: '联邦海军 中型短管磁...', amount: 1 },
      { name: '绞架 小型导弹发射器', amount: 1 },
      { name: '挑战者 中型导弹发射...', amount: 3 },
      { name: '绞架 大型巡肮导弹发...', amount: 2 },
    ]);
  });

  it('recognizes nothing from unselected items', async () => {
    const actual = await run('inventory/eng_unselected_1.png');
    expectEqual(actual, []);
  });

  it('recognizes items from eng_filtered_2', async () => {
    const actual = await run('inventory/eng_filtered_2.png');
    expectEqual(actual, [
      { name: 'Anti-Explosive Pump I...', amount: 5 },
      { name: 'Anti-Explosive Pump II', amount: 2 },
      { name: 'Anti-EM Pump I...', amount: 3 },
      { name: 'Anti-Thermal Pump I...', amount: 1 },
      { name: 'Gravity Capacitor...', amount: 1 },
      { name: 'Miner Efficiency...', amount: 3 },
      { name: 'Miner Range Controller II...', amount: 2 },
    ]);
  });

  it('recognizes items from eng_filtered_1', async () => {
    const actual = await run('inventory/eng_filtered_1.png');
    expectEqual(actual, [
      { name: 'MK5 Small Group Shield', amount: 1 },
      { name: 'MK7 Small Group...', amount: 1 },
      { name: 'MK5 Medium Group...', amount: 1 },
      { name: 'Railgun Discharge...', amount: 3 },
      { name: 'Laser Ambit Extension I', amount: 2 },
      { name: 'Laser Burst Aerator I...', amount: 3 },
      { name: 'Algid Energy...', amount: 1 },
      { name: 'Warhead Rigor Catalyst I...', amount: 2 },
    ]);
  });

  it('recognizes items from chn_armors_4', async () => {
    const actual = await run('inventory/chn_armors_4.png');
    expectEqual(actual, [
      { name: 'MK7 反应式装甲 增强...', amount: 4 },
      { name: 'MK9 反应式装甲增强...', amount: 1 },
      { name: '城壕 反应式装甲增强...', amount: 1 },
      { name: '城壕 反应式装甲增强...', amount: 3 },
      { name: '帝国海军 反应式装甲...', amount: 15 },
      { name: '联邦海军 反应式装甲...', amount: 7 },
      { name: '联邦海军 反应式装甲...', amount: 1 },
      { name: '璀璨 反应式装甲 增强...', amount: 4 },
      { name: '克尔兽姆C 反应式装...', amount: 1 },
      { name: 'MK3 反应式护盾力场', amount: 1 },
      { name: 'MK5 反应式护盾力场', amount: 11 },
      { name: 'MK5 反应式护盾力场', amount: 3 },
    ]);
  });

  it('recognizes items from chn_armors_3', async () => {
    const actual = await run('inventory/chn_armors_3.png');
    expectEqual(actual, [
      { name: 'MK7 400mm钢附 甲板', amount: 2 },
      { name: '堡垒 400mm钢附 甲板', amount: 86 },
      { name: '帝国海军 400mm钢附...', amount: 9 },
      { name: '帝国海军 400mm钢附...', amount: 2 },
      { name: '联邦海军 400mm钢附...', amount: 2 },
      { name: 'MK5 BOOmm钢附 甲板', amount: 10 },
      { name: 'MK7 BOOmm钢附 甲板', amount: 2 },
      { name: '堡垒 BOOmm钢附甲板', amount: 49 },
      { name: '堡垒 BOOmm钢附 甲板', amount: 1 },
      { name: '帝 国 海 军 BOOmm钢附...', amount: 10 },
      { name: '联邦海军 B00mm钢附...', amount: 3 },
      { name: '壁垒 1600mm钢附 甲板', amount: 2 },
    ]);
  });

  it('recognizes items from chn_armors_2', async () => {
    const actual = await run('inventory/chn_armors_2.png');
    expectEqual(actual, [
      { name: '铁网 100mm钢附甲木反', amount: 22 },
      { name: '帝国海军 100mm钢附...', amount: 3 },
      { name: '联邦海军 100mm钢附...', amount: 3 },
      { name: '要塞 100mm钢附 甲板', amount: 1 },
      { name: 'MK3 200mm钢 附 甲板', amount: 7 },
      { name: 'MK5 200mm钢附 甲板', amount: 10 },
      { name: 'MK7 200mm钢附 甲板', amount: 1 },
      { name: '铁网 200mm钢附 甲板', amount: 7 },
      { name: '联邦海军 200mm钢附', amount: 2 },
      { name: '要塞 200mm钢附 甲板', amount: 2 },
      { name: 'MK5 400mm钢附 甲板', amount: 9 },
      { name: 'MK7 400mm钢附 甲板', amount: 6 },
    ]);
  });

  it('recognizes items from chn_armors_1', async () => {
    const actual = await run('inventory/chn_armors_1.png');
    expectEqual(actual, [
      { name: '偷窃 自适应装甲 增强...', amount: 19 },
      { name: '偷窃 自适应装甲增强...', amount: 1 },
      { name: '帝国海军 自适应装甲...', amount: 14 },
      { name: '联邦海军 自适应装甲...', amount: 1 },
      { name: '联邦海军 自适应装甲...', amount: 1 },
      { name: '联邦海军 自适应装甲...', amount: 1 },
      { name: '璀璨 自 适应装 甲 增强...', amount: 2 },
      { name: '科波斯C 自 适应装 甲...', amount: 9 },
      { name: 'MK1 100mm钢附 甲板', amount: 1 },
      { name: 'MK3 100mm钢附 甲板', amount: 5 },
      { name: 'MK5 100mm钢附 甲板', amount: 18 },
      { name: 'MK7 100mm钢附 甲板', amount: 1 },
    ]);
  });

  it('recognizes items from chn_reps_2', async () => {
    const actual = await run('inventory/chn_reps_2.png');
    expectEqual(actual, [
      { name: '科波斯C 大型装甲维...', amount: 9 },
      { name: '科尔C 大型装甲维修器', amount: 1 },
      { name: 'MK1 散热槽', amount: 1 },
      { name: 'MK3 散热槽', amount: 3 },
      { name: 'MK5 散热槽', amount: 5 },
      { name: 'MK5 散热槽', amount: 1 },
      { name: 'MK7 散热槽', amount: 3 },
      { name: '基础型 散热槽', amount: 8 },
      { name: '帝国海军 散热槽', amount: 5 },
      { name: '帝国海军 散热槽', amount: 1 },
      { name: '科波姆C 散热槽', amount: 8 },
      { name: 'MK1磁性力场稳定器', amount: 2 },
    ]);
  });

  it('recognizes items from chn_reps_1', async () => {
    const actual = await run('inventory/chn_reps_1.png');
    expectEqual(actual, [
      { name: '甲胃 小型装甲维修器', amount: 1 },
      { name: '帝国海军 小型装甲维...', amount: 3 },
      { name: '联邦海军 小型装甲维...', amount: 1 },
      { name: '骑士 小型装甲维修器', amount: 1 },
      { name: '科必伊C 小型装甲维...', amount: 1 },
      { name: 'MK5 中型装甲维修器', amount: 121 },
      { name: 'MK7 中型装甲维修器', amount: 8 },
      { name: 'MK7 中型装甲维修器', amount: 6 },
      { name: 'MK9 中型装甲维修器', amount: 2 },
      { name: '甲胃 中型装甲维修器', amount: 108 },
      { name: '帝国海军 中型装甲维...', amount: 10 },
      { name: '联邦海军 中型装甲维...', amount: 5 },
    ]);
  });

  it('recognizes items from chn_drones_1', async () => {
    const actual = await run('inventory/chn_drones_1.png');
    expectEqual(actual, [
      { name: 'MK7 无人机导航电脑', amount: 6 },
      { name: 'MK7 无人机导航电脑', amount: 2 },
      { name: 'MK9 无人机导航电脑', amount: 1 },
      { name: '破解者 无人机导航电...', amount: 39 },
      { name: '联邦海军 无f几导航', amount: 4 },
      { name: 'MK5 全方位索敌连接', amount: 44 },
      { name: 'MK7全方位索敌连接', amount: 5 },
      { name: 'MK9 全方位索敌连接', amount: 7 },
      { name: '破解者 全方位索敌连...', amount: 32 },
      { name: '帝国海军 全方位索敌...', amount: 8 },
      { name: '联邦海军 全方位索敌...', amount: 1 },
      { name: '联邦海军 全方位索敌...', amount: 1 },
    ]);
  });

  it('recognizes items from chn_remotes_2', async () => {
    const actual = await run('inventory/chn_remotes_2.png');
    expectEqual(actual, [
      { name: '帝国海军 小型远程装...', amount: 4 },
      { name: '宁静 小型远程装甲维...', amount: 1 },
      { name: 'MK5 中型远程装甲维...', amount: 7 },
      { name: 'MK5 中型远程装甲维...', amount: 7 },
      { name: 'MK7 中型远程装甲维...', amount: 1 },
      { name: '比特尼克 中型远程装...', amount: 29 },
      { name: '帝国海军 中型远程装...', amount: 8 },
      { name: '科波姆C 中型远程装...', amount: 15 },
      { name: 'MK9 大型远程装甲维...', amount: 1 },
      { name: '科波斯C 大型远程装', amount: 14 },
      { name: 'MK5 隐形装置', amount: 9 },
      { name: 'MK7隐形装置', amount: 9 },
    ]);
  });

  it('recognizes items from chn_remotes_1', async () => {
    const actual = await run('inventory/chn_remotes_1.png');
    expectEqual(actual, [
      { name: 'MK7 中型远程电容传...', amount: 1 },
      { name: '随从 中型远程电容传...', amount: 1 },
      { name: '随从 中型远程电容传...', amount: 4 },
      { name: '帝国海军 中型远程电...', amount: 17 },
      { name: '随从 大型远程电容传...', amount: 2 },
      { name: '帝国海军 大型远程电...', amount: 5 },
      { name: 'MK5小型远程护盾回...', amount: 3 },
      { name: '微型 小型远程护盾回...', amount: 3 },
      { name: 'MK3 小型远程装甲维...', amount: 5 },
      { name: 'MK5 小型远程装甲维...', amount: 13 },
      { name: 'MK7 小型远程装甲维...', amount: 2 },
      { name: '比特尼克 小型远程装...', amount: 5 },
    ]);
  });

  it('recognizes items from chn_neuts_1', async () => {
    const actual = await run('inventory/chn_neuts_1.png');
    expectEqual(actual, [
      { name: '城壕 小型能呈中和器', amount: 1 },
      { name: 'MK5 中型能呈中和器', amount: 3 },
      { name: '蒺藜 中型能皇中和器', amount: 87 },
      { name: '帝国海军 中型能呈中...', amount: 15 },
      { name: '蒺藜 大型能呈中和器', amount: 1 },
      { name: '帝国海军 大型能呈中...', amount: 1 },
      // TODO MK3 incorrectly recognized as MK9
      { name: 'MK3 小型远程电容传...', amount: 8 },
      { name: 'MK5 小型远程电容传...', amount: 11 },
      { name: '随从 小型远程电容传...', amount: 41 },
      { name: '帝国海军 小型远程电...', amount: 2 },
      { name: '骑士 小型远程电容传...', amount: 2 },
      { name: 'MK5 中型远程电容传...', amount: 9 },
    ]);
  });

  it('recognizes items from chn_nos_1', async () => {
    const actual = await run('inventory/chn_nos_1.png');
    expectEqual(actual, [
      { name: 'MK5 小型掠能器', amount: 30 },
      { name: 'MK5 小型掠能器', amount: 6 },
      { name: '吸血鬼 小型掠能器', amount: 29 },
      { name: '帝国海军 小型掠能器', amount: 7 },
      { name: '帝国海军 小型掠能器', amount: 1 },
      { name: '食灵者 小型掠能器', amount: 1 },
      { name: 'MK5 中型掠能器', amount: 3 },
      { name: '吸血鬼 中型掠能器', amount: 109 },
      { name: '帝国海军 中型掠能器', amount: 16 },
      { name: 'MK5小型能呈中和器', amount: 7 },
      { name: '蒺藜 小型能童中和器', amount: 106 },
      { name: '帝国海军 小型能呈中...', amount: 3 },
    ]);
  });

  it('recognizes items from chn_lasers_4', async () => {
    const actual = await run('inventory/chn_lasers_4.png');
    expectEqual(actual, [
      { name: '科波斯C 大型脉冲激...', amount: 57 },
      { name: 'MK5 小型自动加农炮', amount: 1 },
      { name: '共和舰队 小型自动加...', amount: 6 },
      { name: '共和舰队 中型自动加...', amount: 3 },
      { name: '吉斯塔姆C 中型自动...', amount: 6 },
      { name: '长者 大型自动加农炮', amount: 7 },
      { name: '摇摆 小型强袭加农炮', amount: 2 },
      { name: '共和舰队 小型强袭加...', amount: 2 },
      { name: '罪犯 小型强袭加农炮', amount: 1 },
      { name: 'MK5 中型强袭加农炮', amount: 112 },
      { name: 'MK5 中型强袭加农炮', amount: 1 },
      { name: 'MK5 中型强袭加农炮', amount: 1 },
    ]);
  });

  it('recognizes items from chn_lasers_3', async () => {
    const actual = await run('inventory/chn_lasers_3.png');
    expectEqual(actual, [
      { name: 'MK7 中型脉冲激光炮', amount: 15 },
      { name: 'MK7 中型脉冲激光炮', amount: 1 },
      { name: 'MK7 中型脉冲激光炮', amount: 6 },
      { name: '马枪 中型脉冲激光炮', amount: 468 },
      { name: '马枪 中型脉冲激光炮', amount: 1 },
      { name: '马枪 中型脉冲激光炮', amount: 1 },
      { name: '帝国海军 中型脉冲激...', amount: 94 },
      { name: '帝国海军 中型脉冲激...', amount: 1 },
      { name: '科波姆C 中型脉冲激...', amount: 56 },
      { name: 'MK7 大型脉冲激光炮', amount: 2 },
      { name: '战戟 大型脉冲激光炮', amount: 15 },
      { name: '帝国海军 大型脉冲激...', amount: 11 },
    ]);
  });

  it('recognizes items from chn_lasers_2', async () => {
    const actual = await run('inventory/chn_lasers_2.png');
    expectEqual(actual, [
      { name: '帝国海军 中型集束激...', amount: 66 },
      { name: '仪式 中型集束激光炮', amount: 1 },
      { name: '科波姆C 中型集束激...', amount: 17 },
      { name: '投石车 大型集束激光...', amount: 3 },
      { name: '帝国海军 大型集束激...', amount: 10 },
      { name: '科波斯C 大型集束激...', amount: 42 },
      { name: 'MK1小型脉冲激光炮', amount: 8 },
      { name: 'MK3 小型脉冲激光炮', amount: 15 },
      { name: 'MK5 小型脉冲激光炮', amount: 21 },
      { name: 'MK5 小型脉冲激光炮', amount: 3 },
      { name: 'MK7 小型脉冲激光炮', amount: 3 },
      { name: '长弓 小型脉冲激光炮', amount: 683 },
    ]);
  });

  it('recognizes items from chn_lasers_1', async () => {
    const actual = await run('inventory/chn_lasers_1.png');
    expectEqual(actual, [
      { name: 'MK7 大型短管磁轨炮', amount: 1 },
      { name: '骗子 大型短管磁轨炮', amount: 2 },
      { name: 'MK3 小型集束激光炮', amount: 2 },
      { name: 'MK7小型集束激光炮', amount: 2 },
      { name: 'MK7 小型集束激光炮', amount: 3 },
      { name: '权杖 小型集束激光炮', amount: 133 },
      { name: '帝国海军 小型集束激...', amount: 10 },
      { name: '叛军 小型集束激光炮', amount: 3 },
      { name: '科必伊C 小型集束激...', amount: 5 },
      { name: 'MK5 中型集束激光炮', amount: 1 },
      { name: 'MK7 中型集束激光炮', amount: 9 },
      { name: '石弓 中型集束激光炮', amount: 195 },
    ]);
  });

  it('recognized items from chn_blueprints_1', async () => {
    const actual = await run('inventory/chn_blueprints_1.png');
    expectEqual(actual, [
      { name: 'MK7 隐秘行动装置蓝...', amount: 1 },
      { name: 'MK5 小型群体护盾回...', amount: 1 },
      { name: 'MK7 小型群体电容传...', amount: 1 },
      { name: 'MK5 中型群体电容传...', amount: 1 },
      { name: '磁轨炮节能设备蓝图I', amount: 3 },
      { name: '激光炮范围扩大设备...', amount: 2 },
      { name: '激光炮发散调节装置...', amount: 3 },
      { name: '冷凝能皇管理单元蓝...', amount: 1 },
      { name: '弹头强化辅助系统蓝...', amount: 2 },
      { name: '液压舱推进器蓝图I', amount: 1 },
      { name: '核心防御节能装置蓝...', amount: 1 },
      { name: '纳米机器人加速器蓝...', amount: 2 },
    ]);
  });

  it('recognized items from chn_blueprints_2', async () => {
    const actual = await run('inventory/chn_blueprints_2.png');
    expectEqual(actual, [
      { name: '维修增效器蓝图 II', amount: 1 },
      { name: '反爆破聚合器蓝图I', amount: 5 },
      { name: '反爆破聚合器蓝图 II', amount: 2 },
      { name: '反电磁聚合器蓝图I', amount: 3 },
      { name: '反动能聚合器蓝图I', amount: 9 },
      { name: '反热能聚合器蓝图I', amount: 1 },
      { name: '引力电容器升级蓝图I', amount: 1 },
      { name: '采矿器能效提升器蓝...', amount: 3 },
      { name: '采矿器距离控制器蓝...', amount: 2 },
      { name: '采矿器冷凝调节器蓝...', amount: 2 },
      { name: '采矿器冷凝调节器蓝...', amount: 2 },
      { name: '无人机火力增幅装置...', amount: 3 },
    ]);
  });

  it('recognized items from chn_blueprints_3', async () => {
    const actual = await run('inventory/chn_blueprints_3.png');
    expectEqual(actual, [
      { name: '无人机射程扩展装置...', amount: 3 },
      { name: '无人机射程扩展装置...', amount: 2 },
      { name: '无人机射速加强装置...', amount: 3 },
      { name: 'MK3 侍僧蓝图', amount: 16 },
      { name: 'MK5 侍僧蓝图', amount: 5 },
      { name: 'MK7侍僧蓝图', amount: 5 },
      { name: 'MK3 大黄蜂蓝图', amount: 1 },
      { name: 'MK5 渗透者蓝图', amount: 5 },
      { name: 'MK5 战锤蓝图', amount: 5 },
      { name: 'MK7 战锤蓝图', amount: 3 },
      { name: 'MK7 蛮妖蓝图', amount: 4 },
    ]);
  });

  it('recognized items from chn_blueprints_7', async () => {
    const actual = await run('inventory/chn_blueprints_7.png');
    expectEqual(actual, [
      { name: '激光炮范围扩大设备蓝...', amount: 1 },
      { name: '激光炮发散调节装置蓝...', amount: 2 },
      { name: '维修增效器蓝图 II', amount: 5 },
      { name: '三角装甲聚合器蓝图 I', amount: 1 },
      { name: '反热能聚合器蓝图 II', amount: 3 },
      { name: '半导体记忆 电池蓝图 I', amount: 3 },
      { name: '辅助能皇路由器蓝图I', amount: 1 },
      { name: '锁定系统辅助控制器蓝...', amount: 2 },
      { name: '无人机火力增幅装置蓝', amount: 1 },
      { name: '无人机射程扩展装置蓝...', amount: 2 },
      { name: '无人机射速加强装置蓝...', amount: 1 },
      { name: '无人机射速加强装置蓝...', amount: 1 },
    ]);
  });

  it('recognized items from chn_datacores_1', async () => {
    const actual = await run('inventory/chn_datacores_1.png');
    expect(actual).toEqual([
      jasmine.objectContaining({ name: 'MK7瓦尔基里', amount: 2 }),
      jasmine.objectContaining({ name: 'MK7 狂战士', amount: 2 }),
      jasmine.objectContaining({ name: '数据核心 一 艾玛星舰...', amount: 591 }),
      jasmine.objectContaining({ name: '数据核心 一 电磁物理', amount: 370 }),
      jasmine.objectContaining({ name: '数据核心 一 盖伦特星', amount: 59 }),
      jasmine.objectContaining({ name: '数据核心 一 高能物理', amount: 303 }),
      jasmine.objectContaining({ name: '数据核心 一 火箭科学', amount: 347 }),
      jasmine.objectContaining({ name: '数据核心 一 机械工程', amount: 333 }),
      jasmine.objectContaining({ name: '数据核心 一 激光物理', amount: 235 }),
      jasmine.objectContaining({ name: '数据核心 一 加达里星...', amount: 2 }),
      jasmine.objectContaining({ name: '金属碎片', amount: 169 }),
      jasmine.anything(),
    ]);
  });

  it('recognized items from chn_debris_1', async () => {
    const actual = await run('inventory/chn_debris_1.png');
    expectEqual(actual, [
      { name: '等离子体团', amount: 800 },
      { name: '艾玛4级受损结构', amount: 91 },
      { name: '艾玛5级受损结构', amount: 110 },
      { name: '艾玛6级受损结构', amount: 410 },
      { name: '艾玛7级受损结构', amount: 476 },
      { name: '艾玛7级受损结构', amount: 1 },
      { name: '艾玛B级受损结构', amount: 105 },
      { name: '艾玛9级受损结构', amount: 540 },
      { name: '艾玛10级受损结构', amount: 65 },
      { name: '加达里4级受损结构', amount: 13 },
      { name: '加达里5级受损结构', amount: 38 },
      { name: '加达里6级受损结构', amount: 141 },
    ]);
  });

  it('recognized items from chn_smoothened_1', async () => {
    const actual = await run('inventory/chn_smoothened_1.png');
    expectEqual(actual, [
      { name: '冷凝能量管理单元蓝...', amount: 2 },
      { name: '纳米机器人加速器蓝...', amount: 2 },
      { name: '辅助纳米聚合器蓝图 L', amount: 1 },
      { name: '反爆破聚合器蓝图 I', amount: 1 },
      { name: '反动能聚合器蓝图 III', amount: 1 },
      { name: '反热能聚合器蓝图 II', amount: 1 },
      { name: '反热能聚合器蓝图 III', amount: 3 },
      { name: '半导体记忆电池蓝图 I...', amount: 1 },
      { name: '辅助能量路由器蓝图 L', amount: 2 },
      { name: '放射范围约束装置蓝...', amount: 3 },
      { name: '采矿器循环加速器蓝...', amount: 1 },
      { name: '采矿器距离控制器蓝...', amount: 2 },
    ]);
  });
});

function expectEqual(
  actual: readonly RecognizedItem[],
  expected: readonly Partial<RecognizedItem>[]
) {
  expect(actual).toEqual(expected.map(jasmine.objectContaining));
}

function semanticTester(first: unknown, second: unknown): boolean | void {
  if (typeof first !== 'string' || typeof second !== 'string') {
    return;
  }
  return getCleanText(first) === getCleanText(second);
}

function getCleanText(text: string): string {
  return _.trimEnd(getSemanticIdentifier(text), '.…,·');
}
