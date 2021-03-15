import h from 'vhtml';

interface Props {
  readonly children: any[];
}

function Script({ children }: Props): string {
  return <script dangerouslySetInnerHTML={{ __html: children.flat().join('\n') }}/>;
}

export default Script;
