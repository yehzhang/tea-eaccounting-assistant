import h from 'vhtml';

interface Props {
  readonly children: [string];
}

function SubmitButton({ children }: Props) {
  return (
    <input
      class="btn btn-primary"
      type="submit"
      value={children}
      formmethod="post"
      formenctype="application/x-www-form-urlencoded"
    />
  );
}

export default SubmitButton;
