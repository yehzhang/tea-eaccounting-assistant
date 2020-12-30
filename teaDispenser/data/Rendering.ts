import RenderedMessage from './RenderedMessage';

type Rendering = RenderedMessage | RenderedReaction;

interface RenderedReaction {
  readonly type: 'RenderedReaction';
  readonly content: string;
}

export default Rendering;
