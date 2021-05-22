import Reader from '../../core/Reader/Reader';
import { DmvInstallCommandIssuedEvent } from '../../event/Event';
import dispatchView from '../../render/message/dispatchView';
import MessageRenderingContext from '../../render/message/MessageRenderingContext';

function updateOnDmvInstallCommandIssued(
  event: DmvInstallCommandIssuedEvent
): Reader<MessageRenderingContext, boolean> {
  const { mentionedRoles } = event;
  return dispatchView({
    type: 'BlueFuckeryQueueIntroductionView',
    mentionedRoles,
  });
}

export default updateOnDmvInstallCommandIssued;
