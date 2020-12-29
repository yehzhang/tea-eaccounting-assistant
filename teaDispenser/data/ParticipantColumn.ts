import ItemRow from './ItemRow';

interface ParticipantColumn {
  readonly columnIndex: number;
  readonly participantName: string;
  readonly items: readonly ItemRow[];
}

export default ParticipantColumn;
