type ItemIcon = BlueprintIcon;

interface BlueprintIcon {
  readonly type: 'BlueprintIcon';
  readonly techLevel: 1 | 2 | 3 | 4;
}

export default ItemIcon;
