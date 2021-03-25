import RenderedWebPage from '../../data/RenderedWebPage';
import viewFleetLootEditor from './viewFleetLootEditor';
import viewIndex from './viewIndex';
import viewInvalidFleetLootEditorInput from './viewInvalidFleetLootEditorInput';
import viewInvalidFleetLootRecord from './viewInvalidFleetLootRecord';
import viewNeederChooser from './viewNeederChooser';
import viewNeedsEditor from './viewNeedsEditor';
import viewPendingFleetLootRecord from './viewPendingFleetLootRecord';
import viewUpdatedConfirmation from './viewUpdatedConfirmation';
import WebPageView from './WebPageView';

function viewWebPage(view: WebPageView): RenderedWebPage {
  switch (view.type) {
    case 'IndexView':
      return {
        html: viewIndex(),
      };
    case 'FleetLootEditorView': {
      const { fleetLoot } = view;
      return {
        html: viewFleetLootEditor(fleetLoot, fleetLootEditorTitle),
      };
    }
    case 'InvalidFleetLootEditorInputView':
      return {
        html: viewInvalidFleetLootEditorInput(fleetLootEditorTitle),
      };
    case 'InvalidFleetLootRecordView':
      return {
        html: viewInvalidFleetLootRecord(fleetLootEditorTitle),
      };
    case 'UpdatedConfirmationView':
      return {
        html: viewUpdatedConfirmation(fleetLootEditorTitle),
      };
    case 'NeederChooserView': {
      const { needsEditorLinks } = view;
      return {
        html: viewNeederChooser(needsEditorTitle, needsEditorLinks),
      };
    }
    case 'PendingFleetLootRecordView':
      return {
        html: viewPendingFleetLootRecord(needsEditorTitle),
      };
    case 'NeedsEditorView': {
      const { itemStacks } = view;
      return {
        html: viewNeedsEditor(needsEditorTitle, itemStacks),
      };
    }
  }
}

const fleetLootEditorTitle = '分赃记录编辑器';
const needsEditorTitle = '需求编辑器';

export default viewWebPage;
