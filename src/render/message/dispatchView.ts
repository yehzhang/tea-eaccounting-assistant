import createDispatchView from '../../core/createDispatchView';
import DispatchView from '../../core/DispatchView';
import logViewAndRendering from './logViewAndRendering';
import MessageRenderingContext from './MessageRenderingContext';
import syncRenderedMessage from './syncRenderedMessage';
import MessageView from './view/MessageView';
import viewMessage from './view/viewMessage';

const dispatchView: DispatchView<MessageView, MessageRenderingContext> = createDispatchView(
  viewMessage,
  syncRenderedMessage,
  logViewAndRendering
);

export default dispatchView;
