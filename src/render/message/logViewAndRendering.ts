import EventContext from '../../core/EventContext';
import Reader from '../../core/Reader/Reader';
import RenderedMessage from '../../data/RenderedMessage';
import log from '../../external/log';
import MessageView from './view/MessageView';

function logViewAndRendering(
  view: MessageView,
  rendering: RenderedMessage | null
): Reader<EventContext, void> {
  return new Reader(() => {
    if (view.type === 'DetectingItemsView') {
      return;
    }
    return log({
      type: 'view',
      data: view,
    }).sequence(
      log({
        type: 'rendering',
        data: rendering,
      })
    );
  });
}

export default logViewAndRendering;
