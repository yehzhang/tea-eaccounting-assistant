import Reader from '../core/Reader/Reader';
import dispatchView from '../render/message/dispatchView';
import MessageRenderingContext from '../render/message/MessageRenderingContext';

function updateOnPinged(): Reader<MessageRenderingContext, boolean> {
  return dispatchView({
    type: 'PongView',
  });
}

export default updateOnPinged;
