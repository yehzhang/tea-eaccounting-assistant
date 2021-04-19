import DispatchView from '../data/DispatchView';
import MessageView from '../view/message/MessageView';

function updateOnPinged(dispatchView: DispatchView<MessageView>): Promise<boolean> {
  return dispatchView({
    type: 'PongView',
  });
}

export default updateOnPinged;
