import ItemIcon from '../../data/ItemIcon';
import ItemType from '../../data/ItemType';
import recognizeItemIcon from './recognizeItemIcon';
import getTestImage from './testData/getTestImage';

describe('recognizeItemIcon', () => {
  it('recognizes chn_armor_rig_bp_1', async () => {
    const itemIcon = await run('chn_armor_rig_bp_1.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 2,
    });
  });

  it('recognizes chn_armor_rig_bp_2', async () => {
    const itemIcon = await run('chn_armor_rig_bp_2.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 2,
    });
  });

  it('recognizes chn_armor_rig_bp_3', async () => {
    const itemIcon = await run('chn_armor_rig_bp_3.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_armor_rig_bp_4', async () => {
    const itemIcon = await run('chn_armor_rig_bp_4.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_armor_rig_bp_5', async () => {
    const itemIcon = await run('chn_armor_rig_bp_5.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_armor_rig_bp_6', async () => {
    const itemIcon = await run('chn_armor_rig_bp_6.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_armor_rig_bp_7', async () => {
    const itemIcon = await run('chn_armor_rig_bp_7.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_drone_rig_bp_1', async () => {
    const itemIcon = await run('chn_drone_rig_bp_1.png', 'DroneRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 3,
    });
  });

  it('recognizes chn_drone_rig_bp_2', async () => {
    const itemIcon = await run('chn_drone_rig_bp_2.png', 'DroneRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_drone_rig_bp_3', async () => {
    const itemIcon = await run('chn_drone_rig_bp_3.png', 'DroneRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_drone_rig_bp_4', async () => {
    const itemIcon = await run('chn_drone_rig_bp_4.png', 'DroneRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 2,
    });
  });

  it('recognizes chn_laser_rig_bp_1', async () => {
    const itemIcon = await run('chn_laser_rig_bp_1.png', 'LaserRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_laser_rig_bp_2', async () => {
    const itemIcon = await run('chn_laser_rig_bp_2.png', 'LaserRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_laser_rig_bp_3', async () => {
    const itemIcon = await run('chn_laser_rig_bp_3.png', 'LaserRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_mining_rig_bp_1', async () => {
    const itemIcon = await run('chn_mining_rig_bp_1.png', 'MiningRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_mining_rig_bp_2', async () => {
    const itemIcon = await run('chn_mining_rig_bp_2.png', 'MiningRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_mining_rig_bp_3', async () => {
    const itemIcon = await run('chn_mining_rig_bp_3.png', 'MiningRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 3,
    });
  });

  it('recognizes chn_scan_rig_bp_1', async () => {
    const itemIcon = await run('chn_scan_rig_bp_1.png', 'ScanRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_navigation_bp_1', async () => {
    const itemIcon = await run('chn_navigation_bp_1.png', 'NavigationRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 3,
    });
  });

  it('recognizes chn_navigation_bp_2', async () => {
    const itemIcon = await run('chn_navigation_bp_2.png', 'NavigationRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 2,
    });
  });

  it('recognizes chn_navigation_bp_3', async () => {
    const itemIcon = await run('chn_navigation_bp_3.png', 'NavigationRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_navigation_bp_4', async () => {
    const itemIcon = await run('chn_navigation_bp_4.png', 'NavigationRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_armor_bp_8', async () => {
    const itemIcon = await run('chn_armor_bp_8.png', 'ArmorRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 3,
    });
  });

  it('recognizes chn_engineering_bp_1', async () => {
    const itemIcon = await run('chn_engineering_bp_1.png', 'EngineeringRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 3,
    });
  });

  it('recognizes chn_scan_bp_2', async () => {
    const itemIcon = await run('chn_scan_bp_2.png', 'ScanRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 1,
    });
  });

  it('recognizes chn_scan_bp_3', async () => {
    const itemIcon = await run('chn_scan_bp_3.png', 'ScanRigBlueprint');
    expect(itemIcon).toEqual({
      type: 'BlueprintIcon',
      techLevel: 2,
    });
  });
});

async function run(imageFilename: string, itemType: ItemType): Promise<ItemIcon | null> {
  const image = await getTestImage(`itemStack/${imageFilename}`);
  return recognizeItemIcon(image, itemType);
}
