import DispatchView from '../../data/DispatchView';
import { DmvInstallCommandIssuedEvent } from '../../event/Event';
import MessageView from '../../view/message/MessageView';

async function updateOnDmvInstallCommandIssued(
  event: DmvInstallCommandIssuedEvent,
  dispatchMessageView: DispatchView<MessageView>
): Promise<boolean> {
  const { mentionedRoles } = event;
  return dispatchMessageView({
    type: 'BlueFuckeryQueueIntroductionView',
    mentionedRoles,
  });
}

export default updateOnDmvInstallCommandIssued;
