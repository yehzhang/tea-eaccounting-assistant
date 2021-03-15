import h from 'vhtml';
import WebPage from './WebPage';

interface Props {
  readonly title: string;
  readonly children: unknown[];
}

function Container({ title, children }: Props): string {
  return (
    <WebPage title={title}>
      <div class="container-md">
        <div class="row">
          <div class="col-lg-8 offset-lg-2 col-xxl-6 offset-xxl-3 my-4">{children}</div>
        </div>
      </div>
      <style>{`
        /* Hide the number input arrows on Chrome, Safari, Edge, and Opera. */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* And on Firefox. */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </WebPage>
  );
}

export default Container;
