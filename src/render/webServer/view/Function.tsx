import h from 'vhtml';
import Script from './Script';

interface Props {
  readonly children: Function[];
}

function Function({ children }: Props): string {
  return <Script>{children.map((child) => child.toString())}</Script>;
}

export default Function;
