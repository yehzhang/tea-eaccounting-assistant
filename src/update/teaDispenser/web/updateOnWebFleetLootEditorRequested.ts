import Reader from '../../../core/Reader/Reader';
import MessageContext from '../../../data/MessageContext';
import { WebFleetLootEditorRequestedEvent } from '../../../event/Event';
import MessageRenderingContext from '../../../render/message/MessageRenderingContext';
import dispatchView from '../../../render/webServer/dispatchView';
import WebServerRenderingContext from '../../../render/webServer/WebServerRenderingContext';
import fleetLootRecordReader from './fleetLootRecordReader';

function updateOnWebFleetLootEditorRequested(
  event: WebFleetLootEditorRequestedEvent
): Reader<WebServerRenderingContext & MessageRenderingContext & MessageContext, boolean> {
  const { ie10OrBelow } = event;
  if (ie10OrBelow) {
    return dispatchView({
      type: 'UnsupportedIeBrowserView',
    });
  }

  return fleetLootRecordReader.bind((fleetLootRecord) =>
    dispatchView(
      fleetLootRecord
        ? {
            type: 'FleetLootEditorView',
            ...fleetLootRecord,
          }
        : {
            type: 'InvalidFleetLootRecordView',
          }
    )
  );
}

export default updateOnWebFleetLootEditorRequested;
