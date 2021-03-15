import _ from 'lodash';
import splitItemsByNeeds from './splitItemsByNeeds';

describe('splitItemsByNeeds', () => {
  beforeEach(() => {
    spyOn(_, 'sample').and.callFake((values: unknown[]) => values[0]);
  });

  it('works', () => {
    const fleetMembers = ['A', 'B', 'C'];
    const items = [
      { name: '激光炮范围扩大设备 II' },
      { name: '激光炮范围扩大设备 II' },
      { name: '激光炮范围扩大设备 II' },
      { name: '激光炮范围扩大设备 II' },
      { name: '激光炮范围扩大设备 II' },
      { name: '激光炮释放过滤器蓝图 II' },
      { name: '激光炮释放过滤器蓝图 II' },
      { name: '冷凝能量管理单元蓝图 III' },
      { name: '维修增效器蓝图 I' },
      { name: '反爆破聚合器蓝图 II' },
      { name: '反爆破聚合器蓝图 II' },
      { name: '反爆破聚合器蓝图 II' },
      { name: '反电磁聚合器蓝图 III' },
      { name: '反动能聚合器蓝图 II' },
      { name: '反动能聚合器蓝图 II' },
      { name: '反动能聚合器蓝图 II' },
      { name: '锁定系统辅助控制器蓝图 I' },
      { name: '锁定系统辅助控制器蓝图 I' },
      { name: '锁定系统辅助控制器蓝图 I' },
      { name: '引力电容器升级蓝图 II' },
      { name: '引力电容器升级蓝图 II' },
      { name: '引力电容器升级蓝图 II' },
      { name: '放射范围约束装置蓝图 I' },
      { name: '放射范围约束装置蓝图 I' },
      { name: '放射范围约束装置蓝图 I' },
      { name: '采矿器能效提升器蓝图 I' },
      { name: '采矿器循环加速器蓝图 III' },
      { name: '采矿器距离控制器蓝图 I' },
      { name: '采矿器距离控制器蓝图 I' },
      { name: '采矿器距离控制器蓝图 I' },
      { name: '无人机射速加强装置蓝图 I' },
      { name: '无人机射速加强装置蓝图 I' },
      { name: '无人机射速加强装置蓝图 I' },
      { name: '无人机射速加强装置蓝图 II' },
    ];
    const needs = [
      { needer: 'A', item: { name: '激光炮范围扩大设备 II', amount: 5 } },
      { needer: 'A', item: { name: '激光炮释放过滤器蓝图 II', amount: 5 } },
      { needer: 'A', item: { name: '反爆破聚合器蓝图 II', amount: 1 } },

      { needer: 'B', item: { name: '反动能聚合器蓝图 II', amount: 1 } },
      { needer: 'C', item: { name: '反动能聚合器蓝图 II', amount: 1 } },

      { needer: 'B', item: { name: '放射范围约束装置蓝图 I', amount: 10 } },
      { needer: 'C', item: { name: '放射范围约束装置蓝图 I', amount: 10 } },
    ];
    const actual = splitItemsByNeeds(fleetMembers, items, needs);

    expect(actual).toEqual({
      fleetMembersLoot: [
        [
          { name: '激光炮范围扩大设备 II' },
          { name: '激光炮范围扩大设备 II' },
          { name: '激光炮范围扩大设备 II' },
          { name: '激光炮范围扩大设备 II' },
          { name: '激光炮范围扩大设备 II' },
          { name: '激光炮释放过滤器蓝图 II' },
          { name: '激光炮释放过滤器蓝图 II' },
          { name: '反爆破聚合器蓝图 II' },
        ],
        [
          { name: '反动能聚合器蓝图 II' },
          { name: '放射范围约束装置蓝图 I' },
          { name: '放射范围约束装置蓝图 I' },
        ],
        [{ name: '反动能聚合器蓝图 II' }, { name: '放射范围约束装置蓝图 I' }],
      ],
      spareItems: [
        { name: '冷凝能量管理单元蓝图 III' },
        { name: '维修增效器蓝图 I' },
        { name: '反爆破聚合器蓝图 II' },
        { name: '反爆破聚合器蓝图 II' },
        { name: '反电磁聚合器蓝图 III' },
        { name: '反动能聚合器蓝图 II' },
        { name: '锁定系统辅助控制器蓝图 I' },
        { name: '锁定系统辅助控制器蓝图 I' },
        { name: '锁定系统辅助控制器蓝图 I' },
        { name: '引力电容器升级蓝图 II' },
        { name: '引力电容器升级蓝图 II' },
        { name: '引力电容器升级蓝图 II' },
        { name: '采矿器能效提升器蓝图 I' },
        { name: '采矿器循环加速器蓝图 III' },
        { name: '采矿器距离控制器蓝图 I' },
        { name: '采矿器距离控制器蓝图 I' },
        { name: '采矿器距离控制器蓝图 I' },
        { name: '无人机射速加强装置蓝图 I' },
        { name: '无人机射速加强装置蓝图 I' },
        { name: '无人机射速加强装置蓝图 I' },
        { name: '无人机射速加强装置蓝图 II' },
      ],
    });
  });
});
