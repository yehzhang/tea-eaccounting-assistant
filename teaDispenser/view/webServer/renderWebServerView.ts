import RenderedWebPage from '../../data/RenderedWebPage';
import renderFleetLootEditor from './renderFleetLootEditor';
import renderFleetLootEditorInvalidInput from './renderFleetLootEditorInvalidInput';
import renderIndex from './renderIndex';
import renderInvalidFleetLootRecord from './renderInvalidFleetLootRecord';
import renderNeederChooser from './renderNeederChooser';
import renderNeedsEditor from './renderNeedsEditor';
import renderPendingFleetLootRecord from './renderPendingFleetLootRecord';
import renderUpdatedConfirmation from './renderUpdatedConfirmation';
import WebServerView from './WebServerView';

function renderWebServerView(state: WebServerView): RenderedWebPage {
  switch (state.type) {
    case 'Index':
      return {
        type: 'RenderedWebPage',
        html: renderIndex(),
      };
    case 'FleetLootEditor': {
      const { fleetLoot } = state;
      return {
        type: 'RenderedWebPage',
        html: renderFleetLootEditor(fleetLoot, fleetLootEditorTitle),
      };
    }
    case 'FleetLootEditorInvalidInput':
      return {
        type: 'RenderedWebPage',
        html: renderFleetLootEditorInvalidInput(fleetLootEditorTitle),
      };
    case 'InvalidFleetLootRecord':
      return {
        type: 'RenderedWebPage',
        html: renderInvalidFleetLootRecord(fleetLootEditorTitle),
      };
    case 'UpdatedConfirmation':
      return {
        type: 'RenderedWebPage',
        html: renderUpdatedConfirmation(fleetLootEditorTitle),
      };
    case 'NeederChooser': {
      const { needsEditorLinks } = state;
      return {
        type: 'RenderedWebPage',
        html: renderNeederChooser(needsEditorTitle, needsEditorLinks),
      };
    }
    case 'PendingFleetLootRecord':
      return {
        type: 'RenderedWebPage',
        html: renderPendingFleetLootRecord(needsEditorTitle),
      };
    case 'NeedsEditor': {
      const { itemStacks } = state;
      return {
        type: 'RenderedWebPage',
        html: renderNeedsEditor(needsEditorTitle, itemStacks),
      };
    }
  }
}

const fleetLootEditorTitle = '分赃记录编辑器';
const needsEditorTitle = '需求编辑器';

export default renderWebServerView;
