import h from 'vhtml';

interface Props {
  readonly class?: string;
  readonly name: string;
  readonly value?: string | number;
  readonly placeholder: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly min: number;
}

function NumberInput(props: Props) {
  return (
    <input class="form-control" style="text-align: right;" type="number" step="0.1" {...props} />
  );
}

export default NumberInput;
