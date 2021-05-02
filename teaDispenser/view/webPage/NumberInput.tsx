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

function NumberInput({
  class: className = 'form-control',
  name,
  value,
  placeholder,
  disabled,
  required,
  min,
}: Props) {
  return (
    <input
      class={className}
      style="text-align: right;"
      type="number"
      step="0.1"
      name={name}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      min={min}
    />
  );
}

export default NumberInput;
